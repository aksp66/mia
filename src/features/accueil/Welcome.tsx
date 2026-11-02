import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Logo } from '../../ui/components';
import { settingsRepo } from '../../data/repositories';

export function Welcome() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [discreet, setDiscreet] = useState(false);
  const steps = [
    { title: t('welcome.s1Title'), body: t('welcome.s1Body') },
    { title: t('welcome.s2Title'), body: t('welcome.s2Body') },
    { title: t('welcome.s3Title'), body: t('welcome.s3Body') },
  ];
  const s = steps[step];

  async function finish() {
    await settingsRepo.set('discreet', discreet);
    await settingsRepo.set('welcomed', true);
    await settingsRepo.setMeta('installDate', new Date().toISOString());
    nav('/', { replace: true });
  }

  return (
    <main className="screen screen--full">
      <Logo />
      <h1>{s.title}</h1>
      <p>{s.body}</p>
      {step === 2 && (
        <label className="switch">
          <span>{t('welcome.discreet')}</span>
          <input type="checkbox" checked={discreet} onChange={(e) => setDiscreet(e.target.checked)} />
        </label>
      )}
      <div className="dots" aria-label={`Étape ${step + 1} sur 3`}>
        {steps.map((_, i) => (
          <span key={i} aria-current={i === step ? 'step' : undefined} />
        ))}
      </div>
      {step < 2 ? (
        <Button variant="primary" onClick={() => setStep(step + 1)}>
          {t('common.next')}
        </Button>
      ) : (
        <Button variant="primary" onClick={finish}>
          {t('common.start')}
        </Button>
      )}
    </main>
  );
}
