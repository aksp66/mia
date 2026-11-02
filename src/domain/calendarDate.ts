/** Date calendaire « AAAA-MM-JJ », sans heure ni fuseau (section 6.4). */
export type CalendarDate = string & { readonly __brand: 'CalendarDate' };

const RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isValidCalendarDate(s: unknown): s is CalendarDate {
  if (typeof s !== 'string') return false;
  const m = RE.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = new Date(Date.UTC(y, mo - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === mo - 1 && t.getUTCDate() === d;
}

export function parseCalendarDate(s: string): CalendarDate {
  if (!isValidCalendarDate(s)) throw new Error(`Date invalide : ${s}`);
  return s;
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

export function fromParts(y: number, m: number, d: number): CalendarDate {
  return parseCalendarDate(`${pad(y, 4)}-${pad(m)}-${pad(d)}`);
}

/** Date du jour construite à partir des composantes locales de l'appareil. */
export function today(now: Date = new Date()): CalendarDate {
  return fromParts(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function toUtcMs(d: CalendarDate): number {
  return Date.UTC(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10)));
}

/** Nombre de jours entre a et b (b - a), calculé en UTC. */
export function daysBetween(a: CalendarDate, b: CalendarDate): number {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / 86_400_000);
}

export function addDays(d: CalendarDate, n: number): CalendarDate {
  const t = new Date(toUtcMs(d) + n * 86_400_000);
  return fromParts(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export const compareDates = (a: CalendarDate, b: CalendarDate) => (a < b ? -1 : a > b ? 1 : 0);
