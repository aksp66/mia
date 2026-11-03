import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../ui/components';
import { fmtLong, useDayLogs, usePeriods } from '../../app/hooks';
import { computeCycles, periodLength, recentValidLengths, sortPeriods } from '../../domain/cycle';
import { computeInsights, type Insight } from '../../domain/insights';
import { periodRepo } from '../../data/repositories';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const periods = usePeriods();
  const logs = useDayLogs();
  const insights = useMemo(() => (periods && logs ? computeInsights(periods, logs) : []), [periods, logs]);
  const insightText = (i: Insight) =>
    i.kind === 'topSymptom' ? t('insights.topSymptom', { symptom: t(`symptoms.${i.code}`).toLowerCase(), days: i.days }) : t(`insights.${i.kind}`, i);

  const data = useMemo(() => {
    if (!periods) return null;
    const sorted = sortPeriods(periods);
    const cycles = computeCycles(sorted);
    const recents = recentValidLengths(cycles);
    const stats = recents.length
      ? { avg: Math.round(recents.reduce((s, n) => s + n, 0) / recents.length), spread: Math.max(...recents) - Math.min(...recents) }
      : null;
    return { rows: [...sorted].reverse(), cycles, stats };
  }, [periods]);

  if (!data) return null;
  return (
    <main className="screen">
      <h1>{t('history.title')}</h1>
      {data.rows.length === 0 ? (
        <p>{t('history.empty')}</p>
      ) : (
        <>
          {insights.length > 0 && (
            <section className="card" aria-label={t('insights.title')}>
              <h2>{t('insights.title')}</h2>
              <ul className="list">
                {insights.map((i) => (
                  <li key={i.kind}>{insightText(i)}</li>
                ))}
              </ul>
              <p className="muted">{t('insights.note')}</p>
            </section>
          )}
          <p className="card">{data.stats ? t('history.stats', data.stats) : t('history.statsNone')}</p>
          <ul className="list">
            {data.rows.map((p) => {
              const cycle = data.cycles.find((c) => c.startDate === p.startDate);
              const plen = periodLength(p);
              return (
                <li key={p.id} className="card">
                  <h2><Link to={`/journal/${p.startDate}`}>{fmtLong(p.startDate)}</Link></h2>
                  <p>{cycle ? t('history.cycleLength', { n: cycle.length }) : t('history.inProgress')}</p>
                  {plen !== undefined && <p>{t('history.periodLength', { n: plen })}</p>}
                  {cycle?.atypical && (
                    <p><span className="badge">{t('history.atypical')}</span><span className="muted">{t('history.atypicalWhy')}</span></p>
                  )}
                  {plen === undefined && (
                    <p><span className="badge">{t('history.missing')}</span><span className="muted">{t('history.missingWhy')}</span></p>
                  )}
                  {p.excluded && <p><span className="badge">{t('history.excluded')}</span></p>}
                  {cycle && (
                    <Button variant="link" onClick={() => void periodRepo.setExcluded(p.startDate, !p.excluded)}>
                      {p.excluded ? t('history.include') : t('history.exclude')}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
