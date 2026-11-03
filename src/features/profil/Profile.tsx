import { useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Chip, useToast } from '../../ui/components';
import { useSetting, type Theme } from '../../app/hooks';
import { settingsRepo } from '../../data/repositories';
import { APP_VERSION, buildExport, importData, parseExport, toCsv, type ImportMode, type MiaExport } from '../../data/exchange';
import { today } from '../../domain/calendarDate';
import { vault } from '../../data/vault';
import { buildIcs, download } from './ics';
import Security from './Security';

function Back() {
  const { t } = useTranslation();
  return <Link to="/profil">← {t('common.back')}</Link>;
}

function Index() {
  const { t } = useTranslation();
  const [discreet, setDiscreet] = useSetting<boolean>('discreet', false);
  const [theme, setTheme] = useSetting<Theme>('theme', 'auto');
  return (
    <main className="screen">
      <h1>{t('profile.title')}</h1>
      <section className="card">
        <fieldset className="chips" style={{ marginBottom: 16 }}>
          <legend className="legend">{t('profile.appearance')}</legend>
          {(['auto', 'light', 'dark'] as const).map((m) => (
            <Chip key={m} pressed={theme === m} onToggle={() => void setTheme(m)}>
              {t(`profile.theme${m === 'auto' ? 'Auto' : m === 'light' ? 'Light' : 'Dark'}`)}
            </Chip>
          ))}
        </fieldset>
      </section>
      <section className="card">
        <h2>{t('profile.privacy')}</h2>
        <label className="switch">
          <span>{t('profile.discreet')}<br /><small className="muted">{t('profile.discreetHint')}</small></span>
          <input type="checkbox" checked={!!discreet} onChange={(e) => void setDiscreet(e.target.checked)} />
        </label>
        <Link to="/profil/securite">{t('profile.pin')}</Link>
        <p className="muted">{t('profile.pinHint')}</p>
      </section>
      <section className="card">
        <ul className="list">
          <li><Link to="/profil/rappels">{t('profile.reminders')}</Link></li>
          <li><Link to="/profil/donnees">{t('profile.data')}</Link></li>
        </ul>
      </section>
      <section className="card">
        <h2>{t('profile.about')}</h2>
        <p>{t('profile.aboutBody')}</p>
        <p className="muted">{t('profile.storageNote')}</p>
        <p className="muted">{t('profile.version', { v: APP_VERSION })}</p>
      </section>
    </main>
  );
}

function Reminders() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useSetting<boolean>('remindersEnabled', false);
  const [date, setDate] = useState(today());
  return (
    <main className="screen">
      <Back />
      <h1>{t('profile.reminders')}</h1>
      <label className="switch">
        <span>{t('profile.remindersEnabled')}<br /><small className="muted">{t('profile.remindersHint')}</small></span>
        <input type="checkbox" checked={!!enabled} onChange={(e) => void setEnabled(e.target.checked)} />
      </label>
      <section className="card">
        <h2>{t('profile.icsTitle')}</h2>
        <p className="muted">{t('profile.icsHint')}</p>
        <label className="field">
          <span>{t('profile.icsDate')}</span>
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value as never)} />
        </label>
        <Button onClick={() => download('rappel-mia.ics', buildIcs(date), 'text/calendar')}>{t('profile.icsDownload')}</Button>
      </section>
    </main>
  );
}

function DataScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const nav = useNavigate();
  const [pending, setPending] = useState<MiaExport | null>(null);
  const [error, setError] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [wiping, setWiping] = useState(false);
  const [word, setWord] = useState('');

  async function exportAs(kind: 'json' | 'csv') {
    const e = await buildExport();
    if (kind === 'json') download(`mia-export-${today()}.json`, JSON.stringify(e, null, 2), 'application/json');
    else download(`mia-export-${today()}.csv`, toCsv(e), 'text/csv');
    await settingsRepo.set('lastExportAt', new Date().toISOString());
    toast({ message: t('profile.exported') });
  }

  async function pick(file: File | undefined) {
    setError(false);
    setPending(null);
    if (!file) return;
    const r = parseExport(await file.text());
    if (r.ok) setPending(r.value);
    else setError(true);
  }

  async function run(mode: ImportMode) {
    if (!pending) return;
    const r = await importData(pending, mode);
    setPending(null);
    setConfirmReplace(false);
    if (r.ok) toast({ message: t('profile.importDone', { added: r.value.addedPeriods, dup: r.value.duplicates }) });
    else setError(true);
  }

  async function wipe() {
    const r = await settingsRepo.wipeAll();
    if (r.ok) {
      vault.reset();
      toast({ message: t('profile.wiped') });
      nav('/bienvenue', { replace: true });
    }
  }

  return (
    <main className="screen">
      <Back />
      <h1>{t('profile.data')}</h1>
      <section className="card">
        <h2>{t('profile.export')}</h2>
        <Button onClick={() => exportAs('json')}>{t('profile.exportJson')}</Button>
        <Button onClick={() => exportAs('csv')}>{t('profile.exportCsv')}</Button>
      </section>
      <section className="card">
        <h2>{t('profile.import')}</h2>
        <label className="field">
          <span>{t('profile.importHint')}</span>
          <input className="input" type="file" accept="application/json,.json" onChange={(e) => void pick(e.target.files?.[0])} />
        </label>
        {error && <Banner kind="error">{t('profile.importInvalid')}</Banner>}
        {pending && (
          <>
            <Button variant="primary" onClick={() => run('merge')}>{t('profile.importMerge')}</Button>
            {!confirmReplace ? (
              <Button onClick={() => setConfirmReplace(true)}>{t('profile.importReplace')}</Button>
            ) : (
              <Banner kind="warn">
                <p>{t('profile.importReplaceConfirm')}</p>
                <Button variant="danger" onClick={() => run('replace')}>{t('profile.importReplace')}</Button>
              </Banner>
            )}
          </>
        )}
      </section>
      <section className="card">
        <h2>{t('profile.wipe')}</h2>
        <p>{t('profile.wipeHint')}</p>
        {!wiping ? (
          <Button variant="danger" onClick={() => setWiping(true)}>{t('profile.wipe')}</Button>
        ) : (
          <>
            <label className="field">
              <span>{t('profile.wipeConfirm')}</span>
              <input className="input" value={word} onChange={(e) => setWord(e.target.value)} autoComplete="off" />
            </label>
            <Button variant="danger" disabled={word !== t('profile.wipeWord')} onClick={wipe}>{t('profile.wipe')}</Button>
          </>
        )}
      </section>
    </main>
  );
}

export default function Profile() {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="rappels" element={<Reminders />} />
      <Route path="donnees" element={<DataScreen />} />
      <Route path="securite" element={<Security />} />
    </Routes>
  );
}
