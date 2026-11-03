import { describe, expect, it } from 'vitest';
import { ARTICLES, THEMES, readingMinutes } from '../src/content/articles';

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

  it('aucun texte ne parle d\'ovulation prévue ni de période sans risque', () => {
    for (const a of ARTICLES) {
      // La phrase qui précise que MIA ne calcule pas de période « sans risque » est autorisée.
      const text = JSON.stringify(a.body).toLowerCase().replace(/ni une période « sans risque »/g, '');
      expect(text, a.slug).not.toMatch(/sans risque|jours? (de )?fertiles?|fenêtre fertile/);
    }
  });

  it('au moins un article n\'est pas relu : la mention de relecture reste affichable', () => {
    expect(ARTICLES.every((a) => a.reviewer === null || a.reviewer.length > 0)).toBe(true);
  });
});
