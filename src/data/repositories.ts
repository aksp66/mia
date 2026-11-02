import type { CalendarDate } from '../domain/calendarDate';
import { db, type DayLogRow, type Flow, type MiaDB, type PeriodRow, type SymptomCode } from './db';
import { attempt, type Result } from './result';

const now = () => new Date().toISOString();

export interface PeriodInputData {
  startDate: CalendarDate;
  endDate?: CalendarDate;
}

export class PeriodRepository {
  constructor(private readonly d: MiaDB = db) {}

  all(): Promise<PeriodRow[]> {
    return this.d.periods.orderBy('startDate').toArray();
  }

  /** Crée ou met à jour une entrée ; `previousStart` identifie l'entrée modifiée. */
  save(data: PeriodInputData, previousStart?: CalendarDate): Promise<Result<PeriodRow>> {
    return attempt(() =>
      this.d.transaction('rw', this.d.periods, async () => {
        const existing = previousStart ? await this.d.periods.where('startDate').equals(previousStart).first() : undefined;
        const t = now();
        const row: PeriodRow = existing
          ? { ...existing, startDate: data.startDate, endDate: data.endDate, updatedAt: t }
          : { id: crypto.randomUUID(), startDate: data.startDate, endDate: data.endDate, excluded: false, createdAt: t, updatedAt: t };
        await this.d.periods.put(row);
        return row;
      }),
    );
  }

  setExcluded(startDate: CalendarDate, excluded: boolean): Promise<Result<void>> {
    return attempt(async () => {
      await this.d.periods.where('startDate').equals(startDate).modify({ excluded, updatedAt: now() });
    });
  }

  remove(startDate: CalendarDate): Promise<Result<PeriodRow | undefined>> {
    return attempt(async () => {
      const row = await this.d.periods.where('startDate').equals(startDate).first();
      if (row) await this.d.periods.delete(row.id);
      return row;
    });
  }

  restore(row: PeriodRow): Promise<Result<void>> {
    return attempt(async () => {
      await this.d.periods.put(row);
    });
  }
}

export interface DayLogData {
  flow?: Flow;
  symptoms: SymptomCode[];
  note?: string;
}

export class DayLogRepository {
  constructor(private readonly d: MiaDB = db) {}

  all(): Promise<DayLogRow[]> {
    return this.d.dayLogs.toArray();
  }
  get(date: CalendarDate): Promise<DayLogRow | undefined> {
    return this.d.dayLogs.get(date);
  }
  save(date: CalendarDate, data: DayLogData): Promise<Result<void>> {
    return attempt(async () => {
      const empty = !data.flow && data.symptoms.length === 0 && !data.note?.trim();
      if (empty) await this.d.dayLogs.delete(date);
      else await this.d.dayLogs.put({ date, ...data, note: data.note?.trim() || undefined, updatedAt: now() });
    });
  }
  remove(date: CalendarDate): Promise<Result<void>> {
    return attempt(() => this.d.dayLogs.delete(date));
  }
}

export class SettingsRepository {
  constructor(private readonly d: MiaDB = db) {}

  async get<T>(key: string, fallback: T): Promise<T> {
    const row = await this.d.settings.get(key);
    return row ? (row.value as T) : fallback;
  }
  set(key: string, value: unknown): Promise<Result<void>> {
    return attempt(async () => {
      await this.d.settings.put({ key, value });
    });
  }
  async getMeta<T>(key: string, fallback: T): Promise<T> {
    const row = await this.d.meta.get(key);
    return row ? (row.value as T) : fallback;
  }
  setMeta(key: string, value: unknown): Promise<Result<void>> {
    return attempt(async () => {
      await this.d.meta.put({ key, value });
    });
  }
  /** Efface toutes les données locales (action distincte de l'export). */
  wipeAll(): Promise<Result<void>> {
    return attempt(() =>
      this.d.transaction('rw', [this.d.periods, this.d.dayLogs, this.d.settings, this.d.meta], async () => {
        await Promise.all([this.d.periods.clear(), this.d.dayLogs.clear(), this.d.settings.clear(), this.d.meta.clear()]);
      }),
    );
  }
}

export const periodRepo = new PeriodRepository();
export const dayLogRepo = new DayLogRepository();
export const settingsRepo = new SettingsRepository();
