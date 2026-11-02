import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Logo } from '../../ui/components';
import { vault } from '../../data/vault';

export function LockScreen() {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const r = await vault.unlock(pin);
    setBusy(false);
    if (!r.ok) {
      setError(true);
      setPin('');
    }
  }

  return (
    <main className="screen screen--full">
      <Logo />
      <h1>{t('lock.title')}</h1>
      <form onSubmit={submit}>
        <label className="field">
          <span>{t('lock.pin')}</span>
          <input
            className="input"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={pin}
            aria-invalid={error}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          />
        </label>
        {error && <Banner kind="error">{t('lock.wrong')}</Banner>}
        <Button variant="primary" type="submit" disabled={busy || pin.length < 4}>
          {t('lock.unlock')}
        </Button>
      </form>
      <p className="muted">{t('lock.forgot')}</p>
    </main>
  );
}
