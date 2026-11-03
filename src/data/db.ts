import Dexie, { type EntityTable } from 'dexie';
import type { CalendarDate } from '../domain/calendarDate';

export type Flow = 'spotting' | 'light' | 'medium' | 'heavy';

export const SYMPTOM_CODES = [
  'cramps',
  'headache',
  'fatigue',
  'bloating',
  'breastTenderness',
  'acne',
  'nausea',
  'backPain',
  'sleep',
  'cravings',
  'discharge',
  'moodCalm',
  'moodIrritable',
  'moodSad',
  'moodAnxious',
] as const;
export type SymptomCode = (typeof SYMPTOM_CODES)[number];
export const FLOWS: Flow[] = ['spotting', 'light', 'medium', 'heavy'];

export interface PeriodRow {
  id: string;
  startDate: CalendarDate;
  endDate?: CalendarDate;
  excluded: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface DayLogRow {
  date: CalendarDate;
  flow?: Flow;
  symptoms: SymptomCode[];
  /** Niveau d'énergie et qualité du sommeil, de 1 (bas) à 5 (haut). */
  energy?: number;
  sleep?: number;
  note?: string;
  updatedAt: string;
}
export interface SettingRow {
  key: string;
  value: unknown;
}
export interface MetaRow {
  key: string;
  value: unknown;
}

export class MiaDB extends Dexie {
  periods!: EntityTable<PeriodRow, 'id'>;
  dayLogs!: EntityTable<DayLogRow, 'date'>;
  settings!: EntityTable<SettingRow, 'key'>;
  meta!: EntityTable<MetaRow, 'key'>;

  constructor(name = 'mia') {
    super(name);
    // Version 1 du schéma (section 7.2). Les futures évolutions ajoutent .version(n+1) sans effacer les données.
    this.version(1).stores({
      periods: 'id, &startDate',
      dayLogs: 'date',
      settings: 'key',
      meta: 'key',
    });
  }
}

export const db = new MiaDB();
