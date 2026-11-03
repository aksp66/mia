# MIA — Cahier des charges fonctionnel et technique

**Version 2.1 — avenant au document de référence v2.0 du 2 novembre 2026**

| | |
|---|---|
| Date | 3 novembre 2026 |
| Document de base | Cahier des charges MIA v2.0 (le présent texte ne le remplace pas : il en modifie ou complète les sections indiquées) |
| Statut | À valider par la maîtrise d'ouvrage |
| Règle | Conformément à la section 23 de la v2.0, toute fonctionnalité ajoutée ou modification du stockage est consignée ici avant d'être considérée comme acquise. |

## 1. Objet de cette version

La v2.0 a été mise en œuvre sur la branche `develop`. Cette version 2.1 :

1. consigne les fonctionnalités ajoutées à la demande du porteur de projet, absentes de la v2.0 (§ 2) ;
2. précise les choix techniques arrêtés pendant le développement (§ 4) ;
3. enregistre les propositions écartées parce qu'elles contredisent la v2.0 (§ 3) ;
4. met à jour les tests, les risques et les points restant à valider (§ 6 à 8).

Toute exigence de la v2.0 non citée ci-dessous est conservée à l'identique.

## 2. Fonctionnalités ajoutées

| # | Fonctionnalité | Section v2.0 concernée | Priorité |
|---|---|---|---|
| A1 | Thème clair / sombre / automatique, choix dans Profil → Apparence | 4 (Thème sombre, « Pourrait ») | Devrait |
| A2 | Quatre palettes de couleurs au choix | 10.2 | Pourrait |
| A3 | Déverrouillage par empreinte (ou verrouillage d'écran de l'appareil), PIN conservé en secours | 13.2 | Pourrait |
| A4 | Blocage progressif après échecs de saisie du PIN | 13.2 | Devrait |
| A5 | Énergie et sommeil (1 à 5) et émojis d'humeur dans le Journal | 4, 7.1, 7.2 | Pourrait |
| A6 | Constats automatiques descriptifs dans l'Historique | 4 (Historique) | Pourrait |
| A7 | Jauge circulaire du cycle sur l'Accueil | 5.3 (Accueil) | Devrait |
| A8 | Pastilles colorées de symptômes dans le calendrier (5 groupes) | 5.3, 10.5 | Pourrait |
| A9 | Sauvegarde chiffrée par mot de passe (fichier `.mia`) et son import | 4 (Import), 7.3 | Devrait |
| A10 | Animations douces, retour haptique léger | 11 | Pourrait |
| A11 | Prolongation des jours estimés du calendrier par la durée moyenne des règles, si au moins 3 dates de fin | 6.5 (déjà prévu) | Doit |
| A12 | Contenus éducatifs : 15 articles rédigés, sources indiquées | 17 | Doit |

### 2.1 Thème et palettes (A1, A2)

Le réglage `theme` prend les valeurs `auto` (réglage du téléphone), `light`, `dark`. Le réglage `palette` prend les valeurs `peony` (par défaut), `lavender`, `sand`, `mint`. Ce sont des réglages non sensibles, stockés en clair dans `settings`.

| Palette | Clair : accent / fond | Sombre : accent / fond |
|---|---|---|
| Rose Pivoine (défaut) | #713B61 / #FFF8FA | #E7A9C0 / #1E141B |
| Nuit Lavande | #4F3D8F / #F8F6FF | #CBBCFF / #17141F |
| Sable Chaud | #6B4A1E / #FDF8F1 | #E8C79C / #1C1710 |
| Menthe | #1F5C4D / #F4FBF8 | #9FDCC7 / #101B17 |

Exigence : chaque palette respecte 4,5:1 pour le texte et les liens, en clair comme en sombre, sur le fond et sur le fond dégradé (vérifié par calcul le 3 novembre 2026). Le lien rose de la palette par défaut passe de #A84F72 à #9F4A6C pour tenir ce seuil sur le dégradé (4,91:1).

### 2.2 Journal enrichi (A5)

- `dayLogs` reçoit deux champs facultatifs : `energy` et `sleep`, entiers de 1 à 5. Aucun index n'est ajouté : la version du schéma IndexedDB reste 1 et les données existantes sont conservées (test T22).
- L'humeur utilise les codes existants (`moodCalm`, `moodIrritable`, `moodSad`, `moodAnxious`) avec un émoji d'accompagnement ; le libellé reste affiché.
- Le format d'export JSON reste `formatVersion: 1` : les champs sont facultatifs, un fichier de la v2.0 reste importable. L'export CSV gagne les colonnes `energie` et `sommeil`.

### 2.3 Constats automatiques (A6)

Calculés par une fonction pure (`domain/insights.ts`), sur l'appareil, jamais stockés. Constats possibles : durée moyenne et écart des derniers cycles valides (formulés « assez réguliers » si l'écart est de 7 jours au plus, « varient d'un mois à l'autre » sinon) ; durée moyenne des règles (au moins 3 dates de fin) ; symptôme le plus noté, énergie moyenne et sommeil moyen (au moins 3 jours renseignés).

Exigences : formulation descriptive ; mention permanente « ce ne sont pas des conseils médicaux » ; aucun jugement de santé, aucune alerte, aucune mention de fertilité ou d'ovulation.

### 2.4 Jauge et calendrier (A7, A8)

- La jauge affiche « Jour N » et l'avancement dans le cycle par rapport à la durée moyenne, seulement quand cette durée existe. Elle affiche « Règles estimées dans N jours » uniquement pour une estimation à date unique. Elle n'affiche **aucune phase** ni aucune mention de fertilité (section 6.5). Elle est masquée en mode discret.
- Les cinq groupes de pastilles du calendrier : douleur (crampes, maux de tête, douleurs dorsales), énergie (fatigue, sommeil), digestion (ballonnements, nausées, envies alimentaires), humeur, corps (acné, sensibilité des seins, pertes). Trois pastilles au plus par jour. La couleur ne porte jamais l'information seule : les pastilles ont une bordure, le jour est annoncé aux lecteurs d'écran avec ses symptômes, et le détail est donné dans le panneau du jour.

### 2.5 Sauvegarde chiffrée (A9)

- Format `mia-export-encrypted`, version 1 : enveloppe JSON contenant `kdf: PBKDF2-SHA256`, `iterations` (310 000), `salt`, `iv`, `data` ; contenu chiffré en AES-GCM 256 bits.
- Le chiffrement et le déchiffrement ont lieu sur l'appareil. Le fichier peut être rangé où l'utilisatrice le souhaite (stockage personnel, messagerie) : aucun serveur MIA n'intervient et personne ne peut le lire sans le mot de passe.
- Mot de passe de 8 caractères au minimum, jamais stocké. Mot de passe perdu = fichier irrécupérable, ce que l'écran indique.
- Un fichier altéré ou un mauvais mot de passe est refusé sans modifier les données (même règle que T14).
- Ce mécanisme répond au risque de perte des données (section 22) sans compte ni synchronisation, qui restent hors périmètre.

## 3. Propositions écartées

| Proposition | Décision | Motif |
|---|---|---|
| Libellés « phase ovulatoire », jours de fertilité, « période sensible » | Écartée | Interdit par les sections 2, 6.5 et 21 (aucune ovulation, aucune fertilité, aucune période « sans risque ») |
| Partage avec un(e) partenaire, par lien éphémère ou chiffré | Écartée en V1 | Partage de données hors périmètre (section 21) ; un lien suppose un serveur |
| Notifications push | Reportée | Exigent un serveur (sections 14 et 21). Le rappel dans l'application et le fichier `.ics` restent la solution V1 |
| Sauvegarde automatique sur un cloud, QR code de sauvegarde | Reportée | Synchronisation hors V1. Remplacée par la sauvegarde chiffrée téléchargeable (A9) |
| Publicités, y compris non visibles | Écartée définitivement | Une publicité non visible gonfle artificiellement les affichages (fraude publicitaire, motif de suspension par les régies) ; contraire à la section 13 (aucun traceur ni outil tiers, CSP bloquante, public comprenant des mineures). Le modèle de lancement reste gratuit, sans publicité (section 1) |

## 4. Choix techniques arrêtés

Compléments à la section 8 :

| Sujet | Décision |
|---|---|
| TypeScript | Version 6.0 (et non 7) : l'outil de lint ne gère pas encore la 7. À reconsidérer quand il le fera |
| Polices | Inter, 4 graisses (400, 500, 600, 700) en WOFF2 latin, auto-hébergées (≈ 24 Ko chacune) ; politique CSP `font-src 'self'` |
| Icônes | SVG et PNG (192, 512, maskable 512, 180 pour iOS), générés par `npm run icons` |
| Routage | Adresses avec `#` (HashRouter) : fonctionne sur tout hébergement statique sans règle de repli serveur |
| Hébergement | Chemin de base paramétrable (`BASE_PATH`) ; manifeste en chemins relatifs |
| Styles | Feuille CSS globale à jetons (écart avec les CSS Modules de la v2.0, conservé pour l'instant) |
| Prettier | Désactivé volontairement (`.prettierignore`) |
| Qualité | ESLint ; GitHub Actions : intégration continue (lint, tests avec couverture, build, audit) et déploiement |
| Workflow Git | `develop` reçoit le code et les tests ; `main` ne reçoit que par pull request depuis `develop` ; aucune mention de co-auteur dans les commits |

## 5. Sécurité : mise à jour de la section 13.2

### 5.1 Blocage progressif du PIN (A4)

Cinq essais, puis blocage de 30 secondes, doublé à chaque échec supplémentaire, plafonné à 1 heure. Le compteur est stocké (`meta.attempts`) : fermer l'application ne le remet pas à zéro. Un essai réussi le remet à zéro. Le blocage s'applique aussi au bon code.

### 5.2 Empreinte (A3)

- Fonctionne par WebAuthn (authentificateur de plateforme) et son extension PRF : le PIN est chiffré (AES-GCM) avec un secret que seul l'authentificateur restitue après vérification biométrique ou du verrouillage d'écran. Le PIN n'est jamais stocké en clair.
- L'activation demande le PIN. Si l'appareil ou le navigateur ne gère pas PRF, l'option est refusée avec un message ; elle n'est pas simulée.
- Le PIN reste toujours disponible en secours.
- Désactiver le verrou supprime aussi l'empreinte.

### 5.3 Limites connues à communiquer

- **Données en clair pendant une session ouverte.** Le modèle actuel restaure les données en clair à l'ouverture et les rechiffre au verrouillage. Si l'application est interrompue brutalement, elles restent en clair jusqu'au prochain verrouillage. Correction complète prévue : chiffrement permanent avec un jeu de travail en mémoire (réécriture de la couche données, cf. « EncryptedAdapter » de la section 9.1).
- Les réglages non sensibles (thème, palette, mode discret, rappels, état du verrou) restent en clair.
- Un PIN court protège d'un accès occasionnel, pas d'une personne déterminée disposant d'outils (inchangé).
- Le blocage progressif est enregistré sur l'appareil : il ne résiste pas à une personne qui efface les données du navigateur, ce qui efface aussi les données protégées.

## 6. Contenus éducatifs : mise à jour de la section 17

Quinze articles rédigés pour MIA, répartis sur les sept thèmes prévus : Comprendre le cycle (3), Les règles (2), Premières règles (1), Symptômes (3), Cycles irréguliers (2), Quand consulter (1), Les étapes de la vie (3).

- Les textes sont originaux ; ils s'appuient sur des informations de santé publique et indiquent leurs sources (liens NHS, en anglais). Aucun texte n'a été copié.
- Chaque article porte titre, thème, date de révision, version, relecteur et, le cas échéant, un encadré « Consultez un professionnel de santé si… ».
- **Aucun article n'est relu.** Ils s'affichent « en attente de relecture ». La règle de la v2.0 est maintenue : pas de diffusion publique avant relecture et signature par une personne compétente en santé. L'adaptation au contexte local (par exemple, accès aux protections, ressources de santé disponibles) est à confier au relecteur.
- Sources en français à ajouter par le relecteur (par exemple des organismes de santé francophones), afin de ne pas dépendre de sources en anglais.

## 7. Tests : mise à jour de la section 18

État au 3 novembre 2026 : **52 tests automatisés** passent ; couverture du domaine de calcul de 100 % des lignes (objectif de 95 %).

| ID | Test | Statut |
|---|---|---|
| T01 à T05, T16, T18 | Calculs, dates, validations, plages | Automatisés, passent |
| T13, T14 | Export / import, fichier invalide | Automatisés, passent |
| T15 | Verrouillage : données illisibles sans code, verrouillage après 2 minutes en arrière-plan | Automatisé, passe ; à valider sur appareil |
| T22 | Migration : base v1 ouverte par le code courant sans perte | Automatisé, passe |
| T23 | Blocage progressif du PIN (5 essais, délais, plafond, remise à zéro) | Automatisé, passe |
| T24 | Empreinte : activation (PIN requis), déverrouillage, refus sans PRF, échec ou annulation, PIN jamais en clair | Automatisé avec authentificateur simulé ; **à valider sur téléphone réel** |
| T25 | Sauvegarde chiffrée : aller-retour, mauvais mot de passe, fichier altéré, contenu illisible | Automatisé, passe |
| T26 | Constats : seuils, cycles stables ou variables, symptôme le plus noté | Automatisé, passe |
| T27 | Contrastes des 4 palettes en clair et en sombre (4,5:1) | Vérifié par calcul ; à intégrer à la recette |
| T28 | Énergie et sommeil : saisie, export, import | **À écrire** |
| T29 | Thème clair / sombre / automatique et palettes appliqués sur tous les écrans, y compris le verrou | **À valider visuellement** |

Restent à réaliser, comme dans la v2.0 : tests de bout en bout (Playwright, dont hors ligne et inspection du trafic réseau T10), accessibilité (T19, axe-core et TalkBack), performance (T21, Lighthouse), tests de composants, essais sur au moins trois appareils Android réels.

Mesure de performance (section 16) : le JavaScript initial pèse environ 79 Ko compressés (objectif : moins de 200 Ko) ; les écrans secondaires sont chargés à la demande. Les autres indicateurs (LCP, INP, ouverture hors ligne) n'ont pas encore été mesurés.

## 8. Risques et points ouverts : mise à jour de la section 22

| Risque ou point | Impact | État / mesure |
|---|---|---|
| Hébergement : le dépôt est privé et GitHub Pages n'est pas disponible gratuitement pour un dépôt privé | Élevé (application non accessible sur téléphone) | **Décision à prendre** : dépôt public (GitHub Pages) ou dépôt privé avec Cloudflare Pages / Netlify |
| Données en clair pendant une session ouverte | Moyen | Limite connue (§ 5.3) ; correction par chiffrement permanent à planifier |
| Empreinte non validée sur appareil réel | Moyen | Test T24 à faire sur au moins deux modèles Android ; prévoir le repli par PIN |
| Articles non relus | Élevé | Publication publique bloquée jusqu'à relecture signée |
| Seuils de calcul non confirmés (section 6.2) | Moyen | Confirmation du référent santé requise |
| Constats automatiques mal interprétés | Moyen | Formulation descriptive, mention « pas des conseils médicaux » ; relecture des formulations par le référent santé |
| Examen juridique (loi togolaise 2019-014, RGPD) | Élevé | Requis avant diffusion publique (section 13.3) ; la sauvegarde chiffrée et l'export sont à inclure dans l'examen |
| Perte de données si le navigateur est vidé | Élevé | Atténué : sauvegarde chiffrée, export, rappel d'export (> 60 jours) |
| Référents non désignés (maintenance, santé, protection des données) | Moyen | À désigner avant la diffusion |

## 9. Validations requises avant diffusion publique

1. Porteur de projet : accepter ou refuser chaque ajout du § 2 et chaque écart du § 4.
2. Référent santé : relire et signer les 15 articles, confirmer les seuils (section 6.2) et les formulations des constats.
3. Référent protection des données : examen du cadre juridique, y compris sauvegarde chiffrée et empreinte.
4. Recette sur appareils réels : T19, T21, T24, T29 et tests de bout en bout.
5. Décision d'hébergement (§ 8).

| Rôle | Nom | Date | Visa |
|---|---|---|---|
| Porteur du projet (maîtrise d'ouvrage) | | | |
| Responsable technique | | | |
| Référent santé | | | |
| Référent protection des données | | | |

*Ce document n'est ni une certification de sécurité ni une garantie de conformité juridique.*
