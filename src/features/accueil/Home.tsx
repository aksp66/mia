import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Banner, Sheet } from '../../ui/components';
import { fmtLong, fmtShort, usePeriods, useSetting } from '../../app/hooks';
import { today } from '../../domain/calendarDate';
import { summarize } from '../../domain/prediction';
import { daysBetween } from '../../domain/calendarDate';

export function Home() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const periods = usePeriods();
  const [discreet] = useSetting<boolean>('discreet', false);
  const [remind] = useSetting<boolean>('remindersEnabled', false);
  const [lastExport] = useSetting<string>('lastExportAt', '');
  const [revealed, setRevealed] = useState(false);
  const [explain, setExplain] = useState(false);
  const todayStr = today();
  const summary = useMemo(() => (periods ? summarize(periods, todayStr) : null), [periods, todayStr]);

  if (!summary || discreet === undefined) return null;
  const hidden = discreet && !revealed;
  const p = summary.prediction;
  const needsExport =
    (periods?.length ?? 0) >= 3 && (!lastExport || daysBetween(lastExport.slice(0, 10) as never, todayStr) > 60);

  return (
    <main className="screen">
      <h1>MIA</h1>
      {remind && <Banner>{t('home.reminder')}</Banner>}
      <section className="card" aria-label="Résumé du cycle">
        {hidden ? (
          <>
            <p>{t('home.hidden')}</p>
            <Button onClick={() => setRevealed(true)}>{t('home.show')}</Button>
          </>
        ) : (
          <>
            {p.kind === 'AucuneDonnee' ? (
              <p>{t('home.empty')}</p>
            ) : (
              <>
                <p className="big">
                  {summary.cycleDay ? t('home.cycleDay', { n: summary.cycleDay }) : t('home.cycleDayUnknown')}
                </p>
                {p.kind === 'Insuffisant' && <p>{t('home.insufficient', { n: p.missing })}</p>}
                {p.kind === 'Estimation' && <p><strong>{t('home.estimateDate', { date: fmtLong(p.date) })}</strong></p>}
                {p.kind === 'Plage' && (
                  <p><strong>{t('home.estimateRange', { from: fmtShort(p.from), to: fmtShort(p.to) })}</strong></p>
                )}
                {p.kind === 'Incertain' && (
                  <p>
                    {t('home.uncertain')} <Link to="/apprendre/cycles-irreguliers">{t('nav.learn')}</Link>
                  </p>
                )}
                {summary.overdue && <Banner>{t('home.overdue')}</Banner>}
                {(p.kind === 'Estimation' || p.kind === 'Plage') && <Banner>{t('home.notCertain')}</Banner>}
                {(p.kind === 'Estimation' || p.kind === 'Plage') && (
                  <Button variant="link" onClick={() => setExplain(true)}>
                    {t('common.howCalculated')}
                  </Button>
                )}
              </>
            )}
            {discreet && <Button variant="link" onClick={() => setRevealed(false)}>{t('home.hide')}</Button>}
          </>
        )}
      </section>
      {needsExport && <Banner>{t('home.exportReminder')}</Banner>}
      <Button variant="primary" onClick={() => nav(`/journal/${todayStr}`)}>
        {t('home.recordPeriod')}
      </Button>
      <Button onClick={() => nav(`/journal/${todayStr}?mode=symptoms`)}>{t('home.noteSymptom')}</Button>
      <p className="muted" style={{ textAlign: 'center' }}>{t('common.storedLocally')}</p>
      {explain && (
        <Sheet title={t('estimate.title')} onClose={() => setExplain(false)} closeLabel={t('common.close')}>
          <p>{t('estimate.body')}</p>
        </Sheet>
      )}
    </main>
  );
}
