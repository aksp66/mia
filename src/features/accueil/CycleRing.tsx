import { useTranslation } from 'react-i18next';

interface Props {
  day: number;
  /** Durée moyenne du cycle ; absente tant qu'aucune estimation n'est possible. */
  length: number | null;
  /** Jours avant les règles estimées (date unique) ; null sinon. */
  daysUntil: number | null;
}

const R = 70;
const C = 2 * Math.PI * R;

/** Jauge circulaire : avancement dans le cycle, sans phase ni fertilité (ne sont pas calculées par MIA). */
export function CycleRing({ day, length, daysUntil }: Props) {
  const { t } = useTranslation();
  const progress = length ? Math.min(day / length, 1) : 0;
  const sub =
    daysUntil === null
      ? null
      : daysUntil > 0
        ? t('home.inDays', { count: daysUntil })
        : daysUntil === 0
          ? t('home.expectedToday')
          : null;
  return (
    <div className="ring" role="img" aria-label={`${t('home.cycleDay', { n: day })}${sub ? `. ${sub}` : ''}`}>
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>
        <circle cx="90" cy="90" r={R} className="ring__track" />
        {length && (
          <circle
            cx="90"
            cy="90"
            r={R}
            className="ring__bar"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            transform="rotate(-90 90 90)"
          />
        )}
      </svg>
      <div className="ring__text">
        <span className="ring__small">{t('home.dayWord')}</span>
        <span className="ring__day">{day}</span>
        {sub && <span className="ring__sub">{sub}</span>}
      </div>
    </div>
  );
}
