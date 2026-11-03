import { useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { format, parseISO } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import { db } from '../data/db';
import { settingsRepo } from '../data/repositories';
import type { CalendarDate } from '../domain/calendarDate';

export type Theme = 'auto' | 'light' | 'dark';

export const usePeriods = () => useLiveQuery(() => db.periods.orderBy('startDate').toArray(), []);
export const useDayLogs = () => useLiveQuery(() => db.dayLogs.toArray(), []);

/** Réglage réactif : `undefined` pendant le chargement. */
export function useSetting<T>(key: string, fallback: T): [T | undefined, (v: T) => Promise<void>] {
  const row = useLiveQuery(async () => ({ v: (await db.settings.get(key))?.value as T | undefined }), [key]);
  const set = useCallback(
    async (v: T) => {
      await settingsRepo.set(key, v);
    },
    [key],
  );
  return [row ? (row.v ?? fallback) : undefined, set];
}

export const fmtLong = (d: CalendarDate | string) => format(parseISO(d), 'd MMMM yyyy', { locale: frLocale });
export const fmtShort = (d: CalendarDate | string) => format(parseISO(d), 'd MMM', { locale: frLocale });
