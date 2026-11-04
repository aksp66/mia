import { CYCLE_CONFIG as C } from './cycle.config';
import { type CalendarDate, compareDates, daysBetween } from './calendarDate';

export interface PeriodInput {
  startDate: CalendarDate;
  endDate?: CalendarDate;
  excluded?: boolean;
}

export interface Cycle {
  startDate: CalendarDate;
  nextStartDate: CalendarDate;
  length: number;
  /** Dans la plage plausible et non exclu : pris en compte dans les moyennes. */
  valid: boolean;
  atypical: boolean;
  periodLength?: number;
}

export function sortPeriods<T extends PeriodInput>(periods: readonly T[]): T[] {
  return [...periods].sort((a, b) => compareDates(a.startDate, b.startDate));
}

export function periodLength(p: PeriodInput): number | undefined {
  if (!p.endDate) return undefined;
  const n = daysBetween(p.startDate, p.endDate) + 1;
  return n >= 1 ? n : undefined;
}

/** Cycles calculés entre débuts consécutifs (non stockés, recalculés à chaque lecture). */
export function computeCycles(periods: readonly PeriodInput[]): Cycle[] {
  const sorted = sortPeriods(periods);
  const out: Cycle[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const length = daysBetween(a.startDate, b.startDate);
    const plausible = length >= C.cycleMin && length <= C.cycleMax;
    out.push({
      startDate: a.startDate,
      nextStartDate: b.startDate,
      length,
      valid: plausible && !a.excluded,
      atypical: !plausible,
      periodLength: periodLength(a),
    });
  }
  return out;
}

/** Jour du cycle (1 à 90) ou null si non calculable. */
export function cycleDay(lastStart: CalendarDate, todayDate: CalendarDate): number | null {
  const n = daysBetween(lastStart, todayDate) + 1;
  return n >= 1 && n <= C.maxCycleDay ? n : null;
}

export function recentValidLengths(cycles: readonly Cycle[]): number[] {
  return cycles
    .filter((c) => c.valid)
    .slice(-C.window)
    .map((c) => c.length);
}

/** Jour des règles (1 = premier jour) si la dernière période est en cours, sinon null. */
export function periodDay(periods: readonly PeriodInput[], todayDate: CalendarDate): number | null {
  const sorted = sortPeriods(periods);
  const last = sorted[sorted.length - 1];
  if (!last) return null;
  const n = daysBetween(last.startDate, todayDate) + 1;
  if (n < 1) return null;
  if (last.endDate) return todayDate <= last.endDate ? n : null;
  return n <= C.openPeriodDays ? n : null;
}

export function averagePeriodLength(periods: readonly PeriodInput[]): number | null {
  const lens = periods.map(periodLength).filter((n): n is number => n !== undefined);
  if (lens.length < C.minEndDatesForPeriodLength) return null;
  return Math.round(lens.reduce((s, n) => s + n, 0) / lens.length);
}

export function lastStartOf(periods: readonly PeriodInput[]): CalendarDate | null {
  const s = sortPeriods(periods);
  return s.length ? s[s.length - 1].startDate : null;
}
