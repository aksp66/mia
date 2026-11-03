import { describe, expect, it } from 'vitest';
import { ARTICLES, THEMES, isPendingReview, readingMinutes } from '../src/content/articles';

describe('contenus éducatifs', () => {
  it('identifiants uniques et thèmes connus', () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const themes = new Set(THEMES.map((t) => t.name));
    for (const a of ARTICLES) expect(themes.has(a.theme), `${a.slug} : thème inconnu`).toBe(true);
    for (const t of THEMES) expect(ARTICLES.some((a) => a.theme === t.name), `${t.name} sans article`).toBe(true);
  });

  it('chaque article est complet', () => {
    for (const a of ARTICLES) {
      expect(a.title.length, a.slug).toBeGreaterThan(3);
      expect(a.summary.length, a.slug).toBeGreaterThan(10);
      expect(a.body.length, a.slug).toBeGreaterThan(0);
      expect(a.revised, a.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(readingMinutes(a), a.slug).toBeGreaterThanOrEqual(1);
    }
  });

  it('sources en https, sans doublon, plusieurs organismes', () => {
    const hosts = new Set<string>();
    for (const a of ARTICLES) {
      // Seul l'article qui décrit la méthode de calcul de MIA elle-même n'a pas de source externe (cahier des charges, section 6).
      if (a.slug !== 'comment-mia-calcule') expect(a.sources.length, `${a.slug} : aucune source`).toBeGreaterThan(0);
      const urls = a.sources.map((s) => s.url);
      expect(new Set(urls).size, `${a.slug} : doublon`).toBe(urls.length);
      for (const u of urls) {
        expect(u, a.slug).toMatch(/^https:\/\//);
        hosts.add(new URL(u).hostname);
      }
    }
    expect(hosts.size).toBeGreaterThanOrEqual(5);
  });

  it('les articles conseillant un avis médical listent des situations', () => {
    for (const a of ARTICLES.filter((x) => x.seeDoctor)) expect(a.seeDoctor!.length, a.slug).toBeGreaterThan(0);
  });

  it('aucun texte visible ne promet de fertilité, d\'ovulation prévue ou de période sans risque', () => {
    const forbidden = [
      /sans risque/,
      /jours? (de )?fertiles?/,
      /fen[êe]tre (de )?fertile/,
      /p[ée]riode (de )?fertile/,
      /ovulation\s+(pr[ée]vue|estim[ée]e|calcul[ée]e|probable)/,
      /(date|jour|moment) (pr[ée]vu|estim[ée]|exact) (de l['’]|d['’])?ovulation/,
      /ovulation (le|au) \d/,
    ];
    for (const a of ARTICLES) {
      const visible = [a.title, a.summary, a.theme, JSON.stringify(a.body), ...(a.seeDoctor ?? []), ...a.sources.map((x) => x.label)]
        .join(' ')
        .toLowerCase()
        // Cette phrase précise ce que MIA ne fait pas : autorisée.
        .replace(/ni une période « sans risque »/g, '');
      for (const re of forbidden) expect(visible, `${a.slug} : ${re}`).not.toMatch(re);
    }
  });

  it('le contrôle détecte bien un contenu interdit', () => {
    expect('ovulation prévue le 14e jour').toMatch(/ovulation\s+(pr[ée]vue|estim[ée]e|calcul[ée]e|probable)/);
    expect('vos jours fertiles').toMatch(/jours? (de )?fertiles?/);
  });

  it('état de relecture : nom vide ou absent = non relu', () => {
    expect(isPendingReview({ reviewer: null })).toBe(true);
    expect(isPendingReview({ reviewer: '' })).toBe(true);
    expect(isPendingReview({ reviewer: '   ' })).toBe(true);
    expect(isPendingReview({ reviewer: 'Dr Exemple' })).toBe(false);
  });

  it('un nom de relecteur renseigné n\'est jamais vide', () => {
    for (const a of ARTICLES) expect(a.reviewer === null || a.reviewer.trim().length > 0, a.slug).toBe(true);
  });
});
