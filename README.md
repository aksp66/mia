# MIA

Application de suivi du cycle menstruel, sous forme d'application web progressive (PWA) installable sur téléphone. Les données restent sur l'appareil : aucun compte, aucun serveur, aucun envoi réseau.

Document de référence : *Cahier des charges MIA, version 2.0*.

> MIA est un outil de suivi et d'information. Elle ne remplace pas un professionnel de santé, ne garantit aucune date de règles ni d'ovulation, et n'est pas une méthode contraceptive.

## État du projet

Version 1 en cours de développement. Le suivi détaillé est dans [tasks.md](tasks.md) et l'historique des actions dans [history.md](history.md).

Fonctionnalités disponibles : accueil initial, Accueil, Calendrier, Journal, Historique, Apprendre, Profil, export JSON/CSV, import (fusion ou remplacement), suppression totale, rappels (message dans l'application et fichier `.ics`), mode discret, verrouillage par code PIN avec chiffrement local.

Les articles éducatifs (15 articles, 7 thèmes) sont rédigés pour MIA à partir d'informations de santé publique, avec leurs sources. Ils sont affichés « en attente de relecture » : ils doivent être relus et signés par une personne compétente en santé avant une diffusion publique.

## Prérequis

- Node.js 22 ou plus récent
- npm 10 ou plus récent

## Démarrage

```bash
npm install
npm run dev        # serveur de développement
npm test           # tests automatisés
npm run test:cov   # tests avec couverture du domaine (seuil : 95 %)
npm run lint       # ESLint
npm run icons      # régénère les icônes PNG depuis les SVG
npm run build      # vérification des types + build de production (dossier dist/)
npm run preview    # prévisualiser le build
```

## Mise en ligne (GitHub Pages)

1. Sur GitHub : Settings → Pages → Source : **GitHub Actions**.
2. Fusionner `develop` dans `main` (pull request) : le workflow `.github/workflows/deploy.yml` teste, construit et publie.
3. L'application est servie sur `https://aksp66.github.io/mia/` (HTTPS). Ouvrir ce lien sur le téléphone avec Chrome, puis menu ⋮ → **Installer l'application** (ou « Ajouter à l'écran d'accueil »).

Autres hébergeurs statiques (Netlify, Cloudflare Pages) : `npm run build`, publier `dist/`. Pour un sous-chemin, définir `BASE_PATH` (ex. `BASE_PATH=/mia/`) ; à la racine d'un domaine, ne rien définir.
Test sur téléphone en local : `npm run dev -- --host`, puis ouvrir l'adresse du réseau local (le service worker n'est actif qu'en HTTPS ou sur localhost).

## Stack

TypeScript (mode strict), React, Vite, vite-plugin-pwa (Workbox), IndexedDB via Dexie, React Router, Zod, i18next, date-fns, Web Crypto API (PBKDF2, AES-GCM), Vitest et fast-check.

## Structure

```
src/
├── domain/     calculs et règles du cycle (TypeScript pur, sans React)
├── data/       base Dexie, dépôts, export/import, verrouillage (vault)
├── features/   un dossier par fonctionnalité (accueil, calendrier, journal...)
├── ui/         composants et feuille de styles (jetons CSS)
├── content/    articles éducatifs
├── i18n/       textes de l'interface (français)
└── app/        routes, initialisation, hooks
tests/          tests du domaine, des données et du verrouillage
```

Les seuils de calcul (durées plausibles, nombre de cycles minimal, écarts) sont centralisés dans `src/domain/cycle.config.ts` ; ils restent à valider par le référent santé.

## Principes

- Les dates de cycle sont des dates calendaires `AAAA-MM-JJ`, sans fuseau.
- Les valeurs dérivées (cycles, estimations) ne sont jamais stockées : elles sont recalculées à chaque lecture.
- Aucune prédiction avant trois cycles valides ; aucune ovulation ni période « sans risque » n'est calculée.
- Politique de sécurité du contenu stricte, aucune ressource distante (polices, icônes, scripts).

## Verrouillage par PIN : limites

Un code de 4 à 6 chiffres protège contre un accès occasionnel au téléphone, pas contre une personne déterminée disposant d'outils techniques. Un code oublié rend les données irrécupérables sauf export préalable. Les essais sont limités (blocage dès le 5e échec : 30 s, doublé à chaque échec, plafonné à 1 h). Limite restante : les données sont en clair pendant une session ouverte ; si l'application est tuée, elles y restent jusqu'au prochain verrouillage.

## Stockage local

Les données sont dans IndexedDB. Elles disparaissent si le navigateur est vidé, si l'application est désinstallée ou si le téléphone est perdu : exportez-les régulièrement.

## Workflow Git

- `develop` : reçoit le code, les mises à jour et les tests.
- `main` : reçoit uniquement des pull requests depuis `develop`.
- Messages de commit sans mention de co-auteur.

## Licence

À définir.
