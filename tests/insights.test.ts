import { describe, expect, it } from 'vitest';
import { parseCalendarDate as D } from '../src/domain/calendarDate';
import { computeInsights } from '../src/domain/insights';

const starts = (...s: string[]) => s.map((startDate) => ({ startDate: D(startDate) }));

describe('analyses textuelles', () => {
  it('aucune donnée : aucun constat', () => {
    expect(computeInsights([], [])).toEqual([]);
  });
  it('cycles stables', () => {
    const r = computeInsights(starts('2026-01-01', '2026-01-29', '2026-02-26'), []);
    expect(r).toEqual([{ kind: 'cycleStable', average: 28, spread: 0 }]);
  });
  it('cycles variables', () => {
    const r = computeInsights(starts('2026-01-01', '2026-01-26', '2026-02-26', '2026-03-31'), []);
    expect(r[0]).toMatchObject({ kind: 'cycleVariable', spread: 8 });
  });
  it('durée moyenne des règles si au moins 3 dates de fin', () => {
    const p = [
      { startDate: D('2026-01-01'), endDate: D('2026-01-05') },
      { startDate: D('2026-02-01'), endDate: D('2026-02-05') },
      { startDate: D('2026-03-01'), endDate: D('2026-03-05') },
    ];
    expect(computeInsights(p, []).some((i) => i.kind === 'periodLength')).toBe(true);
  });
  it('symptôme le plus noté, énergie et sommeil moyens (seuil de 3 jours)', () => {
    const logs = [
      { symptoms: ['cramps', 'fatigue'], energy: 2, sleep: 4 },
      { symptoms: ['cramps'], energy: 3, sleep: 4 },
      { symptoms: ['cramps', 'cramps'], energy: 4, sleep: 5 },
    ];
    const r = computeInsights([], logs);
    expect(r).toContainEqual({ kind: 'topSymptom', code: 'cramps', days: 3 });
    expect(r).toContainEqual({ kind: 'averageEnergy', value: 3 });
    expect(r).toContainEqual({ kind: 'averageSleep', value: 4.3 });
    expect(computeInsights([], logs.slice(0, 2))).toEqual([]);
  });
});
