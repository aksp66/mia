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
        {a.body.map((b, i) =>
          'h' in b ? (
            <h2 key={i}>{b.h}</h2>
          ) : 'p' in b ? (
            <p key={i}>{b.p}</p>
          ) : (
            <ul key={i}>
              {b.ul.map((li, j) => (
                <li key={j}>{li}</li>
              ))}
            </ul>
          ),
        )}
        {a.seeDoctor && (
          <Banner kind="warn">
            <strong>{t('learn.seeDoctor')}</strong>
            <ul>
              {a.seeDoctor.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </Banner>
        )}
        {a.sources.length > 0 && (
          <>
            <h2>{t('learn.sources')}</h2>
            <p className="muted">{t('learn.sourcesNote')}</p>
            <ul>
              {a.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
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
              <li key={a.slug}>
                <Link to={`/apprendre/${a.slug}`}>{a.title}</Link>
                <br />
                <span className="muted">{a.summary}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
