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
23. Polices Inter WOFF2 auto-hébergées, icônes PNG (sharp), manifeste relatif, `BASE_PATH` pour l'hébergement en sous-chemin.
24. PIN : blocage progressif (5 essais, puis 30 s doublées, plafond 1 h) + 2 tests ; écran de verrouillage avec compte à rebours.
25. Articles : réécriture complète, 15 articles / 7 thèmes, sources NHS, texte original (non copié), affichés « en attente de relecture ».
26. Calendrier : prolongation par la durée moyenne des règles (≥ 3 dates de fin) ; test de migration T22.
27. ESLint (TypeScript passé en 6.0 : typescript-eslint ne gère pas TS 7), workflows CI et déploiement Pages. 39 tests, lint propre, build OK.
28. Demande de publicités invisibles refusée (fraude publicitaire, contraire au cahier des charges).
29. Constat : dépôt privé, GitHub Pages indisponible (compte gratuit) ; options données : dépôt public ou Cloudflare/Netlify.
30. Thème clair / sombre / auto (attribut `data-theme`, réglage `theme`), écrans Bienvenue et Verrou centrés (`.screen--center`).
31. Empreinte : `src/data/biometric.ts` (WebAuthn + PRF), méthodes du `Vault`, bouton sur l'écran de verrou, réglage dans Profil → Code PIN ; 6 tests avec authentificateur simulé. 45 tests, lint et types OK.
32. Suggestions de design et de fonctionnalités reçues : réalisées pour la part compatible avec le cahier des charges ; refus motivés pour phases ovulatoires, partage partenaire, push serveur, cloud automatique.
33. Données : énergie et sommeil (1-5) dans `dayLogs`, export/import/CSV mis à jour. Journal : émojis d'humeur, échelles.
34. `src/domain/insights.ts` + tests ; encart « Ce que vos données montrent » dans l'Historique.
35. Design : dégradés, verre, jauge `CycleRing`, navigation à icône pleine, animations, vibration, pastilles colorées du calendrier, 4 palettes (contrastes vérifiés par script), `--color-brand-strong` assombri (4,48 → 4,91 sur le dégradé).
36. Sauvegarde chiffrée (`encryptExport` / `decryptExport`), écrans Données. 52 tests, lint, types, build OK.
