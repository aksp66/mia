import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flower2, Sparkles } from 'lucide-react';
import { Button, Banner, Sheet } from '../../ui/components';
import { fmtLong, fmtShort, usePeriods, useSetting } from '../../app/hooks';
import { daysBetween, today } from '../../domain/calendarDate';
import { computeCycles, periodDay, recentValidLengths } from '../../domain/cycle';
import { summarize } from '../../domain/prediction';
import { CycleBars } from './CycleBars';
import { CycleRing } from './CycleRing';

export function Home() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const periods = usePeriods();
  const [discreet] = useSetting<boolean>('discreet', false);
  const [firstName] = useSetting<string>('firstName', '');
  const [remind] = useSetting<boolean>('remindersEnabled', false);
  const [lastExport] = useSetting<string>('lastExportAt', '');
  const [revealed, setRevealed] = useState(false);
  const [explain, setExplain] = useState(false);
  const todayStr = today();
  const summary = useMemo(() => (periods ? summarize(periods, todayStr) : null), [periods, todayStr]);
  const lengths = useMemo(() => (periods ? recentValidLengths(computeCycles(periods)) : []), [periods]);
  const inPeriod = useMemo(() => (periods ? periodDay(periods, todayStr) : null), [periods, todayStr]);

  if (!summary || discreet === undefined) return null;
  const hidden = discreet && !revealed;
  const p = summary.prediction;
  const needsExport =
    (periods?.length ?? 0) >= 3 && (!lastExport || daysBetween(lastExport.slice(0, 10) as never, todayStr) > 60);
  // En mode discret, le prénom n'est jamais affiché.
  const greeting = !discreet && firstName?.trim() ? t('home.greetingName', { name: firstName.trim() }) : t('home.greeting');

  return (
    <main className="screen">
      <header className="greeting">
        <h1>{greeting}</h1>
        <p className="muted">{fmtLong(todayStr)}</p>
      </header>
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
                {summary.cycleDay ? (
                  <>
                    {/* Pendant les règles, « jour des règles » et « jour du cycle » sont la même valeur (compte depuis le dernier début). */}
                    <h2 className="status-title">{inPeriod ? t('home.periodDay', { n: inPeriod }) : t('home.cycleDay', { n: summary.cycleDay })}</h2>
                    <CycleRing
                      day={summary.cycleDay}
                      length={p.kind === 'Estimation' || p.kind === 'Plage' ? p.average : null}
                      daysUntil={p.kind === 'Estimation' ? daysBetween(todayStr, p.date) : null}
                    />
                  </>
                ) : (
                  <p className="big">{t('home.cycleDayUnknown')}</p>
                )}
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
                {summary.lastStart && <Button onClick={() => nav(`/journal/${summary.lastStart}`)}>{t('home.editPeriod')}</Button>}
              </>
            )}
            {discreet && <Button variant="link" onClick={() => setRevealed(false)}>{t('home.hide')}</Button>}
          </>
        )}
      </section>

      {!hidden && lengths.length >= 2 && (
        <section className="card" aria-label={t('home.cyclesTitle')}>
          <h2>{t('home.cyclesTitle')}</h2>
          <CycleBars lengths={lengths} />
          <p className="muted">{t('home.cyclesUnit')}</p>
        </section>
      )}

      {needsExport && <Banner>{t('home.exportReminder')}</Banner>}

      <div className="tiles">
        <button type="button" className="tile tile--mint" onClick={() => nav(`/journal/${todayStr}?mode=period`)}>
          <Flower2 size={28} strokeWidth={1.75} aria-hidden="true" />
          {t('home.recordPeriod')}
        </button>
        <button type="button" className="tile tile--lavender" onClick={() => nav(`/journal/${todayStr}?mode=symptoms`)}>
          <Sparkles size={28} strokeWidth={1.75} aria-hidden="true" />
          {t('home.noteSymptom')}
        </button>
      </div>

      <p className="muted" style={{ textAlign: 'center' }}>{t('common.storedLocally')}</p>
      {explain && (
        <Sheet title={t('estimate.title')} onClose={() => setExplain(false)} closeLabel={t('common.close')}>
          <p>{t('estimate.body')}</p>
        </Sheet>
      )}
    </main>
  );
}
