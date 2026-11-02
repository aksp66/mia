# MIA — Historique des actions

Journal chronologique des actions menées sur le projet.

## 2026-11-02

1. Lecture du cahier des charges MIA v2.0. Le dossier du projet était vide.
2. Installation de React, Router, Dexie, Zod, date-fns, i18next, lucide-react, puis Vite, Vitest, fast-check, vite-plugin-pwa, fake-indexeddb.
3. Création de `package.json`, `tsconfig.json`, `vite.config.ts` (PWA + test), `index.html` (CSP, referrer), icônes SVG.
4. Une première écriture groupée par le shell a échoué (guillemets dans un heredoc) : aucun fichier créé ; reprise avec l'outil d'écriture de fichiers.
5. Domaine : `cycle.config.ts`, `calendarDate.ts`, `cycle.ts`, `prediction.ts`, `validation.ts`.
6. Tests du domaine (`tests/domain.test.ts`) : 1 échec initial dû à une erreur dans le test (écart de 17 jours, donc plausible) ; test corrigé ; 23 tests passent, 100 % de lignes couvertes.
7. Données : `db.ts` (schéma v1), `result.ts`, `repositories.ts`, `exchange.ts` (export JSON/CSV, import en transaction).
8. Tests des données (`tests/data.test.ts`) : aller-retour d'export, fichier invalide, doublons ; 29 tests au total passent.
9. Interface : textes français (`i18n/fr.ts`), `styles.css` (jetons, thème sombre), composants (Button, Chip, Banner, Sheet, Toast, Logo), hooks.
10. Écrans : Welcome, Home, Calendar, Journal, History, Learn (3 articles brouillons), Profile (rappels, données, `.ics`).
11. Vérification des types : 1 erreur de typage dans `Journal.tsx` corrigée ; `tsc` propre.
12. Build de production réussi ; service worker et manifeste générés.
13. Bilan communiqué : PIN non fait, articles à relire, écarts (police, CSS Modules, routage `#`, icônes PNG), tests E2E / accessibilité / Lighthouse / appareils restants.
14. Création de `tasks.md` (suivi des tâches) et `history.md` (ce fichier).
15. Verrouillage PIN : `src/data/vault.ts` (PBKDF2 / AES-GCM, coffre dans `meta.vault`, verrou auto 2 min), écrans `LockScreen` et `Security`, intégration dans `App` et `Profile`, textes français.
16. Tests `tests/vault.test.ts` (7 cas, dont T15). Deux erreurs de test corrigées : getter perdu par `Object.assign` (fausse visibilité), puis `vi.waitFor` sous faux timers.
17. Test aléatoire instable du domaine (fast-check générait une date invalide) : corrigé avec `noInvalidDate`.
18. Erreur d'apostrophes non échappées dans `fr.ts` corrigée ; 36 tests passent, build OK.
19. `git init -b main` + `.gitignore` (node_modules, dist, coverage, tsbuildinfo). Aucun commit.
20. Premier commit sur `main` (base initiale), puis création de la branche `develop` (réception des mises à jour de code et de tests ; `main` ne reçoit que par pull request depuis `develop`).
21. Ajout de `.prettierignore` : Prettier est désactivé sur l'ensemble du code.
22. Ajout de `README.md` (présentation, démarrage, structure, limites, workflow Git).
