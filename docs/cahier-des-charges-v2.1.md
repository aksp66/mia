# MIA — Cahier des charges fonctionnel et technique

**Version 2.1 — avenant au document de référence v2.0 du 2 novembre 2026**

| | |
|---|---|
| Date | 3 novembre 2026 ; révisé le 4 novembre 2026 (refonte visuelle « soft pastel », § 2.6) |
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
| A12 | Contenus éducatifs : 33 articles rédigés, 8 thèmes, sources variées ; page Apprendre avec recherche | 17 | Doit |
| A13 | Refonte visuelle « soft pastel » : fonds clairs, cartes blanches arrondies, ombres douces, accents corail et lavande (§ 2.6) | 10, 10.5 | Devrait |
| A14 | Barre de navigation flottante : 4 destinations et bouton central « + » ; Profil dans l'en-tête | 5.1, 11 | Devrait |
| A15 | Accueil : carte « Jour des règles / Jour du cycle » avec jauge pastel, mini-histogramme des cycles, tuiles d'accès rapide, salutation | 5.3 | Devrait |
| A16 | Calendrier : mois empilés, pastilles douces, bouton « Modifier les dates » | 5.3 | Pourrait |
| A17 | Écran Symptômes en cartes de puces (flux, humeur, symptômes) et bande de sélection du jour | 5.3 | Devrait |
| A18 | Police Plus Jakarta Sans auto-hébergée, en remplacement d'Inter | 10.3 | Pourrait |

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

### 2.6 Refonte visuelle « soft pastel » (A13 à A18)

**Statut : spécifiée et développée le 4 novembre 2026 sur la branche `develop` ; les décisions du porteur sont consignées au § 2.6.7. Reste à valider sur téléphone réel (tests T31 à T34).** Elle remplace le style « dégradés et effet verre » de la version précédente (A7 et A10 restent valables pour le contenu, pas pour l'habillage).

**Référence** : trois maquettes d'écran fournies par le porteur de projet (Accueil, Calendrier, Symptômes). Direction : minimalisme moderne, fonds clairs blanc cassé, cartes blanches aux coins très arrondis et aux ombres douces et diffuses, typographie ronde et chaleureuse, accents rose corail / framboise et lavande. Ce que MIA reprend est le style et l'organisation des écrans ; les fonctions, la logique métier, le stockage local, le chiffrement par PIN, l'empreinte et le mode discret ne changent pas.

#### 2.6.1 Jetons de design

Les valeurs demandées par le porteur sont conservées pour les **surfaces et illustrations**. Pour le **texte, les liens et les boutons**, des variantes plus foncées sont ajoutées, car le corail et la lavande n'atteignent pas les contrastes minimaux (section 12 de la v2.0 : 4,5:1 pour le texte, 3:1 pour les composants porteurs de sens). Contrastes calculés le 4 novembre 2026 (méthode WCAG 2.2).

| Jeton | Valeur | Usage | Contraste mesuré |
|---|---|---|---|
| `--color-bg` | #FAF8F7 | Fond général | — |
| `--color-card` | #FFFFFF | Cartes | — |
| `--color-text` | #362C2E | Texte principal | 12,74:1 sur le fond ; 13,49:1 sur une carte |
| `--color-brand` | #E27D9F (corail) | Jours de règles, jauge, pastilles, surfaces | 2,74:1 sur blanc : **jamais en texte** ; texte sombre posé dessus : 4,93:1 |
| `--color-brand-2` | #D65DB1 | Éléments graphiques décoratifs, dégradés | 3,47:1 sur blanc (3,27:1 sur le fond) |
| `--color-lavender` | #C3B1E1 | Tags, fonds de graphique, surfaces secondaires | 1,96:1 sur blanc : jamais seule ; texte sombre dessus : 6,87:1 |
| `--color-accent` (nouveau) | #A8326E (framboise profond) | Texte rose, liens, bouton principal | texte blanc dessus : 6,28:1 ; sur le fond : 5,93:1 |
| `--color-lavender-text` (nouveau) | #6B4FA0 | Texte de teinte lavande | 6,46:1 sur blanc ; 6,10:1 sur le fond |
| `--color-surface` | teinte rose très claire | Puces non sélectionnées, bandeaux | à fixer à la maquette, texte sombre ≥ 4,5:1 |

Règles : un état (règles, estimation, sélection, symptôme) n'est jamais signalé par la seule couleur ; un composant dont la couleur est inférieure à 3:1 reçoit un contour plus foncé ou une forme distincte. Le thème sombre et les quatre palettes (2.1) sont conservés ; la nouvelle palette soft devient la palette par défaut (« Rose Poudré »), la palette Rose Pivoine restant disponible.

**Formes et ombres.** Rayons : 16 px pour les champs et puces, 24 px pour les cartes, 999 px pour les boutons et la barre. Marge intérieure des cartes : 20 px. Ombre très douce, par exemple `0 4px 20px rgba(214, 93, 177, 0.08)`, avec une bordure rose très pâle. Les effets de flou d'arrière-plan sont **retirés** (coûteux sur les Android d'entrée de gamme, section 3.2). Exemple de carte :

```css
.card { background: var(--color-card); border-radius: 24px; padding: 20px;
        box-shadow: 0 4px 20px rgba(214, 93, 177, .08); border: 1px solid rgba(214, 93, 177, .10); }
```

**Typographie.** Plus Jakarta Sans (400, 500, 600, 700), auto-hébergée en WOFF2 latin (aucun service tiers, section 10.3), en remplacement d'Inter ; repli sur la police du téléphone. Tailles inchangées (section 10.3 de la v2.0).

#### 2.6.2 Navigation (modifie la section 5.1)

- Barre inférieure **flottante** : marges latérales de 16 px, coins arrondis, ombre douce.
- **Quatre destinations** : Accueil, Calendrier, Historique, Apprendre, avec au centre un **bouton d'action « + »** en relief (cercle framboise, 56 px, étiquette « Ajouter » pour les lecteurs d'écran). Le bouton ouvre un panneau avec deux actions : « Enregistrer mes règles » et « Noter un symptôme » (Journal du jour).
- **Profil** passe dans l'en-tête des écrans principaux (icône en haut à droite, comme sur la maquette) ; la route `/profil` et ses sous-écrans sont inchangés. Le total reste de cinq accès principaux (section 11 de la v2.0).
- Destination active : icône pleine dans une pastille (déjà en place). Cibles tactiles de 44 px au minimum.

#### 2.6.3 Accueil (modifie la section 5.3)

- **Carte de statut** : « Jour des règles N » pendant les règles (dernière période sans date de fin, ou date de fin non dépassée), sinon « Jour N du cycle » ; jauge circulaire ou barre aux tons corail et lavande ; sous la jauge, « Règles estimées dans N jours » pour une estimation à date unique. Bouton « Modifier la période ». Aucune phase, aucune fertilité (section 6.5 inchangée).
- **Mini-histogramme** des durées des derniers cycles valides (6 au plus), barres pastel, la plus récente en corail, durée en jours au-dessus de chaque barre ; équivalent texte pour les lecteurs d'écran ; affiché à partir de deux cycles.
- **Deux tuiles d'accès rapide** colorées (menthe et lavande pastel) : « Enregistrer mes règles » et « Noter un symptôme ».
- **Salutation** : « Bonjour » par défaut. Un prénom ou surnom **facultatif** peut être saisi dans Profil ; il reste sur le téléphone. Aucune question d'identité n'est posée à l'accueil initial (section 5.3 de la v2.0). En mode discret, la carte, l'histogramme et la salutation personnalisée sont masqués.

#### 2.6.4 Calendrier

**Défilement continu** : les mois sont empilés et défilent verticalement ; l'écran s'ouvre sur le mois courant (6 mois précédents au moins, davantage si des règles plus anciennes sont enregistrées, jusqu'à 60 ; 12 mois suivants) ; des boutons ajoutent 6 mois avant ou après ; « Aujourd'hui » ramène au mois courant ; en-tête et légende restent accessibles. Distinctions conservées : règles enregistrées = disque corail bordé de framboise ; période estimée = cercle en pointillés ; aujourd'hui = anneau ; symptômes = pastilles pastel par groupe. Un bouton « Modifier les dates » ouvre le Journal. L'annonce de chaque jour par les lecteurs d'écran est inchangée.

#### 2.6.5 Écran Symptômes (Journal)

Cartes successives de **puces à toucher** (sélection par un seul appui, coche visible en plus de la couleur) : Flux (traces, léger, moyen, abondant), Humeur (avec émojis), Symptômes physiques (avec émojis), Énergie, Sommeil, note privée. Le début des règles n'est proposé d'office que depuis « Enregistrer mes règles » ou pour une entrée existante : ouvrir un jour pour noter un symptôme ne crée jamais de règles. Le choix d'un autre jour dans la bande conserve ce mode ; si le jour affiché a des modifications non enregistrées, un message propose d'enregistrer et changer de jour, d'abandonner ou de rester. Les pictogrammes de flux sont des **formes abstraites** (cercles de taille croissante) et non des gouttes, conformément à la section 10.5 de la v2.0. En tête, une **bande horizontale de sélection du jour** remplace le sélecteur rotatif de la maquette, jugé trop difficile à rendre accessible.

#### 2.6.6 Contraintes techniques

- Aucun changement du modèle de données ni du chiffrement. Seul ajout : le réglage facultatif du prénom (`settings`), en clair comme les autres réglages non sensibles ; à ranger dans le coffre chiffré si le référent protection des données l'exige.
- **Mobile d'abord** : 360, 390 et 430 px ; marges latérales de 16 px.
- **Tailwind CSS** : le brief le mentionne, mais la v2.0 (section 8) retient des variables CSS sans framework. **Décision du 4 novembre 2026 : jetons CSS conservés, Tailwind non adopté.** Équivalences : `rounded-2xl` = 16 px, `rounded-3xl` = 24 px, `p-5` = 20 px, `shadow-pink-100/50` ≈ l'ombre ci-dessus. Tailwind produisant du CSS statique, il resterait compatible avec la politique de sécurité du contenu.
- Animations douces conservées, désactivées si le téléphone demande de réduire les mouvements.

#### 2.6.7 Décisions du porteur de projet (4 novembre 2026) et réalisation

| Décision | Réponse | Réalisation |
|---|---|---|
| Tailwind ou jetons CSS | Jetons CSS | Jetons dans `src/ui/styles.css` ; test T30 sur les valeurs |
| Prénom ou surnom facultatif | Accepté | Profil → champ facultatif ; réglage `firstName` ; salutation « Bonjour, [prénom] » ; masqué en mode discret |
| Nouvelle navigation (4 onglets + « + », Profil en en-tête) | Acceptée | Barre flottante, bouton central ouvrant un panneau (règles / symptôme), icône Profil en en-tête |
| Palette par défaut « Rose Poudré » | Acceptée | Palette `soft` par défaut ; Rose Pivoine devient un choix |

Réalisé : jetons et contrastes, police Plus Jakarta Sans (4 graisses, environ 12 Ko chacune), cartes sans flou d'arrière-plan, barre flottante, en-tête, carte « Jour des règles / du cycle » avec jauge, mini-histogramme (à partir de deux cycles valides), tuiles d'accès rapide, calendrier à deux mois empilés avec « Modifier les dates » (les règles en cours sans date de fin sont marquées jusqu'à aujourd'hui, 7 jours au plus), Journal en cartes de puces avec formes de flux abstraites et émojis, bande de sélection des 14 derniers jours. La fonction pure `periodDay` détermine le « jour des règles ». Le défilement continu du calendrier est réalisé (§ 2.6.4). La bande de sélection ne remonte qu'à 14 jours (l'adresse du Journal accepte toute date).
## 3. Propositions écartées

| Proposition | Décision | Motif |
|---|---|---|
| Libellés « phase ovulatoire », jours de fertilité, « période sensible » | Écartée | Interdit par les sections 2, 6.5 et 21 (aucune ovulation, aucune fertilité, aucune période « sans risque ») |
| Partage avec un(e) partenaire, par lien éphémère ou chiffré | Écartée en V1 | Partage de données hors périmètre (section 21) ; un lien suppose un serveur |
| Notifications push | Reportée | Exigent un serveur (sections 14 et 21). Le rappel dans l'application et le fichier `.ics` restent la solution V1 |
| Sauvegarde automatique sur un cloud, QR code de sauvegarde | Reportée | Synchronisation hors V1. Remplacée par la sauvegarde chiffrée téléchargeable (A9) |
| Pictogrammes de gouttes pour le flux (maquette de référence) | Adaptée | Section 10.5 de la v2.0 : aucune goutte ni symbole explicite ; formes abstraites à la place |
| Sélecteur rotatif des jours (maquette de référence) | Adaptée | Difficile à rendre accessible (lecteur d'écran, clavier) ; remplacé par une bande horizontale de sélection |
| Salutation personnalisée « Bonjour, [Nom] » obligatoire | Adaptée | La v2.0 ne collecte aucun nom (sections 5.3 et 13.3) ; prénom ou surnom facultatif, local, masqué en mode discret |
| Tableau « favorable aux rapports / attention / danger de grossesse » (méthode du calendrier, image fournie le 4 novembre 2026), à intégrer et à rendre téléchargeable | Écartée | Contraire aux sections 2, 6.5 et 21 de la v2.0 (aucune période « sans risque », aucune fertilité, MIA n'est pas une méthode contraceptive) ; un tableau de dates « sans danger » calculées sur le seul premier jour des règles est une méthode peu fiable qui expose à une grossesse non désirée, en particulier pour des cycles irréguliers et des adolescentes. Alternative : article d'information sur les méthodes de contraception et la consultation d'un professionnel de santé (à rédiger et faire relire) |
| Publicités, y compris non visibles | Écartée définitivement | Une publicité non visible gonfle artificiellement les affichages (fraude publicitaire, motif de suspension par les régies) ; contraire à la section 13 (aucun traceur ni outil tiers, CSP bloquante, public comprenant des mineures). Le modèle de lancement reste gratuit, sans publicité (section 1) |

## 4. Choix techniques arrêtés

Compléments à la section 8 :

| Sujet | Décision |
|---|---|
| TypeScript | Version 6.0 (et non 7) : l'outil de lint ne gère pas encore la 7. À reconsidérer quand il le fera |
| Polices | Inter, 4 graisses (400, 500, 600, 700) en WOFF2 latin, auto-hébergées (≈ 24 Ko chacune) ; politique CSP `font-src 'self'` |
| Icônes | SVG et PNG (192, 512, maskable 512, 180 pour iOS), générés par `npm run icons` |
| Routage | Adresses avec `#` (HashRouter) : fonctionne sur tout hébergement statique sans règle de repli serveur |
| Hébergement | GitHub Pages sur dépôt public, déploiement automatique à chaque fusion dans `main`. Chemin de base paramétrable (`BASE_PATH`) ; manifeste en chemins relatifs |
| Styles (refonte soft pastel) | Jetons CSS conservés ; adoption de Tailwind CSS **à décider** (§ 2.6.6) ; recommandation : ne pas l'ajouter |
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

**Trente-trois articles** rédigés pour MIA, répartis sur huit thèmes : les sept thèmes de la v2.0 (Comprendre le cycle, Les règles, Premières règles, Symptômes, Cycles irréguliers, Quand consulter, Les étapes de la vie) et un huitième ajouté, **Idées reçues et bien-être**.

- Les textes sont originaux ; ils s'appuient sur des informations de santé publique et indiquent leurs sources. Aucun texte n'a été copié.
- Sources variées, liens vérifiés accessibles le 3 novembre 2026 : Inserm (en français), OMS, UNICEF, ACOG (société américaine d'obstétrique et gynécologie), Cleveland Clinic et NHS. Chaque lien est marqué FR ou EN. D'autres sources francophones (assurance maladie, sociétés savantes, ministère de la santé, ressources locales au Togo) sont à ajouter par le relecteur ; certaines pages n'ont pas pu être vérifiées automatiquement.
- Chaque article porte titre, résumé, thème, durée de lecture, date de révision, version, relecteur et, le cas échéant, un encadré « Consultez un professionnel de santé si… ».
- **Aucun article n'est relu.** Ils s'affichent « en attente de relecture ». La règle de la v2.0 est maintenue : pas de diffusion publique avant relecture et signature par une personne compétente en santé. L'adaptation au contexte local (accès aux protections, ressources de santé disponibles, pratiques de consultation) est à confier au relecteur.
- Un test automatique garantit l'unicité des identifiants, la présence des sources (https, au moins cinq organismes différents) et l'absence de toute mention de jours fertiles ou de période « sans risque ».

### 6.1 Page Apprendre (organisation)

- Barre de recherche tolérante aux accents, par titre, résumé et contenu ; le résultat reste dans l'adresse de la page.
- « Pour commencer » : articles mis en avant.
- Grille des huit thèmes (icône, description, nombre d'articles) ; ouverture d'un thème = liste de ses articles.
- Chaque article indique sa durée de lecture et un badge « Avis médical » s'il contient des signes d'alerte ; en bas : « À lire aussi » (même thème) et sources.

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
| T30 | Contrastes de la palette soft (§ 2.6.1) : texte 4,5:1, composants 3:1, corail et lavande jamais en texte | Automatisé (`tests/contrast.test.ts`), passe ; vérifie aussi que les valeurs sont celles de la feuille de styles |
| T31 | Navigation : 4 destinations, bouton « + » et icône Profil atteignables au clavier et au lecteur d'écran, cibles de 44 px | Réalisée ; à vérifier au clavier et avec TalkBack |
| T35 | Journal : le changement de jour conserve le mode, ne crée pas de règles et prévient des modifications non enregistrées ; calendrier à défilement continu | Automatisé (`tests/journal.test.tsx`), passe |
| T32 | Mode discret : carte de statut, histogramme et salutation personnalisée masqués | Réalisé ; test automatisé à écrire |
| T33 | Revue visuelle à 360, 390 et 430 px par rapport aux maquettes de référence | Contrôle fait le 4 novembre 2026 à 390 px (clair et sombre, captures d'un navigateur de bureau) ; à faire à 360 et 430 px et sur téléphone |
| T34 | Performance après refonte : CSS et polices (4 graisses) dans un budget à fixer, LCP et INP inchangés | À mesurer |

Restent à réaliser, comme dans la v2.0 : tests de bout en bout (Playwright, dont hors ligne et inspection du trafic réseau T10), accessibilité (T19, axe-core et TalkBack), performance (T21, Lighthouse), tests de composants, essais sur au moins trois appareils Android réels.

Mesure de performance (section 16) : le JavaScript initial pèse environ 79 Ko compressés (objectif : moins de 200 Ko) ; les écrans secondaires sont chargés à la demande. Les autres indicateurs (LCP, INP, ouverture hors ligne) n'ont pas encore été mesurés.

## 8. Risques et points ouverts : mise à jour de la section 22

| Risque ou point | Impact | État / mesure |
|---|---|---|
| Hébergement | Moyen | **Décision prise le 3 novembre 2026 : dépôt public, GitHub Pages** (HTTPS). Application en ligne : https://aksp66.github.io/mia/ . Conséquences : code source, historique Git et nom/adresse d'auteur des commits publics ; aucune donnée d'utilisatrice n'est concernée (stockage local). Aucun secret n'est présent dans le dépôt |
| Données en clair pendant une session ouverte | Moyen | Limite connue (§ 5.3) ; correction par chiffrement permanent à planifier |
| Empreinte non validée sur appareil réel | Moyen | Test T24 à faire sur au moins deux modèles Android ; prévoir le repli par PIN |
| Articles non relus | Élevé | Publication publique bloquée jusqu'à relecture signée |
| Seuils de calcul non confirmés (section 6.2) | Moyen | Confirmation du référent santé requise |
| Constats automatiques mal interprétés | Moyen | Formulation descriptive, mention « pas des conseils médicaux » ; relecture des formulations par le référent santé |
| Contrastes insuffisants des couleurs demandées (corail 2,74:1, lavande 1,96:1 sur blanc) | Moyen | Variantes foncées pour le texte et les boutons (§ 2.6.1) ; contrôle T30 |
| Prénom facultatif dans l'application (donnée personnelle) | Moyen | Local, facultatif, masqué en mode discret ; à soumettre au référent protection des données |
| Barre de navigation modifiée (Profil dans l'en-tête, bouton « + ») | Faible | Acceptée par le porteur ; tests T31 ; vérifier la découvrabilité du Profil avec des utilisatrices |
| Demande récurrente de dates « sans danger » (méthode du calendrier) | Élevé | Refusée (§ 3) ; prévoir un article d'information sur la contraception, relu par le référent santé, et un message clair dans « Comment c'est calculé ? » |
| Examen juridique (loi togolaise 2019-014, RGPD) | Élevé | Requis avant diffusion publique (section 13.3) ; la sauvegarde chiffrée et l'export sont à inclure dans l'examen |
| Perte de données si le navigateur est vidé | Élevé | Atténué : sauvegarde chiffrée, export, rappel d'export (> 60 jours) |
| Référents non désignés (maintenance, santé, protection des données) | Moyen | À désigner avant la diffusion |

## 9. Validations requises avant diffusion publique

1. Porteur de projet : accepter ou refuser chaque ajout du § 2 et chaque écart du § 4.
2. Référent santé : relire et signer les 33 articles, confirmer les seuils (section 6.2) et les formulations des constats.
3. Référent protection des données : examen du cadre juridique, y compris sauvegarde chiffrée et empreinte.
4. Recette sur appareils réels : T19, T21, T24, T29 et tests de bout en bout.
5. Refonte visuelle : décisions prises le 4 novembre 2026 (§ 2.6.7) ; reste la recette sur téléphone (T31 à T34).
6. ~~Décision d'hébergement~~ : prise (dépôt public, GitHub Pages) ; reste à vérifier l'installation sur téléphone (Chrome → « Installer l'application »).

| Rôle | Nom | Date | Visa |
|---|---|---|---|
| Porteur du projet (maîtrise d'ouvrage) | | | |
| Responsable technique | | | |
| Référent santé | | | |
| Référent protection des données | | | |

*Ce document n'est ni une certification de sécurité ni une garantie de conformité juridique.*
