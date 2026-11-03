import { useMemo, type ComponentType } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, Compass, Flower2, Hourglass, Search, Sparkles, Sprout, Stethoscope, Waves, type LucideProps } from 'lucide-react';
import { Banner } from '../../ui/components';
import { ARTICLES, THEMES, readingMinutes, type Article, type ThemeInfo } from '../../content/articles';
import { fmtLong } from '../../app/hooks';

const ICONS: Record<ThemeInfo['icon'], ComponentType<LucideProps>> = {
  compass: Compass,
  flower: Flower2,
  sprout: Sprout,
  activity: Activity,
  waves: Waves,
  stethoscope: Stethoscope,
  hourglass: Hourglass,
  sparkles: Sparkles,
};

/** Minuscules sans accents, pour une recherche tolérante. */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const plainText = (a: Article) =>
  [a.title, a.summary, a.theme, ...a.body.map((b) => ('h' in b ? b.h : 'p' in b ? b.p : b.ul.join(' ')))].join(' ');

function ArticleRow({ a, showTheme }: { a: Article; showTheme?: boolean }) {
  const { t } = useTranslation();
  return (
    <li className="learn-row">
      <Link to={`/apprendre/${a.slug}`}>{a.title}</Link>
      <span className="muted">{a.summary}</span>
      <span className="muted learn-meta">
        {t('learn.minutes', { n: readingMinutes(a) })}
        {showTheme && ` · ${a.theme}`}
        {a.seeDoctor && <span className="badge">{t('learn.medicalAdvice')}</span>}
      </span>
    </li>
  );
}

function ArticleView({ a }: { a: Article }) {
  const { t } = useTranslation();
  const related = ARTICLES.filter((x) => x.theme === a.theme && x.slug !== a.slug).slice(0, 3);
  return (
    <main className="screen article">
      <Link to={`/apprendre?theme=${encodeURIComponent(a.theme)}`}>← {a.theme}</Link>
      <h1>{a.title}</h1>
      <p className="muted">
        {t('learn.minutes', { n: readingMinutes(a) })} · {t('learn.revised', { date: fmtLong(a.revised) })} ·{' '}
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
      {related.length > 0 && (
        <>
          <h2>{t('learn.related')}</h2>
          <ul className="list">
            {related.map((r) => (
              <ArticleRow key={r.slug} a={r} />
            ))}
          </ul>
        </>
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
                </a>{' '}
                <span className="muted">({s.lang === 'fr' ? 'FR' : 'EN'})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

export default function Learn() {
  const { t } = useTranslation();
  const { article } = useParams();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const themeName = params.get('theme');
  const theme = THEMES.find((x) => x.name === themeName);

  const results = useMemo(() => {
    const needle = norm(q.trim());
    if (needle.length < 2) return null;
    return ARTICLES.filter((a) => norm(plainText(a)).includes(needle));
  }, [q]);

  if (article) {
    const a = ARTICLES.find((x) => x.slug === article);
    if (a) return <ArticleView a={a} />;
    return (
      <main className="screen">
        <p>{t('learn.notFound')}</p>
        <Link to="/apprendre">{t('common.back')}</Link>
      </main>
    );
  }

  const featured = ARTICLES.filter((a) => a.featured);

  return (
    <main className="screen">
      <h1>{t('learn.title')}</h1>

      <form role="search" className="learn-search" onSubmit={(e) => e.preventDefault()}>
        <Search size={20} aria-hidden="true" />
        <input
          className="input"
          type="search"
          aria-label={t('learn.search')}
          placeholder={t('learn.search')}
          value={q}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            if (e.target.value) next.set('q', e.target.value);
            else next.delete('q');
            setParams(next, { replace: true });
          }}
        />
      </form>

      {results ? (
        <section aria-live="polite">
          <h2>{t('learn.resultsCount', { count: results.length })}</h2>
          {results.length === 0 ? (
            <p className="muted">{t('learn.noResult')}</p>
          ) : (
            <ul className="list">
              {results.map((a) => (
                <ArticleRow key={a.slug} a={a} showTheme />
              ))}
            </ul>
          )}
        </section>
      ) : theme ? (
        <section>
          <Link to="/apprendre">← {t('learn.allThemes')}</Link>
          <h2 style={{ marginTop: 12 }}>{theme.name}</h2>
          <p className="muted">{theme.blurb}</p>
          <ul className="list">
            {ARTICLES.filter((a) => a.theme === theme.name).map((a) => (
              <ArticleRow key={a.slug} a={a} />
            ))}
          </ul>
        </section>
      ) : (
        <>
          <section>
            <h2>{t('learn.start')}</h2>
            <ul className="list">
              {featured.map((a) => (
                <ArticleRow key={a.slug} a={a} showTheme />
              ))}
            </ul>
          </section>
          <section>
            <h2>{t('learn.themes')}</h2>
            <ul className="theme-grid">
              {THEMES.map((th) => {
                const Icon = ICONS[th.icon];
                const count = ARTICLES.filter((a) => a.theme === th.name).length;
                return (
                  <li key={th.name}>
                    <Link className="theme-card" to={`/apprendre?theme=${encodeURIComponent(th.name)}`}>
                      <Icon size={28} strokeWidth={1.75} aria-hidden="true" />
                      <strong>{th.name}</strong>
                      <span className="muted">{th.blurb}</span>
                      <span className="muted">{t('learn.articlesCount', { count })}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </main>
  );
}
