import { z } from 'zod';
import { isValidCalendarDate, type CalendarDate } from '../domain/calendarDate';
import { db, FLOWS, SYMPTOM_CODES, type MiaDB } from './db';
import { attempt, type Result } from './result';

export const APP_VERSION = '1.0.0';

const dateSchema = z.string().refine(isValidCalendarDate, 'date invalide').transform((s) => s as CalendarDate);

const exportSchema = z.object({
  format: z.literal('mia-export'),
  formatVersion: z.literal(1),
  exportedAt: z.string(),
  appVersion: z.string().optional(),
  periods: z.array(
    z.object({
      startDate: dateSchema,
      endDate: dateSchema.optional(),
      excluded: z.boolean().default(false),
    }),
  ),
  dayLogs: z.array(
    z.object({
      date: dateSchema,
      flow: z.enum(FLOWS as [string, ...string[]]).optional(),
      symptoms: z.array(z.enum(SYMPTOM_CODES)).default([]),
      note: z.string().optional(),
    }),
  ),
  settings: z.record(z.string(), z.unknown()).default({}),
});
export type MiaExport = z.infer<typeof exportSchema>;

export async function buildExport(d: MiaDB = db): Promise<MiaExport> {
  const [periods, dayLogs, settings] = await Promise.all([d.periods.orderBy('startDate').toArray(), d.dayLogs.toArray(), d.settings.toArray()]);
  return {
    format: 'mia-export',
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    periods: periods.map((p) => ({ startDate: p.startDate, endDate: p.endDate, excluded: p.excluded })),
    dayLogs: dayLogs.map((l) => ({ date: l.date, flow: l.flow, symptoms: l.symptoms, note: l.note ?? '' })),
    settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
  };
}

const csvCell = (v: string) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Export CSV lisible dans un tableur : une ligne par règles et par jour de journal. */
export function toCsv(e: MiaExport): string {
  const rows: string[][] = [['type', 'date', 'fin', 'flux', 'symptomes', 'note']];
  for (const p of e.periods) rows.push(['regles', p.startDate, p.endDate ?? '', '', '', '']);
  for (const l of e.dayLogs) rows.push(['journal', l.date, '', l.flow ?? '', l.symptoms.join(' '), l.note ?? '']);
  return rows.map((r) => r.map(csvCell).join(',')).join('\n');
}

export function parseExport(text: string): Result<MiaExport> {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'invalid' };
  }
  const r = exportSchema.safeParse(json);
  return r.success ? { ok: true, value: r.data } : { ok: false, error: 'invalid' };
}

export type ImportMode = 'merge' | 'replace';
export interface ImportReport {
  addedPeriods: number;
  duplicates: number;
}

/** Import en une seule transaction : tout réussit ou rien n'est modifié. */
export function importData(data: MiaExport, mode: ImportMode, d: MiaDB = db): Promise<Result<ImportReport>> {
  return attempt(() =>
    d.transaction('rw', [d.periods, d.dayLogs, d.settings], async () => {
      if (mode === 'replace') await Promise.all([d.periods.clear(), d.dayLogs.clear()]);
      const known = new Set((await d.periods.toArray()).map((p) => p.startDate));
      const t = new Date().toISOString();
      let added = 0;
      let duplicates = 0;
      for (const p of data.periods) {
        if (known.has(p.startDate)) {
          duplicates++;
          continue;
        }
        known.add(p.startDate);
        await d.periods.add({ id: crypto.randomUUID(), startDate: p.startDate, endDate: p.endDate, excluded: p.excluded, createdAt: t, updatedAt: t });
        added++;
      }
      for (const l of data.dayLogs) {
        if (mode === 'merge' && (await d.dayLogs.get(l.date))) continue;
        await d.dayLogs.put({ date: l.date, flow: l.flow as never, symptoms: l.symptoms, note: l.note || undefined, updatedAt: t });
      }
      if (mode === 'replace') {
        for (const [key, value] of Object.entries(data.settings)) await d.settings.put({ key, value });
      }
      return { addedPeriods: added, duplicates };
    }),
  );
}
