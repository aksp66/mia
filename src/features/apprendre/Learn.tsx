import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Banner } from '../../ui/components';
import { ARTICLES } from '../../content/articles';
import { fmtLong } from '../../app/hooks';

export default function Learn() {
  const { t } = useTranslation();
  const { article } = useParams();

  if (article) {
    const a = ARTICLES.find((x) => x.slug === article);
    if (!a) {
      return (
        <main className="screen">
          <p>{t('learn.notFound')}</p>
          <Link to="/apprendre">{t('common.back')}</Link>
        </main>
      );
    }
    return (
      <main className="screen article">
        <Link to="/apprendre">← {t('common.back')}</Link>
        <h1>{a.title}</h1>
        <p className="muted">
          {t('learn.revised', { date: fmtLong(a.revised) })} ·{' '}
          {a.reviewer ? t('learn.reviewedBy', { name: a.reviewer }) : t('learn.pendingReview')}
        </p>
        {a.body.map((p, i) => <p key={i}>{p}</p>)}
        {a.seeDoctor && <Banner kind="warn"><strong>{t('learn.seeDoctor')}</strong> {a.seeDoctor}</Banner>}
      </main>
    );
  }

  const themes = [...new Set(ARTICLES.map((a) => a.theme))];
  return (
    <main className="screen">
      <h1>{t('learn.title')}</h1>
      {themes.map((th) => (
        <section key={th} className="card">
          <h2>{th}</h2>
          <ul className="list">
            {ARTICLES.filter((a) => a.theme === th).map((a) => (
              <li key={a.slug}><Link to={`/apprendre/${a.slug}`}>{a.title}</Link></li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
