import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseCalendarDate as D } from '../src/domain/calendarDate';
import { MiaDB } from '../src/data/db';
import { PeriodRepository } from '../src/data/repositories';
import { AUTO_LOCK_MS, Vault } from '../src/data/vault';

let d: MiaDB;
let v: Vault;
beforeEach(async () => {
  d = new MiaDB('v-' + Math.random());
  v = new Vault(d, 1000); // itérations réduites pour les tests
  await v.init();
  await new PeriodRepository(d).save({ startDate: D('2026-10-03') });
  await d.dayLogs.put({ date: D('2026-10-03'), symptoms: ['cramps'], note: 'secret', updatedAt: 'x' });
});

describe('verrouillage (T15)', () => {
  it('refuse un PIN invalide', async () => {
    expect((await v.enable('12')).ok).toBe(false);
    expect((await v.enable('abcd')).ok).toBe(false);
    expect(v.getStatus()).toBe('disabled');
  });

  it('les données stockées sont illisibles sans le code', async () => {
    expect((await v.enable('1234')).ok).toBe(true);
    expect((await v.lock()).ok).toBe(true);
    expect(v.getStatus()).toBe('locked');
    expect(await d.periods.count()).toBe(0);
    expect(await d.dayLogs.count()).toBe(0);
    const raw = JSON.stringify(await d.meta.toArray());
    expect(raw).not.toContain('2026-10-03');
    expect(raw).not.toContain('secret');
  });

  it('mauvais PIN refusé, bon PIN restaure les données', async () => {
    await v.enable('1234');
    await v.lock();
    const bad = await v.unlock('9999');
    expect(bad).toEqual({ ok: false, error: 'wrongPin' });
    expect(v.getStatus()).toBe('locked');
    expect((await v.unlock('1234')).ok).toBe(true);
    expect(v.getStatus()).toBe('unlocked');
    expect((await d.periods.toArray())[0].startDate).toBe('2026-10-03');
    expect((await d.dayLogs.get(D('2026-10-03')))?.note).toBe('secret');
  });

  it('conserve les modifications faites pendant la session', async () => {
    await v.enable('1234');
    await new PeriodRepository(d).save({ startDate: D('2026-11-01') });
    await v.lock();
    await v.unlock('1234');
    expect(await d.periods.count()).toBe(2);
  });

  it('session interrompue : les données en clair plus récentes sont conservées', async () => {
    await v.enable('1234');
    await new PeriodRepository(d).save({ startDate: D('2026-11-01') });
    const v2 = new Vault(d, 1000); // redémarrage sans verrouillage préalable
    await v2.init();
    expect(v2.getStatus()).toBe('locked');
    expect((await v2.unlock('1234')).ok).toBe(true);
    expect(await d.periods.count()).toBe(2);
  });

  it('désactivation', async () => {
    await v.enable('1234');
    expect((await v.disable()).ok).toBe(true);
    expect(v.getStatus()).toBe('disabled');
    expect(await d.meta.get('vault')).toBeUndefined();
    await v.init();
    expect(v.getStatus()).toBe('disabled');
  });

  it('verrouille après 2 minutes en arrière-plan', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    try {
      await v.enable('1234');
      let state: DocumentVisibilityState = 'visible';
      const doc = new EventTarget() as unknown as Document;
      Object.defineProperty(doc, 'visibilityState', { get: () => state });
      v.installAutoLock(doc);
      state = 'hidden';
      doc.dispatchEvent(new Event('visibilitychange'));
      await vi.advanceTimersByTimeAsync(AUTO_LOCK_MS - 1000);
      expect(v.getStatus()).toBe('unlocked');
      await vi.advanceTimersByTimeAsync(2000);
    } finally {
      vi.useRealTimers();
    }
    await vi.waitFor(() => expect(v.getStatus()).toBe('locked'));
  });
});
