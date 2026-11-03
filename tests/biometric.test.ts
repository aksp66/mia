import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { parseCalendarDate as D } from '../src/domain/calendarDate';
import { MiaDB } from '../src/data/db';
import { PeriodRepository } from '../src/data/repositories';
import { Vault } from '../src/data/vault';
import type { BiometricProvider } from '../src/data/biometric';

/** Authentificateur simulé : le secret dépend du sel, comme une sortie PRF. */
function fakeProvider(opts: { prf?: boolean; fail?: boolean } = {}): BiometricProvider {
  return {
    isAvailable: async () => true,
    create: async () => ({ credentialId: new Uint8Array([1, 2, 3]), prf: opts.prf ?? true }),
    secret: async (_id, salt) => {
      if (opts.fail) throw new Error('cancelled');
      const out = new Uint8Array(32);
      for (let i = 0; i < 32; i++) out[i] = salt[i] ^ 0x5a;
      return out;
    },
  };
}

let d: MiaDB;
beforeEach(async () => {
  d = new MiaDB('b-' + Math.random());
  await new PeriodRepository(d).save({ startDate: D('2026-10-03') });
});

async function setup(p: BiometricProvider) {
  const v = new Vault(d, 1000, p);
  await v.init();
  await v.enable('1234');
  return v;
}

describe('empreinte', () => {
  it('déverrouille sans saisir le PIN', async () => {
    const v = await setup(fakeProvider());
    expect((await v.enableBiometric('1234')).ok).toBe(true);
    expect(await v.biometricEnabled()).toBe(true);
    await v.lock();
    expect(v.getStatus()).toBe('locked');
    expect((await v.unlockWithBiometric()).ok).toBe(true);
    expect(v.getStatus()).toBe('unlocked');
    expect(await d.periods.count()).toBe(1);
  });

  it('le PIN n\'est jamais stocké en clair', async () => {
    const v = await setup(fakeProvider());
    await v.enableBiometric('1234');
    const raw = JSON.stringify((await d.meta.get('bio'))?.value);
    expect(raw).not.toContain('1234');
  });

  it('exige le bon PIN pour activer', async () => {
    const v = await setup(fakeProvider());
    expect(await v.enableBiometric('0000')).toEqual({ ok: false, error: 'wrongPin' });
    expect(await v.biometricEnabled()).toBe(false);
  });

  it('refuse si l\'appareil ne gère pas PRF', async () => {
    const v = await setup(fakeProvider({ prf: false }));
    expect(await v.enableBiometric('1234')).toEqual({ ok: false, error: 'unsupported' });
    expect(await v.biometricEnabled()).toBe(false);
  });

  it('reste verrouillé si la vérification échoue ou est annulée', async () => {
    const v = await setup(fakeProvider());
    await v.enableBiometric('1234');
    await v.lock();
    const v2 = new Vault(d, 1000, fakeProvider({ fail: true }));
    await v2.init();
    expect((await v2.unlockWithBiometric()).ok).toBe(false);
    expect(v2.getStatus()).toBe('locked');
  });

  it('désactiver le verrou supprime l\'empreinte', async () => {
    const v = await setup(fakeProvider());
    await v.enableBiometric('1234');
    await v.disable();
    expect(await v.biometricEnabled()).toBe(false);
  });
});
