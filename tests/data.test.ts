import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { parseCalendarDate as D } from '../src/domain/calendarDate';
import { MiaDB } from '../src/data/db';
import { PeriodRepository, DayLogRepository } from '../src/data/repositories';
import { buildExport, importData, parseExport, toCsv } from '../src/data/exchange';

let a: MiaDB;
let b: MiaDB;
beforeEach(async () => {
  a = new MiaDB('a-' + Math.random());
  b = new MiaDB('b-' + Math.random());
});

describe('repositories', () => {
  it('refuse les doublons de début (index unique)', async () => {
    const r = new PeriodRepository(a);
    expect((await r.save({ startDate: D('2026-10-03') })).ok).toBe(true);
    expect((await r.save({ startDate: D('2026-10-03') })).ok).toBe(false);
  });
  it('modifie, exclut et supprime', async () => {
    const r = new PeriodRepository(a);
    await r.save({ startDate: D('2026-10-03') });
    await r.save({ startDate: D('2026-10-04'), endDate: D('2026-10-08') }, D('2026-10-03'));
    expect((await r.all()).map((p) => p.startDate)).toEqual(['2026-10-04']);
    await r.setExcluded(D('2026-10-04'), true);
    expect((await r.all())[0].excluded).toBe(true);
    const removed = await r.remove(D('2026-10-04'));
    expect(await r.all()).toHaveLength(0);
    if (removed.ok && removed.value) {
      await r.restore(removed.value);
      expect(await r.all()).toHaveLength(1);
    }
  });
  it('supprime un journal vide', async () => {
    const l = new DayLogRepository(a);
    await l.save(D('2026-10-03'), { symptoms: ['cramps'] });
    expect(await l.get(D('2026-10-03'))).toBeTruthy();
    await l.save(D('2026-10-03'), { symptoms: [] });
    expect(await l.get(D('2026-10-03'))).toBeUndefined();
  });
});

describe('export / import', () => {
  it('T13 : aller-retour vers un appareil vierge', async () => {
    await new PeriodRepository(a).save({ startDate: D('2026-10-03'), endDate: D('2026-10-07') });
    await new DayLogRepository(a).save(D('2026-10-03'), { flow: 'medium', symptoms: ['cramps'], note: 'ok, "test"' });
    const text = JSON.stringify(await buildExport(a));
    const parsed = parseExport(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect((await importData(parsed.value, 'replace', b)).ok).toBe(true);
    const out = await buildExport(b);
    const src = await buildExport(a);
    expect(out.periods).toEqual(src.periods);
    expect(out.dayLogs).toEqual(src.dayLogs);
    expect(toCsv(out)).toContain('"ok, ""test"""');
  });
  it('T14 : fichier invalide refusé', () => {
    expect(parseExport('pas du json').ok).toBe(false);
    expect(parseExport('{"format":"autre"}').ok).toBe(false);
    const bad = { format: 'mia-export', formatVersion: 1, exportedAt: 'x', periods: [{ startDate: '2026-02-30' }], dayLogs: [] };
    expect(parseExport(JSON.stringify(bad)).ok).toBe(false);
  });
  it('fusion signale les doublons', async () => {
    await new PeriodRepository(a).save({ startDate: D('2026-10-03') });
    const e = await buildExport(a);
    const r = await importData(e, 'merge', a);
    expect(r.ok && r.value).toEqual({ addedPeriods: 0, duplicates: 1 });
  });
});
