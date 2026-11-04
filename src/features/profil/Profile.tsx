import { useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Chip, useToast } from '../../ui/components';
import { useSetting, type Palette, type Theme } from '../../app/hooks';
import { settingsRepo } from '../../data/repositories';
import {
  APP_VERSION,
  MIN_PASSPHRASE,
  buildExport,
  decryptExport,
  encryptExport,
  importData,
  isEncryptedExport,
  parseExport,
  toCsv,
  type ImportMode,
  type MiaExport,
} from '../../data/exchange';
import { today } from '../../domain/calendarDate';
import { vault } from '../../data/vault';
import { buildIcs, download } from './ics';
import Security from './Security';

const PALETTES: Array<[Palette, string]> = [
  ['soft', '#e27d9f'],
  ['peony', '#d98ba8'],
  ['lavender', '#b9a7ec'],
  ['sand', '#e3b98a'],
  ['mint', '#8fcfb9'],
];

function Back() {
  const { t } = useTranslation();
  return <Link to="/profil">← {t('common.back')}</Link>;
}

function Index() {
  const { t } = useTranslation();
  const [discreet, setDiscreet] = useSetting<boolean>('discreet', false);
  const [theme, setTheme] = useSetting<Theme>('theme', 'auto');
  const [firstName, setFirstName] = useSetting<string>('firstName', '');
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [palette, setPalette] = useSetting<Palette>('palette', 'soft');
  return (
    <main className="screen">
      <Link to="/">← {t('nav.home')}</Link>
      <h1>{t('profile.title')}</h1>
      <section className="card">
        <label className="field" style={{ marginBottom: 0 }}>
          <span>{t('profile.firstName')}</span>
          <input
            className="input"
            maxLength={30}
            autoComplete="off"
            value={nameDraft ?? firstName ?? ''}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={() => {
              if (nameDraft !== null) void setFirstName(nameDraft.trim());
              setNameDraft(null);
            }}
          />
          <small className="muted">{t('profile.firstNameHint')}</small>
        </label>
      </section>
      <section className="card">
        <fieldset className="chips" style={{ marginBottom: 16 }}>
          <legend className="legend">{t('profile.appearance')}</legend>
          {(['auto', 'light', 'dark'] as const).map((m) => (
            <Chip key={m} pressed={theme === m} onToggle={() => void setTheme(m)}>
              {t(`profile.theme${m === 'auto' ? 'Auto' : m === 'light' ? 'Light' : 'Dark'}`)}
            </Chip>
          ))}
        </fieldset>
        <fieldset className="chips">
          <legend className="legend">{t('profile.palette')}</legend>
          {PALETTES.map(([id, color]) => (
            <Chip key={id} pressed={palette === id} onToggle={() => void setPalette(id)}>
              <span className="swatch" style={{ background: color }} aria-hidden="true" />
              {t(`profile.palette_${id}`)}
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
  const [pass, setPass] = useState('');
  const [encText, setEncText] = useState<string | null>(null);
  const [impPass, setImpPass] = useState('');
  const [passError, setPassError] = useState('');

  async function exportAs(kind: 'json' | 'csv') {
    const e = await buildExport();
    if (kind === 'json') download(`mia-export-${today()}.json`, JSON.stringify(e, null, 2), 'application/json');
    else download(`mia-export-${today()}.csv`, toCsv(e), 'text/csv');
    await settingsRepo.set('lastExportAt', new Date().toISOString());
    toast({ message: t('profile.exported') });
  }

  async function exportEncrypted() {
    setPassError('');
    if (pass.length < MIN_PASSPHRASE) return setPassError(t('profile.passTooShort', { n: MIN_PASSPHRASE }));
    const text = await encryptExport(JSON.stringify(await buildExport()), pass);
    download(`mia-sauvegarde-${today()}.mia`, text, 'application/json');
    await settingsRepo.set('lastExportAt', new Date().toISOString());
    setPass('');
    toast({ message: t('profile.exported') });
  }

  async function pick(file: File | undefined) {
    setError(false);
    setPending(null);
    setEncText(null);
    setPassError('');
    if (!file) return;
    const text = await file.text();
    if (isEncryptedExport(text)) return setEncText(text);
    const r = parseExport(text);
    if (r.ok) setPending(r.value);
    else setError(true);
  }

  async function decryptFile() {
    if (!encText) return;
    setPassError('');
    const d = await decryptExport(encText, impPass);
    const r = d.ok ? parseExport(d.value) : d;
    setImpPass('');
    if (r.ok) {
      setPending(r.value);
      setEncText(null);
    } else {
      setPassError(t('profile.wrongPass'));
    }
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
        <h2>{t('profile.exportEnc')}</h2>
        <p className="muted">{t('profile.exportEncHint')}</p>
        <label className="field">
          <span>{t('profile.passphrase')}</span>
          <input className="input" type="password" autoComplete="new-password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </label>
        {passError && !encText && <p className="error" role="alert">{passError}</p>}
        <Button onClick={exportEncrypted}>{t('profile.exportEncBtn')}</Button>
      </section>
      <section className="card">
        <h2>{t('profile.import')}</h2>
        <label className="field">
          <span>{t('profile.importHint')}</span>
          <input className="input" type="file" accept="application/json,.json,.mia" onChange={(e) => void pick(e.target.files?.[0])} />
        </label>
        {encText && (
          <>
            <label className="field">
              <span>{t('profile.importPass')}</span>
              <input className="input" type="password" autoComplete="off" value={impPass} onChange={(e) => setImpPass(e.target.value)} />
            </label>
            {passError && <p className="error" role="alert">{passError}</p>}
            <Button variant="primary" disabled={!impPass} onClick={decryptFile}>{t('profile.decrypt')}</Button>
          </>
        )}
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
