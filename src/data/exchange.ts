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
      energy: z.number().int().min(1).max(5).optional(),
      sleep: z.number().int().min(1).max(5).optional(),
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
    dayLogs: dayLogs.map((l) => ({ date: l.date, flow: l.flow, symptoms: l.symptoms, energy: l.energy, sleep: l.sleep, note: l.note ?? '' })),
    settings: Object.fromEntries(settings.map((s) => [s.key, s.value])),
  };
}

const csvCell = (v: string) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Export CSV lisible dans un tableur : une ligne par règles et par jour de journal. */
export function toCsv(e: MiaExport): string {
  const rows: string[][] = [['type', 'date', 'fin', 'flux', 'symptomes', 'energie', 'sommeil', 'note']];
  for (const p of e.periods) rows.push(['regles', p.startDate, p.endDate ?? '', '', '', '', '', '']);
  for (const l of e.dayLogs) rows.push(['journal', l.date, '', l.flow ?? '', l.symptoms.join(' '), String(l.energy ?? ''), String(l.sleep ?? ''), l.note ?? '']);
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
        await d.dayLogs.put({ date: l.date, flow: l.flow as never, symptoms: l.symptoms, energy: l.energy, sleep: l.sleep, note: l.note || undefined, updatedAt: t });
      }
      if (mode === 'replace') {
        for (const [key, value] of Object.entries(data.settings)) await d.settings.put({ key, value });
      }
      return { addedPeriods: added, duplicates };
    }),
  );
}

// — Sauvegarde chiffrée (mot de passe choisi par l'utilisatrice ; rien ne quitte l'appareil, aucun serveur) —

export const MIN_PASSPHRASE = 8;
const ENC_FORMAT = 'mia-export-encrypted';

interface EncryptedFile {
  format: typeof ENC_FORMAT;
  formatVersion: 1;
  kdf: 'PBKDF2-SHA256';
  iterations: number;
  salt: string;
  iv: string;
  data: string;
}

const te = new TextEncoder();
const b64 = (u: Uint8Array) => {
  let s = '';
  for (const b of u) s += String.fromCharCode(b);
  return btoa(s);
};
const unb64 = (s: string): Uint8Array<ArrayBuffer> => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function passKey(pass: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', te.encode(pass), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function encryptExport(text: string, pass: string, iterations = 310_000): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await passKey(pass, salt, iterations);
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, te.encode(text)));
  const file: EncryptedFile = { format: ENC_FORMAT, formatVersion: 1, kdf: 'PBKDF2-SHA256', iterations, salt: b64(salt), iv: b64(iv), data: b64(data) };
  return JSON.stringify(file);
}

export function isEncryptedExport(text: string): boolean {
  try {
    return (JSON.parse(text) as { format?: string }).format === ENC_FORMAT;
  } catch {
    return false;
  }
}

/** Déchiffre un fichier `mia-export-encrypted` ; erreur `wrongPassphrase` si le mot de passe ou le fichier est incorrect. */
export async function decryptExport(text: string, pass: string): Promise<Result<string>> {
  try {
    const f = JSON.parse(text) as EncryptedFile;
    if (f.format !== ENC_FORMAT || f.formatVersion !== 1 || !Number.isInteger(f.iterations) || f.iterations < 1) throw new Error('invalid');
    const key = await passKey(pass, unb64(f.salt), f.iterations);
    const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(f.iv) }, key, unb64(f.data));
    return { ok: true, value: new TextDecoder().decode(buf) };
  } catch {
    return { ok: false, error: 'wrongPassphrase' };
  }
}
