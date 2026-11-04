import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

/** T30 : contrastes de la palette par défaut « Rose Poudré » (WCAG 2.2) ; les mêmes valeurs figurent dans `src/ui/styles.css`. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const T = {
  bg: '#faf8f7',
  card: '#ffffff',
  text: '#362c2e',
  muted: '#5e5058',
  accent: '#a8326e',
  accent2: '#b03a74',
  onAccent: '#ffffff',
  coral: '#e27d9f',
  lavender: '#c3b1e1',
  lavenderText: '#6b4fa0',
  surface: '#fcebf1',
  mint: '#d6eee4',
  lavenderSoft: '#e9e1f6',
  fieldBorder: '#9b7f8d',
};

describe('contrastes de la palette Rose Poudré (T30)', () => {
  it('texte courant et secondaire : 4,5:1 au moins', () => {
    for (const bg of [T.bg, T.card, T.surface, T.mint, T.lavenderSoft]) {
      expect(ratio(T.text, bg), `texte sur ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
    for (const bg of [T.bg, T.card, T.surface]) expect(ratio(T.muted, bg), `texte secondaire sur ${bg}`).toBeGreaterThanOrEqual(4.5);
  });
  it('boutons, liens et texte rose : 4,5:1 au moins', () => {
    expect(ratio(T.onAccent, T.accent)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(T.onAccent, T.accent2)).toBeGreaterThanOrEqual(4.5);
    for (const bg of [T.bg, T.card, T.surface]) expect(ratio(T.accent, bg), `lien sur ${bg}`).toBeGreaterThanOrEqual(4.5);
    expect(ratio(T.lavenderText, T.lavenderSoft)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(T.lavenderText, T.card)).toBeGreaterThanOrEqual(4.5);
  });
  it('contours de champs : 3:1 au moins', () => {
    expect(ratio(T.fieldBorder, T.card)).toBeGreaterThanOrEqual(3);
    expect(ratio(T.fieldBorder, T.bg)).toBeGreaterThanOrEqual(3);
  });
  it('corail et lavande sont réservés aux surfaces : ils échouent comme texte sur fond clair, texte sombre dessus lisible', () => {
    expect(ratio(T.coral, T.card)).toBeLessThan(4.5);
    expect(ratio(T.lavender, T.card)).toBeLessThan(3);
    expect(ratio(T.text, T.coral)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(T.text, T.lavender)).toBeGreaterThanOrEqual(4.5);
  });
  it('les valeurs du test correspondent à la feuille de styles', () => {
    const css = readFileSync('src/ui/styles.css', 'utf8');
    for (const v of [T.bg, T.text, T.accent, T.coral, T.lavender, T.lavenderText, T.fieldBorder, T.surface]) {
      expect(css.toLowerCase(), v).toContain(v);
    }
  });
});
