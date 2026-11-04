import { useTranslation } from 'react-i18next';

/** Histogramme des durées des derniers cycles valides : la plus récente en corail, la durée au-dessus de chaque barre. */
export function CycleBars({ lengths }: { lengths: number[] }) {
  const { t } = useTranslation();
  const max = Math.max(...lengths);
  return (
    <div className="bars" role="img" aria-label={t('home.cyclesAria', { list: lengths.join(', ') })}>
      {lengths.map((n, i) => (
        <div key={i} className="bars__col" aria-hidden="true">
          <span>{n}</span>
          <div className="bars__bar" style={{ height: `${Math.max(15, Math.round((n / max) * 80))}%` }} />
        </div>
      ))}
    </div>
  );
}
