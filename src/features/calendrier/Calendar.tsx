import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import { Button, Sheet } from '../../ui/components';
import { fmtLong, useDayLogs, usePeriods } from '../../app/hooks';
import { addDays, daysBetween, fromParts, today, type CalendarDate } from '../../domain/calendarDate';
import { CYCLE_CONFIG } from '../../domain/cycle.config';
import { estimatedDays, predict } from '../../domain/prediction';
import { averagePeriodLength, periodLength } from '../../domain/cycle';

const GROUP: Record<string, string> = {
  cramps: 'pain', headache: 'pain', backPain: 'pain',
  fatigue: 'energy', sleep: 'energy',
  bloating: 'digest', nausea: 'digest', cravings: 'digest',
  moodCalm: 'mood', moodIrritable: 'mood', moodSad: 'mood', moodAnxious: 'mood',
  acne: 'body', breastTenderness: 'body', discharge: 'body',
};
/** Groupes de symptômes distincts d'un jour (3 pastilles au plus). */
const dotGroups = (codes: readonly string[]) => [...new Set(codes.map((c) => GROUP[c] ?? 'body'))].slice(0, 3);

const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

interface YearMonth {
  y: number;
  m: number;
}
const shift = ({ y, m }: YearMonth, n: number): YearMonth => {
  const idx = y * 12 + (m - 1) + n;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
};

export default function Calendar() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const periods = usePeriods();
  const logs = useDayLogs();
  const now = today();
  const thisMonth: YearMonth = { y: Number(now.slice(0, 4)), m: Number(now.slice(5, 7)) };
  const [ym, setYm] = useState<YearMonth>(thisMonth);
  const [selected, setSelected] = useState<CalendarDate | null>(null);
  const touchX = useRef<number | null>(null);

  const recorded = useMemo(() => {
    const s = new Set<CalendarDate>();
    const list = periods ?? [];
    list.forEach((p, idx) => {
      // Règles en cours sans date de fin (la plus récente) : marquées jusqu'à aujourd'hui, dans la limite prévue.
      const open = idx === list.length - 1 && !p.endDate ? Math.min(CYCLE_CONFIG.openPeriodDays, daysBetween(p.startDate, now) + 1) : 1;
      const len = periodLength(p) ?? Math.max(1, open);
      for (let i = 0; i < len; i++) s.add(addDays(p.startDate, i));
    });
    return s;
  }, [periods, now]);
  const estimated = useMemo(
    () => new Set(estimatedDays(predict(periods ?? []), averagePeriodLength(periods ?? []))),
    [periods],
  );
  const symptomsByDay = useMemo(() => new Map((logs ?? []).filter((l) => l.symptoms.length).map((l) => [l.date, l.symptoms])), [logs]);

  const move = (n: number) => setYm((cur) => shift(cur, n));
  const monthTitle = (v: YearMonth) => format(new Date(v.y, v.m - 1, 1), 'LLLL yyyy', { locale: frLocale });

  function label(d: CalendarDate) {
    const parts = [fmtLong(d)];
    if (recorded.has(d)) parts.push(t('calendar.periodRecorded'));
    else if (estimated.has(d)) parts.push(t('calendar.periodEstimated'));
    if (symptomsByDay.has(d)) parts.push(t('calendar.symptomsNoted'));
    return parts.join(', ');
  }

  function renderMonth(v: YearMonth) {
    const first = fromParts(v.y, v.m, 1);
    const daysInMonth = new Date(Date.UTC(v.y, v.m, 0)).getUTCDate();
    const offset = (new Date(Date.UTC(v.y, v.m - 1, 1)).getUTCDay() + 6) % 7;
    return (
      <section key={`${v.y}-${v.m}`} className="card" aria-label={monthTitle(v)}>
        <h2 className="cal-month">{monthTitle(v)}</h2>
        <div className="cal-grid" role="grid" aria-label={monthTitle(v)}>
          {DOW.map((d, i) => (
            <div key={i} className="cal-dow" aria-hidden="true">{d}</div>
          ))}
          {Array.from({ length: offset }, (_, i) => <span key={`b${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = addDays(first, i);
            const cls = [
              'cal-day',
              recorded.has(d) && 'cal-day--period',
              !recorded.has(d) && estimated.has(d) && 'cal-day--estimated',
              d === now && 'cal-day--today',
              d === selected && 'cal-day--selected',
            ].filter(Boolean).join(' ');
            return (
              <button key={d} className={cls} aria-label={label(d)} aria-current={d === now ? 'date' : undefined} onClick={() => setSelected(d)}>
                {i + 1}
                {symptomsByDay.has(d) && (
                  <span className="cal-dots" aria-hidden="true">
                    {dotGroups(symptomsByDay.get(d)!).map((g) => (
                      <i key={g} className={`dot--${g}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <main className="screen">
      <div className="cal-head">
        <button className="icon-btn" aria-label={t('calendar.prev')} onClick={() => move(-1)}>‹</button>
        <h1 aria-live="polite">{t('nav.calendar')}</h1>
        <button className="icon-btn" aria-label={t('calendar.next')} onClick={() => move(1)}>›</button>
      </div>
      <div
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 60) move(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
        style={{ touchAction: 'pan-y' }}
      >
        {renderMonth(ym)}
        {renderMonth(shift(ym, 1))}
      </div>
      <Button variant="link" onClick={() => setYm(thisMonth)}>
        {t('calendar.today')}
      </Button>
      <ul className="legend-list" aria-label="Légende">
        <li><span className="cal-day cal-day--period" aria-hidden="true" />{t('calendar.legendPeriod')}</li>
        <li><span className="cal-day cal-day--estimated" aria-hidden="true" />{t('calendar.legendEstimated')}</li>
        <li><span className="cal-day cal-day--today" aria-hidden="true" />{t('calendar.legendToday')}</li>
        <li><span className="cal-dots" aria-hidden="true"><i className="dot--pain" /><i className="dot--energy" /><i className="dot--mood" /></span>{t('calendar.legendSymptom')}</li>
      </ul>
      {selected && (
        <Sheet title={fmtLong(selected)} onClose={() => setSelected(null)} closeLabel={t('common.close')}>
          <p>{label(selected).replace(`${fmtLong(selected)}, `, '').replace(fmtLong(selected), '') || '—'}</p>
          <Button variant="primary" onClick={() => nav(`/journal/${selected}`)}>{t('calendar.editDates')}</Button>
        </Sheet>
      )}
    </main>
  );
}
