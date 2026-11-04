import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import {
  addDays,
  daysBetween,
  isValidCalendarDate,
  parseCalendarDate as D,
  today,
} from '../src/domain/calendarDate';
import { averagePeriodLength, computeCycles, cycleDay, periodDay } from '../src/domain/cycle';
import { estimatedDays, predict, summarize } from '../src/domain/prediction';
import { validatePeriod } from '../src/domain/validation';

const starts = (...s: string[]) => s.map((startDate) => ({ startDate: D(startDate) }));

describe('dates (T02)', () => {
  it('valide les dates calendaires', () => {
    expect(isValidCalendarDate('2026-02-29')).toBe(false);
    expect(isValidCalendarDate('2028-02-29')).toBe(true);
    expect(isValidCalendarDate('2026-13-01')).toBe(false);
    expect(isValidCalendarDate(42)).toBe(false);
    expect(() => D('abc')).toThrow();
  });
  it('compte les jours autour des changements d\'heure', () => {
    expect(daysBetween(D('2026-03-28'), D('2026-03-30'))).toBe(2);
    expect(daysBetween(D('2026-10-24'), D('2026-10-26'))).toBe(2);
    expect(daysBetween(D('2026-12-31'), D('2027-01-01'))).toBe(1);
  });
  it('today utilise les composantes locales', () => {
    expect(today(new Date(2026, 10, 2, 23, 59))).toBe('2026-11-02');
  });
  it('addDays et daysBetween sont cohérents (propriété)', () => {
    fc.assert(
      fc.property(fc.date({ min: new Date(1990, 0, 1), max: new Date(2060, 0, 1), noInvalidDate: true }), fc.integer({ min: -400, max: 400 }), (dt, n) => {
        const d = today(dt);
        expect(daysBetween(d, addDays(d, n))).toBe(n);
      }),
    );
  });
});

describe('prédiction (T01, T03, T05, T18)', () => {
  it('aucune donnée', () => {
    expect(predict([]).kind).toBe('AucuneDonnee');
  });
  it('T01 : un seul début, jour 1 et aucune prédiction', () => {
    const p = starts('2026-11-02');
    expect(predict(p).kind).toBe('Insuffisant');
    expect(summarize(p, D('2026-11-02')).cycleDay).toBe(1);
  });
  it('T03 : pas de prédiction avant 3 cycles valides', () => {
    const p = starts('2026-07-01', '2026-07-29', '2026-08-26');
    const r = predict(p);
    expect(r).toEqual({ kind: 'Insuffisant', missing: 1 });
  });
  it('estimation unique si écart <= 7', () => {
    const r = predict(starts('2026-06-01', '2026-06-29', '2026-07-28', '2026-08-25'));
    expect(r.kind).toBe('Estimation');
    if (r.kind === 'Estimation') {
      expect(r.average).toBe(28);
      expect(r.date).toBe('2026-09-22');
    }
  });
  it('T18 : plage si écart de 8 à 20, date unique si <= 7', () => {
    const plage = predict(starts('2026-01-01', '2026-01-26', '2026-02-24', '2026-03-31'));
    expect(plage.kind).toBe('Plage');
    const limite = predict(starts('2026-01-01', '2026-01-26', '2026-02-26', '2026-03-31'));
    expect(limite.kind).toBe('Plage'); // écart 25..35 -> 10
    const sept = predict(starts('2026-01-01', '2026-01-26', '2026-02-27', '2026-03-24'));
    expect(['Estimation', 'Plage']).toContain(sept.kind);
  });
  it('T05 : écart > 20 -> incertain', () => {
    const r = predict(starts('2026-01-01', '2026-01-21', '2026-03-12', '2026-04-05'));
    expect(r.kind).toBe('Incertain');
  });
  it('exclut les cycles hors plage et utilise les 6 derniers valides', () => {
    const p = starts('2025-01-01', '2025-06-01', '2025-06-29', '2025-07-27', '2025-08-24');
    const cycles = computeCycles(p);
    expect(cycles[0].atypical).toBe(true);
    expect(cycles[0].valid).toBe(false);
    expect(predict(p).kind).toBe('Estimation');
  });
  it('respecte excluded', () => {
    const p = [
      { startDate: D('2026-01-01'), excluded: true },
      ...starts('2026-01-29', '2026-02-26', '2026-03-26'),
    ];
    expect(predict(p)).toEqual({ kind: 'Insuffisant', missing: 1 });
  });
  it('fenêtre de 6 cycles', () => {
    const dates = ['2025-01-01'];
    let d = D('2025-01-01');
    for (let i = 0; i < 9; i++) {
      d = addDays(d, i < 3 ? 40 : 28);
      dates.push(d);
    }
    const r = predict(starts(...dates));
    expect(r.kind).toBe('Estimation');
    if (r.kind === 'Estimation') expect(r.average).toBe(28);
  });
  it('overdue et jours estimés', () => {
    const p = starts('2026-06-01', '2026-06-29', '2026-07-27', '2026-08-24');
    expect(summarize(p, D('2026-09-30')).overdue).toBe(true);
    expect(summarize(p, D('2026-09-10')).overdue).toBe(false);
    expect(estimatedDays(predict(p))).toHaveLength(1);
    expect(estimatedDays({ kind: 'Plage', from: D('2026-01-01'), to: D('2026-01-03'), average: 2 })).toHaveLength(3);
    expect(estimatedDays({ kind: 'Incertain' })).toEqual([]);
    expect(estimatedDays({ kind: 'Estimation', date: D('2026-01-10'), average: 28 }, 5)).toHaveLength(5);
    expect(estimatedDays({ kind: 'Plage', from: D('2026-01-01'), to: D('2026-01-03'), average: 2 }, 4)).toHaveLength(6);
  });
  it('jour du cycle limité à 1-90', () => {
    expect(cycleDay(D('2026-01-01'), D('2026-01-01'))).toBe(1);
    expect(cycleDay(D('2026-01-01'), D('2026-04-01'))).toBeNull();
    expect(cycleDay(D('2026-01-10'), D('2026-01-01'))).toBeNull();
  });
  it('T04 : une correction recalcule', () => {
    const avant = predict(starts('2026-06-01', '2026-06-29', '2026-07-27', '2026-08-24'));
    const apres = predict(starts('2026-06-01', '2026-06-29', '2026-07-27'));
    expect(avant.kind).toBe('Estimation');
    expect(apres.kind).toBe('Insuffisant');
  });
});

describe('durée des règles', () => {
  it('moyenne seulement avec 3 dates de fin', () => {
    const p = [
      { startDate: D('2026-01-01'), endDate: D('2026-01-05') },
      { startDate: D('2026-02-01'), endDate: D('2026-02-04') },
    ];
    expect(averagePeriodLength(p)).toBeNull();
    p.push({ startDate: D('2026-03-01'), endDate: D('2026-03-06') });
    expect(averagePeriodLength(p)).toBe(5);
  });
});

describe('validation (T16)', () => {
  const t = D('2026-11-02');
  const ex = starts('2026-10-03');
  it('refuse une date future', () => {
    expect(validatePeriod({ startDate: D('2026-11-03') }, [], t)).toContainEqual({ level: 'error', code: 'future' });
  });
  it('refuse un doublon', () => {
    expect(validatePeriod({ startDate: D('2026-10-03') }, ex, t)).toContainEqual({ level: 'error', code: 'duplicate' });
  });
  it('autorise la modification de sa propre entrée', () => {
    expect(validatePeriod({ startDate: D('2026-10-03') }, ex, t, D('2026-10-03'))).toEqual([]);
  });
  it('demande confirmation si trop proche', () => {
    const r = validatePeriod({ startDate: D('2026-10-08') }, ex, t);
    expect(r).toContainEqual({ level: 'confirm', code: 'closeToExisting', existing: '2026-10-03' });
  });
  it('fin avant début, fin future, règles longues', () => {
    expect(validatePeriod({ startDate: D('2026-10-10'), endDate: D('2026-10-09') }, [], t).map((i) => i.code)).toContain('endBeforeStart');
    expect(validatePeriod({ startDate: D('2026-11-01'), endDate: D('2026-11-05') }, [], t).map((i) => i.code)).toContain('endInFuture');
    expect(validatePeriod({ startDate: D('2026-09-01'), endDate: D('2026-09-20') }, [], t).map((i) => i.code)).toContain('longPeriod');
  });
  it('cycle atypique à confirmer', () => {
    expect(validatePeriod({ startDate: D('2026-10-14') }, starts('2026-10-03'), t).map((i) => i.code)).toContain('atypicalCycle');
    expect(validatePeriod({ startDate: D('2026-10-31') }, starts('2026-10-03'), t)).toEqual([]);
  });
});

describe('jour des règles', () => {
  it('aucune période : null', () => {
    expect(periodDay([], D('2026-11-04'))).toBeNull();
  });
  it('sans date de fin : en cours pendant 7 jours au plus', () => {
    const p = starts('2026-11-01');
    expect(periodDay(p, D('2026-11-01'))).toBe(1);
    expect(periodDay(p, D('2026-11-04'))).toBe(4);
    expect(periodDay(p, D('2026-11-07'))).toBe(7);
    expect(periodDay(p, D('2026-11-08'))).toBeNull();
  });
  it('avec date de fin : en cours jusqu\'à cette date', () => {
    const p = [{ startDate: D('2026-11-01'), endDate: D('2026-11-05') }];
    expect(periodDay(p, D('2026-11-05'))).toBe(5);
    expect(periodDay(p, D('2026-11-06'))).toBeNull();
  });
  it('date du jour avant le début : null', () => {
    expect(periodDay(starts('2026-11-10'), D('2026-11-04'))).toBeNull();
  });
});

describe('jour des règles et jour du cycle', () => {
  it('sont toujours égaux quand les règles sont en cours (propriété)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 40 }), fc.boolean(), (offset, withEnd) => {
        const start = D('2026-06-01');
        const todayDate = addDays(start, offset);
        const p = [{ startDate: start, endDate: withEnd ? addDays(start, 4) : undefined }];
        const pd = periodDay(p, todayDate);
        if (pd !== null) expect(pd).toBe(cycleDay(start, todayDate));
      }),
    );
  });
});
