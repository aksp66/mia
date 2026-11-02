import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Banner, Button, useToast } from '../../ui/components';
import { useVaultStatus } from '../../app/useVault';
import { PIN_PATTERN, vault } from '../../data/vault';

export default function Security() {
  const { t } = useTranslation();
  const toast = useToast();
  const status = useVaultStatus();
  const [pin, setPin] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState('');
  const digits = (s: string) => s.replace(/\D/g, '').slice(0, 6);

  async function enable() {
    if (!PIN_PATTERN.test(pin)) return setError(t('security.badPin'));
    if (pin !== again) return setError(t('security.mismatch'));
    const r = await vault.enable(pin);
    if (!r.ok) return setError(t('security.failed'));
    setPin('');
    setAgain('');
    setError('');
    toast({ message: t('security.enabled') });
  }

  return (
    <main className="screen">
      <Link to="/profil">← {t('common.back')}</Link>
      <h1>{t('profile.pin')}</h1>
      <Banner kind="warn">{t('security.limits')}</Banner>
      {status === 'disabled' ? (
        <>
          <label className="field">
            <span>{t('security.newPin')}</span>
            <input className="input" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(digits(e.target.value))} />
          </label>
          <label className="field">
            <span>{t('security.confirmPin')}</span>
            <input className="input" type="password" inputMode="numeric" autoComplete="off" value={again} onChange={(e) => setAgain(digits(e.target.value))} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <Button variant="primary" onClick={enable}>{t('security.enable')}</Button>
        </>
      ) : (
        <>
          <p>{t('security.active')}</p>
          <Button variant="primary" onClick={() => void vault.lock()}>{t('security.lockNow')}</Button>
          <Button variant="danger" onClick={async () => {
            const r = await vault.disable();
            toast({ message: r.ok ? t('security.disabled') : t('security.failed') });
          }}>{t('security.disable')}</Button>
        </>
      )}
    </main>
  );
}
