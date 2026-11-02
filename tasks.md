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
- [x] Build de production OK (JS initial ≈ 149 Ko gzip, < 200 Ko)

## À faire

### Fonctionnel
- [ ] Durée moyenne des règles dans les jours estimés du calendrier (si ≥ 3 dates de fin)
- [ ] Contenus éducatifs complets (thèmes de la section 17) et relecture par un référent santé
- [ ] Migrations de schéma Dexie testées (T22)

### Écarts au cahier des charges
- [ ] Auto-héberger la police Inter (WOFF2 latin, ≈ 40 Ko)
- [ ] Passer les styles en CSS Modules (actuellement une feuille globale `src/ui/styles.css`)
- [ ] Décider : routage `#` (actuel) ou routes classiques avec repli serveur
- [ ] Icônes PNG (192, 512, maskable) pour l'installation sur certains téléphones
- [ ] Mettre en place ESLint, Prettier, Husky et GitHub Actions

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
- PIN : limites connues — données en clair pendant une session ouverte (si l'appli est tuée, elles y restent jusqu'au prochain verrouillage) ; pas de limitation du nombre d'essais ; réglages non sensibles en clair.
- Les articles de `src/content/articles.ts` sont des brouillons : ne pas publier sans relecture signée.
- Le rendu n'a pas encore été vérifié dans un navigateur.
