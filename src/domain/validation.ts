import { CYCLE_CONFIG as C } from './cycle.config';
import { type CalendarDate, daysBetween } from './calendarDate';
import { periodLength, sortPeriods, type PeriodInput } from './cycle';

export type ValidationIssue =
  | { level: 'error'; code: 'future' | 'duplicate' | 'endBeforeStart' | 'endInFuture' }
  | { level: 'confirm'; code: 'closeToExisting' | 'longPeriod' | 'atypicalCycle'; existing?: CalendarDate };

export function validatePeriod(
  candidate: PeriodInput,
  existing: readonly PeriodInput[],
  today: CalendarDate,
  /** Début de l'entrée en cours de modification (ignorée dans les comparaisons). */
  editing?: CalendarDate,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (candidate.startDate > today) issues.push({ level: 'error', code: 'future' });
  if (candidate.endDate) {
    if (candidate.endDate < candidate.startDate) issues.push({ level: 'error', code: 'endBeforeStart' });
    else if (candidate.endDate > today) issues.push({ level: 'error', code: 'endInFuture' });
  }
  const others = existing.filter((p) => p.startDate !== editing);
  if (others.some((p) => p.startDate === candidate.startDate)) {
    issues.push({ level: 'error', code: 'duplicate' });
    return issues;
  }
  const close = others.find((p) => Math.abs(daysBetween(p.startDate, candidate.startDate)) < C.minGapBetweenStarts);
  if (close) issues.push({ level: 'confirm', code: 'closeToExisting', existing: close.startDate });
  const len = periodLength(candidate);
  if (len !== undefined && len > C.periodLengthMax) issues.push({ level: 'confirm', code: 'longPeriod' });
  if (!close) {
    const sorted = sortPeriods([...others, candidate]);
    const i = sorted.findIndex((p) => p.startDate === candidate.startDate);
    const gaps = [sorted[i - 1], sorted[i + 1]]
      .filter((n): n is PeriodInput => Boolean(n))
      .map((n) => Math.abs(daysBetween(n.startDate, candidate.startDate)));
    if (gaps.some((g) => g < C.cycleMin || g > C.cycleMax)) issues.push({ level: 'confirm', code: 'atypicalCycle' });
  }
  return issues;
}
