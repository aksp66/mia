// Seuils de la section 6.2 — valeurs proposées, à valider par le référent santé.
export const CYCLE_CONFIG = {
  cycleMin: 15,
  cycleMax: 90,
  periodLengthMin: 1,
  periodLengthMax: 15,
  minGapBetweenStarts: 10,
  predictionThreshold: 3,
  window: 6,
  regularSpread: 7,
  variableSpread: 20,
  maxCycleDay: 90,
  minEndDatesForPeriodLength: 3,
  /** Sans date de fin, les règles sont considérées en cours pendant ce nombre de jours au plus. */
  openPeriodDays: 7,
} as const;
