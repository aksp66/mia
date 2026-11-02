import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Logo } from '../../ui/components';
import { vault } from '../../data/vault';

export function LockScreen() {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [waitSec, setWaitSec] = useState(0);

  useEffect(() => {
    void vault.lockoutRemaining().then((ms) => setWaitSec(Math.ceil(ms / 1000)));
  }, []);
  useEffect(() => {
    if (waitSec <= 0) return;
    const id = setTimeout(() => setWaitSec((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [waitSec]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const r = await vault.unlock(pin);
    setBusy(false);
    if (!r.ok) {
      const m = /^tooMany:(\d+)/.exec(r.error);
      setWaitSec(m ? Math.ceil(Number(m[1]) / 1000) : Math.ceil((await vault.lockoutRemaining()) / 1000));
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
        {waitSec > 0 && <Banner kind="warn">{t('lock.wait', { n: waitSec })}</Banner>}
        <Button variant="primary" type="submit" disabled={busy || waitSec > 0 || pin.length < 4}>
          {t('lock.unlock')}
        </Button>
      </form>
      <p className="muted">{t('lock.forgot')}</p>
    </main>
  );
}
