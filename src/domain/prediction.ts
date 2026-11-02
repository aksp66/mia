import { CYCLE_CONFIG as C } from './cycle.config';
import { type CalendarDate, addDays } from './calendarDate';
import { computeCycles, cycleDay, lastStartOf, recentValidLengths, type PeriodInput } from './cycle';

export type PredictionState =
  | { kind: 'AucuneDonnee' }
  | { kind: 'Insuffisant'; missing: number }
  | { kind: 'Estimation'; date: CalendarDate; average: number }
  | { kind: 'Plage'; from: CalendarDate; to: CalendarDate; average: number }
  | { kind: 'Incertain' };

/** Stratégie d'estimation injectable (section 9.1). */
export type PredictionStrategy = (lengths: number[], lastStart: CalendarDate) => PredictionState;

export const simpleAverageStrategy: PredictionStrategy = (recents, lastStart) => {
  const average = Math.round(recents.reduce((s, n) => s + n, 0) / recents.length);
  const min = Math.min(...recents);
  const max = Math.max(...recents);
  const spread = max - min;
  if (spread <= C.regularSpread) return { kind: 'Estimation', date: addDays(lastStart, average), average };
  if (spread <= C.variableSpread) {
    return { kind: 'Plage', from: addDays(lastStart, min), to: addDays(lastStart, max), average };
  }
  return { kind: 'Incertain' };
};

export function predict(
  periods: readonly PeriodInput[],
  strategy: PredictionStrategy = simpleAverageStrategy,
): PredictionState {
  const last = lastStartOf(periods);
  if (!last) return { kind: 'AucuneDonnee' };
  const recents = recentValidLengths(computeCycles(periods));
  if (recents.length < C.predictionThreshold) {
    return { kind: 'Insuffisant', missing: C.predictionThreshold - recents.length };
  }
  return strategy(recents, last);
}

export interface Summary {
  prediction: PredictionState;
  cycleDay: number | null;
  /** La date (ou fin de plage) estimée est dépassée sans nouveau début. */
  overdue: boolean;
  lastStart: CalendarDate | null;
}

export function summarize(periods: readonly PeriodInput[], today: CalendarDate): Summary {
  const prediction = predict(periods);
  const lastStart = lastStartOf(periods);
  const end =
    prediction.kind === 'Estimation' ? prediction.date : prediction.kind === 'Plage' ? prediction.to : null;
  return {
    prediction,
    lastStart,
    cycleDay: lastStart ? cycleDay(lastStart, today) : null,
    overdue: end !== null && today > end,
  };
}

/**
 * Jours estimés à marquer sur le calendrier : la date ou la plage de début. La durée moyenne des règles
 * (`periodLen`, fournie seulement si au moins 3 dates de fin sont renseignées) prolonge la dernière date.
 */
export function estimatedDays(p: PredictionState, periodLen: number | null = null): CalendarDate[] {
  const extra = periodLen && periodLen > 1 ? periodLen - 1 : 0;
  let from: CalendarDate;
  let to: CalendarDate;
  if (p.kind === 'Estimation') {
    from = to = p.date;
  } else if (p.kind === 'Plage') {
    from = p.from;
    to = p.to;
  } else {
    return [];
  }
  const out: CalendarDate[] = [];
  for (let d = from; d <= addDays(to, extra); d = addDays(d, 1)) out.push(d);
  return out;
}
