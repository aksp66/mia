# MIA — Suivi des tâches (V1)

Référence : Cahier des charges MIA v2.0 (02/11/2026). Dernière mise à jour : 2026-11-02.

## Fait

- [x] Socle projet : Vite, React 18, TypeScript strict, vite-plugin-pwa, manifeste, icônes SVG
- [x] Domaine de calcul (`src/domain/`) : dates, cycles, prédiction, validation, seuils centralisés
- [x] Tests du domaine, 100 % de lignes couvertes (T01 à T05, T16, T18)
- [x] Couche données (`src/data/`) : Dexie, dépôts, type Result
- [x] Export JSON et CSV, import validé (Zod) en transaction, fusion ou remplacement (T13, T14)
- [x] Interface : accueil initial, Accueil, Calendrier, Journal, Historique, Apprendre, Profil
- [x] Mode discret, rappel dans l'application, rappel `.ics` neutre
- [x] Suppression totale (mot SUPPRIMER), annulation de suppression (5 s)
- [x] CSP stricte, aucune ressource distante, thème sombre par variables CSS
- [x] Verrouillage par PIN 4-6 chiffres, chiffrement PBKDF2 310 000 it. / AES-GCM, verrou auto après 2 min (T15, tests automatisés ; à valider sur appareil)
- [x] Dépôt git initialisé (branche main, .gitignore) — aucun commit pour l'instant
- [x] Durée moyenne des règles dans les jours estimés du calendrier
- [x] Migration de schéma testée (T22)
- [x] Police Inter auto-hébergée (4 graisses WOFF2), icônes PNG générées (`npm run icons`)
- [x] ESLint + workflows GitHub Actions : CI (lint, tests, build, audit) et déploiement GitHub Pages
- [x] 15 articles structurés avec sources (en attente de relecture)
- [x] PIN : blocage progressif après 5 échecs
- [x] Thème clair / sombre / automatique (Profil → Apparence)
- [x] Déverrouillage par empreinte (WebAuthn + PRF), PIN en secours — à valider sur appareil réel
- [x] Écrans Bienvenue et Verrou centrés verticalement
- [x] Build de production OK (JS initial ≈ 149 Ko gzip, < 200 Ko)

## À faire

### Fonctionnel
- [ ] Relecture et signature des 15 articles par un référent santé (renseigner `reviewer` dans `src/content/articles.ts`)

### Écarts au cahier des charges
- [ ] Passer les styles en CSS Modules (actuellement une feuille globale `src/ui/styles.css`)
- [ ] Décider : routage `#` (actuel, compatible GitHub Pages) ou routes classiques avec repli serveur
- [ ] Husky (hooks de commit). Prettier volontairement désactivé (`.prettierignore`)

### Qualité et recette
- [ ] Tests de bout en bout Playwright, dont hors ligne et inspection du trafic réseau (T10)
- [ ] Tests de composants (Testing Library)
- [ ] Accessibilité : axe-core (T19), parcours TalkBack
- [ ] Audit Lighthouse, performance sur Android d'entrée de gamme (T21)
- [ ] Tests sur au moins 3 appareils Android réels, largeurs 360 / 390 / 430 px
- [ ] Notice utilisatrice, rapport de tests, liste des limites connues

### Validation externe (hors code)
- [ ] Seuils de calcul à confirmer par le référent santé (section 6.2)
- [ ] Examen juridique : loi togolaise 2019-014, RGPD si diffusion dans l'UE
- [ ] Désigner le responsable de maintenance et le référent santé
- [ ] Maquettes graphiques détaillées (Figma ou équivalent)

## Points d'attention
- Empreinte : repose sur WebAuthn + extension PRF ; si l'appareil ou le navigateur ne la gère pas, l'option est refusée (non simulée). Non testé sur téléphone réel, seulement avec un authentificateur simulé.
- PIN : limite restante — données en clair pendant une session ouverte (si l'appli est tuée, elles y restent jusqu'au prochain verrouillage). Correction complète = chiffrement permanent avec jeu de travail en mémoire (réécriture de la couche données). Réglages non sensibles en clair.
- Publicités : refusées (pubs non visibles = fraude publicitaire ; contraire au cahier des charges : aucun traceur tiers, CSP stricte).
- Les articles de `src/content/articles.ts` sont des brouillons : ne pas publier sans relecture signée.
- Le rendu n'a pas encore été vérifié dans un navigateur.
