import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { fr as frLocale } from 'date-fns/locale';
import { Button, Sheet } from '../../ui/components';
import { fmtLong, useDayLogs, usePeriods } from '../../app/hooks';
import { addDays, fromParts, today, type CalendarDate } from '../../domain/calendarDate';
import { estimatedDays, predict } from '../../domain/prediction';
import { periodLength } from '../../domain/cycle';

const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function Calendar() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const periods = usePeriods();
  const logs = useDayLogs();
  const now = today();
  const [ym, setYm] = useState({ y: Number(now.slice(0, 4)), m: Number(now.slice(5, 7)) });
  const [selected, setSelected] = useState<CalendarDate | null>(null);
  const touchX = useRef<number | null>(null);

  const recorded = useMemo(() => {
    const s = new Set<CalendarDate>();
    for (const p of periods ?? []) {
      const len = periodLength(p) ?? 1;
      for (let i = 0; i < len; i++) s.add(addDays(p.startDate, i));
    }
    return s;
  }, [periods]);
  const estimated = useMemo(() => new Set(estimatedDays(predict(periods ?? []))), [periods]);
  const symptomDays = useMemo(() => new Set((logs ?? []).filter((l) => l.symptoms.length).map((l) => l.date)), [logs]);

  const first = fromParts(ym.y, ym.m, 1);
  const daysInMonth = new Date(Date.UTC(ym.y, ym.m, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(ym.y, ym.m - 1, 1)).getUTCDay() + 6) % 7;
  const move = (n: number) => setYm(({ y, m }) => {
    const idx = y * 12 + (m - 1) + n;
    return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
  });
  const title = format(new Date(ym.y, ym.m - 1, 1), 'LLLL yyyy', { locale: frLocale });

  function label(d: CalendarDate) {
    const parts = [fmtLong(d)];
    if (recorded.has(d)) parts.push(t('calendar.periodRecorded'));
    else if (estimated.has(d)) parts.push(t('calendar.periodEstimated'));
    if (symptomDays.has(d)) parts.push(t('calendar.symptomsNoted'));
    return parts.join(', ');
  }

  return (
    <main className="screen">
      <div className="cal-head">
        <button className="icon-btn" aria-label={t('calendar.prev')} onClick={() => move(-1)}>‹</button>
        <h1 aria-live="polite">{title}</h1>
        <button className="icon-btn" aria-label={t('calendar.next')} onClick={() => move(1)}>›</button>
      </div>
      <div
        className="cal-grid"
        role="grid"
        aria-label={title}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 60) move(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
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
            symptomDays.has(d) && 'cal-day--symptom',
          ].filter(Boolean).join(' ');
          return (
            <button key={d} className={cls} aria-label={label(d)} aria-current={d === now ? 'date' : undefined} onClick={() => setSelected(d)}>
              {i + 1}
            </button>
          );
        })}
      </div>
      <Button variant="link" onClick={() => setYm({ y: Number(now.slice(0, 4)), m: Number(now.slice(5, 7)) })}>
        {t('calendar.today')}
      </Button>
      <ul className="legend-list" aria-label="Légende">
        <li><span className="cal-day cal-day--period" aria-hidden="true" />{t('calendar.legendPeriod')}</li>
        <li><span className="cal-day cal-day--estimated" aria-hidden="true" />{t('calendar.legendEstimated')}</li>
        <li><span className="cal-day cal-day--today" aria-hidden="true" />{t('calendar.legendToday')}</li>
        <li><span className="cal-day cal-day--symptom" aria-hidden="true" />{t('calendar.legendSymptom')}</li>
      </ul>
      {selected && (
        <Sheet title={fmtLong(selected)} onClose={() => setSelected(null)} closeLabel={t('common.close')}>
          <p>{label(selected).replace(`${fmtLong(selected)}, `, '').replace(fmtLong(selected), '') || '—'}</p>
          <Button variant="primary" onClick={() => nav(`/journal/${selected}`)}>{t('calendar.open')}</Button>
        </Sheet>
      )}
    </main>
  );
}
