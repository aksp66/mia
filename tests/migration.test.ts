import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { MiaDB } from '../src/data/db';

/** T22 : une base créée avec la version 1 du schéma est ouverte par le code courant sans perte de données. */
describe('migration du schéma (T22)', () => {
  it('conserve toutes les données d\'une base existante', async () => {
    const name = 'mig-' + Math.random();
    const old = new Dexie(name);
    old.version(1).stores({ periods: 'id, &startDate', dayLogs: 'date', settings: 'key', meta: 'key' });
    await old.open();
    await old.table('periods').add({ id: 'p1', startDate: '2026-10-03', excluded: false, createdAt: 'x', updatedAt: 'x' });
    await old.table('dayLogs').add({ date: '2026-10-03', symptoms: ['cramps'], updatedAt: 'x' });
    await old.table('settings').add({ key: 'discreet', value: true });
    await old.table('meta').add({ key: 'installDate', value: 'x' });
    old.close();

    const current = new MiaDB(name);
    await current.open();
    expect(await current.periods.count()).toBe(1);
    expect((await current.dayLogs.get('2026-10-03' as never))?.symptoms).toEqual(['cramps']);
    expect((await current.settings.get('discreet'))?.value).toBe(true);
    expect((await current.meta.get('installDate'))?.value).toBe('x');
  });
});
