import { averagePeriodLength, computeCycles, recentValidLengths, type PeriodInput } from './cycle';

export interface DayLogInput {
  symptoms: readonly string[];
  energy?: number;
  sleep?: number;
}

export type Insight =
  | { kind: 'cycleStable'; average: number; spread: number }
  | { kind: 'cycleVariable'; average: number; spread: number }
  | { kind: 'periodLength'; average: number }
  | { kind: 'topSymptom'; code: string; days: number }
  | { kind: 'averageEnergy'; value: number }
  | { kind: 'averageSleep'; value: number };

const MIN_LOGGED_DAYS = 3;
const round1 = (n: number) => Math.round(n * 10) / 10;

/** Constats descriptifs sur les données enregistrées. Ce ne sont ni des diagnostics ni des conseils médicaux. */
export function computeInsights(periods: readonly PeriodInput[], logs: readonly DayLogInput[]): Insight[] {
  const out: Insight[] = [];

  const lengths = recentValidLengths(computeCycles(periods));
  if (lengths.length >= 2) {
    const average = Math.round(lengths.reduce((s, n) => s + n, 0) / lengths.length);
    const spread = Math.max(...lengths) - Math.min(...lengths);
    out.push({ kind: spread <= 7 ? 'cycleStable' : 'cycleVariable', average, spread });
  }

  const periodAvg = averagePeriodLength(periods);
  if (periodAvg !== null) out.push({ kind: 'periodLength', average: periodAvg });

  const counts = new Map<string, number>();
  for (const l of logs) for (const s of new Set(l.symptoms)) counts.set(s, (counts.get(s) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
  if (top && top[1] >= MIN_LOGGED_DAYS) out.push({ kind: 'topSymptom', code: top[0], days: top[1] });

  const avg = (vals: number[]) => round1(vals.reduce((s, n) => s + n, 0) / vals.length);
  const energies = logs.map((l) => l.energy).filter((n): n is number => typeof n === 'number');
  if (energies.length >= MIN_LOGGED_DAYS) out.push({ kind: 'averageEnergy', value: avg(energies) });
  const sleeps = logs.map((l) => l.sleep).filter((n): n is number => typeof n === 'number');
  if (sleeps.length >= MIN_LOGGED_DAYS) out.push({ kind: 'averageSleep', value: avg(sleeps) });

  return out;
}
