import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Chip, useToast } from '../../ui/components';
import { haptic } from '../../ui/haptics';
import { fmtLong, usePeriods } from '../../app/hooks';
import { dayLogRepo, periodRepo, settingsRepo } from '../../data/repositories';
import { FLOWS, SYMPTOM_CODES, type Flow, type SymptomCode } from '../../data/db';
import { addDays, isValidCalendarDate, today, type CalendarDate } from '../../domain/calendarDate';
import { validatePeriod, type ValidationIssue } from '../../domain/validation';

const EMOJI: Record<SymptomCode, string> = {
  cramps: '😖',
  headache: '🤕',
  fatigue: '🥱',
  bloating: '🎈',
  breastTenderness: '🌸',
  acne: '🧴',
  nausea: '🤢',
  backPain: '💢',
  sleep: '🌙',
  cravings: '🍫',
  discharge: '🫧',
  moodCalm: '😌',
  moodIrritable: '😠',
  moodSad: '😢',
  moodAnxious: '😟',
};
const MOOD_CODES = SYMPTOM_CODES.filter((c) => c.startsWith('mood'));
const BODY_CODES = SYMPTOM_CODES.filter((c) => !c.startsWith('mood'));
/** Pictogrammes de flux : cercles de taille croissante (aucune goutte, section 10.5). */
const FLOW_SIZE: Record<Flow, number> = { spotting: 6, light: 10, medium: 14, heavy: 18 };
/** État du formulaire sous forme comparable (détection des modifications non enregistrées). */
const formState = (f: { isStart: boolean; start: string; end: string; flow?: string; symptoms: readonly string[]; energy?: number; sleep?: number; note: string }) => ({
  ...f,
  symptoms: [...f.symptoms].sort(),
});

const DOW_LETTER = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

function DayStrip({ date, now, onSelect }: { date: CalendarDate; now: CalendarDate; onSelect: (d: CalendarDate) => void }) {
  const { t } = useTranslation();
  const current = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    current.current?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [date]);
  const first = date < addDays(now, -13) ? date : addDays(now, -13);
  const days: CalendarDate[] = [];
  for (let d = first; d <= now; d = addDays(d, 1)) days.push(d);
  return (
    <div className="daystrip" role="group" aria-label={t('journal.dayStrip')}>
      {days.map((d) => (
        <button key={d} ref={d === date ? current : undefined} type="button" aria-current={d === date ? 'date' : undefined} aria-label={fmtLong(d)} onClick={() => onSelect(d)}>
          <span aria-hidden="true">{DOW_LETTER[new Date(Number(d.slice(0, 4)), Number(d.slice(5, 7)) - 1, Number(d.slice(8, 10))).getDay()]}</span>
          <strong aria-hidden="true">{Number(d.slice(8, 10))}</strong>
        </button>
      ))}
    </div>
  );
}

function JournalForm() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const toast = useToast();
  const { date: param } = useParams();
  const [search] = useSearchParams();
  const periods = usePeriods();
  const now = today();

  const date = isValidCalendarDate(param) ? param : now;
  const existing = periods?.find((p) => p.startDate === date);
  const [loaded, setLoaded] = useState(false);
  // Le début des règles n'est proposé d'office que depuis « Enregistrer mes règles » (?mode=period) ou pour une entrée existante.
  const [isStart, setIsStart] = useState(search.get('mode') === 'period');
  const [start, setStart] = useState<CalendarDate>(date);
  const [end, setEnd] = useState<string>('');
  const [flow, setFlow] = useState<Flow | undefined>();
  const [symptoms, setSymptoms] = useState<SymptomCode[]>([]);
  const [note, setNote] = useState('');
  const [energy, setEnergy] = useState<number | undefined>();
  const [sleep, setSleep] = useState<number | undefined>();
  const [confirmed, setConfirmed] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingDay, setPendingDay] = useState<CalendarDate | null>(null);
  const initial = useRef<string | null>(null);

  useEffect(() => {
    if (loaded || !periods) return;
    void dayLogRepo.get(date).then((log) => {
      setFlow(log?.flow);
      setSymptoms(log?.symptoms ?? []);
      setNote(log?.note ?? '');
      setEnergy(log?.energy);
      setSleep(log?.sleep);
      if (existing) {
        setIsStart(true);
        setEnd(existing.endDate ?? '');
      }
      initial.current = JSON.stringify(formState({
        isStart: Boolean(existing) || search.get('mode') === 'period',
        start: date,
        end: existing?.endDate ?? '',
        flow: log?.flow,
        symptoms: log?.symptoms ?? [],
        energy: log?.energy,
        sleep: log?.sleep,
        note: log?.note ?? '',
      }));
      setLoaded(true);
    });
  }, [loaded, periods, date, existing, search]);

  const dirty = loaded && initial.current !== JSON.stringify(formState({ isStart, start, end, flow, symptoms, energy, sleep, note }));

  /** Change de jour en conservant les paramètres d'adresse (notamment le mode). */
  const go = (d: CalendarDate) => {
    setPendingDay(null);
    const q = search.toString();
    nav(`/journal/${d}${q ? `?${q}` : ''}`, { replace: true });
  };
  const selectDay = (d: CalendarDate) => {
    if (d === date) return;
    if (dirty) setPendingDay(d);
    else go(d);
  };

  const endDate = end && isValidCalendarDate(end) ? (end as CalendarDate) : undefined;
  const issues: ValidationIssue[] = useMemo(
    () =>
      isStart && isValidCalendarDate(start)
        ? validatePeriod({ startDate: start, endDate }, periods ?? [], now, existing?.startDate)
        : [],
    [isStart, start, endDate, periods, now, existing],
  );
  const errors = issues.filter((i) => i.level === 'error');
  const confirms = issues.filter((i) => i.level === 'confirm');
  const blocked = errors.length > 0 || (confirms.length > 0 && !confirmed);

  const errText = (code: string) =>
    ({ future: t('journal.errFuture'), duplicate: t('journal.errDuplicate'), endBeforeStart: t('journal.errEndBefore'), endInFuture: t('journal.errEndFuture') })[code];
  const warnText = (i: ValidationIssue) =>
    i.level === 'confirm'
      ? i.code === 'closeToExisting'
        ? t('journal.warnClose', { date: fmtLong(i.existing!) })
        : i.code === 'longPeriod'
          ? t('journal.warnLong')
          : t('journal.warnAtypical')
      : '';

  const toggleSymptom = (c: SymptomCode) => setSymptoms((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  async function save(after?: () => void) {
    setSaveError(false);
    const results: Array<{ ok: boolean }> = [await dayLogRepo.save(date, { flow, symptoms, energy, sleep, note })];
    if (isStart && isValidCalendarDate(start)) {
      results.push(await periodRepo.save({ startDate: start, endDate }, existing?.startDate));
    } else if (existing) {
      results.push(await periodRepo.remove(existing.startDate));
    }
    if (results.some((r) => !r.ok)) {
      setSaveError(true);
      return;
    }
    void navigator.storage?.persist?.();
    void settingsRepo.setMeta('hasRecorded', true);
    haptic();
    toast({ message: t('common.saved') });
    if (after) after();
    else nav(-1);
  }

  async function remove() {
    if (!existing) return;
    const r = await periodRepo.remove(existing.startDate);
    if (!r.ok) return setSaveError(true);
    const row = r.value;
    toast({
      message: t('journal.deleted'),
      action: { label: t('journal.undo'), run: () => row && void periodRepo.restore(row) },
    });
    nav(-1);
  }

  if (!periods || !loaded) return null;

  return (
    <main className="screen screen--full">
      <h1>{t('journal.title', { date: fmtLong(date) })}</h1>
      <DayStrip date={date} now={now} onSelect={selectDay} />

      {pendingDay && (
        <Banner kind="warn">
          <p>{t('journal.unsaved')}</p>
          <Button variant="primary" disabled={blocked} onClick={() => void save(() => go(pendingDay))}>
            {t('journal.saveAndSwitch')}
          </Button>
          <Button variant="danger" onClick={() => go(pendingDay)}>
            {t('journal.discardAndSwitch')}
          </Button>
          <Button onClick={() => setPendingDay(null)}>{t('journal.stay')}</Button>
        </Banner>
      )}

      <label className="switch">
        <span>{t('journal.periodStart')}</span>
        <input type="checkbox" checked={isStart} onChange={(e) => { setIsStart(e.target.checked); setConfirmed(false); }} />
      </label>

      {isStart && (
        <>
          <label className="field">
            <span>{t('journal.periodStartDate')}</span>
            <input
              className="input"
              type="date"
              max={now}
              value={start}
              aria-invalid={errors.some((e) => ['future', 'duplicate'].includes(e.code))}
              onChange={(e) => { setStart(e.target.value as CalendarDate); setConfirmed(false); }}
            />
          </label>
          <label className="field">
            <span>{t('journal.periodEnd')} ({t('common.optional')})</span>
            <input
              className="input"
              type="date"
              max={now}
              min={start}
              value={end}
              aria-invalid={errors.some((e) => e.code.startsWith('end'))}
              onChange={(e) => { setEnd(e.target.value); setConfirmed(false); }}
            />
          </label>
          {errors.map((e) => (
            <p key={e.code} className="error" role="alert">{errText(e.code)}</p>
          ))}
          {confirms.map((c) => (
            <Banner key={c.code} kind="warn">{warnText(c)}</Banner>
          ))}
          {confirms.length > 0 && errors.length === 0 && (
            <label className="switch">
              <span>{t('journal.confirmAnyway')}</span>
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            </label>
          )}
        </>
      )}

      <section className="card">
        <fieldset className="chips">
          <legend className="legend">{t('journal.flow')} ({t('common.optional')})</legend>
          {FLOWS.map((f) => (
            <Chip key={f} pressed={flow === f} onToggle={() => setFlow(flow === f ? undefined : f)}>
              <span className="flow-shape" style={{ width: FLOW_SIZE[f], height: FLOW_SIZE[f] }} aria-hidden="true" />
              {t(`journal.flows.${f}`)}
            </Chip>
          ))}
        </fieldset>
      </section>

      <section className="card">
        <fieldset className="chips">
          <legend className="legend">{t('journal.mood')} ({t('common.optional')})</legend>
          {MOOD_CODES.map((c) => (
            <Chip key={c} pressed={symptoms.includes(c)} onToggle={() => toggleSymptom(c)}>
              <span className="chip-emoji" aria-hidden="true">{EMOJI[c]}</span>
              {t(`symptoms.${c}`)}
            </Chip>
          ))}
        </fieldset>
      </section>

      <section className="card">
        <fieldset className="chips">
          <legend className="legend">{t('journal.symptoms')} ({t('common.optional')})</legend>
          {BODY_CODES.map((c) => (
            <Chip key={c} pressed={symptoms.includes(c)} onToggle={() => toggleSymptom(c)}>
              <span className="chip-emoji" aria-hidden="true">{EMOJI[c]}</span>
              {t(`symptoms.${c}`)}
            </Chip>
          ))}
        </fieldset>
      </section>

      <section className="card">
        <fieldset className="chips">
          <legend className="legend">{t('journal.energy')} ({t('common.optional')})</legend>
          {[1, 2, 3, 4, 5].map((n) => (
            <Chip key={n} pressed={energy === n} onToggle={() => setEnergy(energy === n ? undefined : n)}>
              {n}
            </Chip>
          ))}
        </fieldset>
        <fieldset className="chips" style={{ marginTop: 16 }}>
          <legend className="legend">{t('journal.sleep')} ({t('common.optional')})</legend>
          {[1, 2, 3, 4, 5].map((n) => (
            <Chip key={n} pressed={sleep === n} onToggle={() => setSleep(sleep === n ? undefined : n)}>
              {n}
            </Chip>
          ))}
        </fieldset>
        <small className="muted">{t('journal.scaleHint')}</small>
      </section>

      <section className="card">
        <label className="field" style={{ marginBottom: 0 }}>
          <span>{t('journal.note')} ({t('common.optional')})</span>
          <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
          <small className="muted">{t('journal.notePrivate')}</small>
        </label>
      </section>

      {saveError && (
        <Banner kind="error">
          {t('journal.saveFailed')} <button className="btn btn--link" onClick={() => void save()}>{t('journal.retry')}</button>
        </Banner>
      )}

      <Button variant="primary" disabled={blocked} onClick={() => void save()}>{t('common.save')}</Button>
      <Button onClick={() => nav(-1)}>{t('common.cancel')}</Button>

      {existing && !confirmDelete && (
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>{t('common.delete')}</Button>
      )}
      {existing && confirmDelete && (
        <Banner kind="warn">
          <p>{t('journal.confirmDelete')}</p>
          <Button variant="danger" onClick={remove}>{t('common.delete')}</Button>
          <Button onClick={() => setConfirmDelete(false)}>{t('common.cancel')}</Button>
        </Banner>
      )}
    </main>
  );
}

/** Le formulaire est recréé à chaque changement de jour (bande de sélection). */
export default function Journal() {
  const { date } = useParams();
  return <JournalForm key={date} />;
}
