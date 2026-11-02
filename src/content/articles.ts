// Articles rédigés pour MIA à partir d'informations de santé publique courantes (sources en bas de chaque article).
// Les textes sont originaux (non copiés). `reviewer: null` = en attente de relecture par une personne compétente
// en santé : tant qu'ils ne sont pas relus et signés, l'application l'affiche (sections 2 et 17 du cahier des charges).
export type Block = { h: string } | { p: string } | { ul: string[] };

export interface Source {
  label: string;
  url: string;
}

export interface Article {
  slug: string;
  title: string;
  theme: string;
  summary: string;
  reviewer: string | null;
  revised: string;
  version: number;
  seeDoctor?: string[];
  body: Block[];
  sources: Source[];
}

const NHS_PERIODS: Source = { label: 'NHS — Periods', url: 'https://www.nhs.uk/conditions/periods/' };
const NHS_PAIN: Source = { label: 'NHS — Period pain', url: 'https://www.nhs.uk/conditions/period-pain/' };
const NHS_PMS: Source = { label: 'NHS — Premenstrual syndrome', url: 'https://www.nhs.uk/conditions/pre-menstrual-syndrome/' };
const NHS_MENO: Source = { label: 'NHS — Menopause', url: 'https://www.nhs.uk/conditions/menopause/' };
const NHS_HEAVY: Source = { label: 'NHS — Heavy periods', url: 'https://www.nhs.uk/conditions/heavy-periods/' };

const R = '2026-11-02';

export const ARTICLES: Article[] = [
  // — Comprendre le cycle —
  {
    slug: 'phases-du-cycle',
    title: 'Les phases du cycle',
    theme: 'Comprendre le cycle',
    summary: 'Les quatre grandes étapes d\'un cycle, du premier jour des règles au suivant.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Le cycle menstruel se compte du premier jour des règles jusqu\'à la veille des règles suivantes. Ce premier jour de saignement est le « jour 1 ».' },
      { h: 'Les quatre étapes' },
      {
        ul: [
          'Les règles : la muqueuse de l\'utérus s\'évacue avec du sang. Elles durent le plus souvent de 2 à 7 jours.',
          'La phase qui suit les règles : un ovule mûrit dans l\'un des ovaires et la muqueuse de l\'utérus se reconstitue.',
          'L\'ovulation : l\'ovule est libéré. Son moment varie d\'une personne à l\'autre et d\'un cycle à l\'autre.',
          'La phase avant les règles : si l\'ovule n\'est pas fécondé, les hormones baissent et les règles reviennent.',
        ],
      },
      { h: 'Ce que MIA ne fait pas' },
      { p: 'MIA ne calcule ni l\'ovulation ni une période « sans risque ». Le moment de l\'ovulation ne peut pas être deviné avec certitude à partir de dates de règles, et MIA n\'est pas une méthode contraceptive.' },
    ],
    sources: [NHS_PERIODS],
  },
  {
    slug: 'pourquoi-la-duree-varie',
    title: 'Pourquoi la durée du cycle varie',
    theme: 'Comprendre le cycle',
    summary: 'Un cycle de « 28 jours » est une moyenne, pas une règle.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'On parle souvent d\'un cycle de 28 jours, mais c\'est une moyenne. Chez l\'adulte, un cycle se situe en général entre 21 et 35 jours. Chez les adolescentes, des cycles plus longs, jusqu\'à environ 45 jours, sont fréquents les premières années.' },
      { h: 'Ce qui peut faire varier un cycle' },
      {
        ul: [
          'Le stress, la fatigue ou un changement de rythme de vie.',
          'Une variation importante de poids ou une activité sportive très intense.',
          'Une maladie, certains médicaments ou une contraception hormonale.',
          'Une grossesse, l\'allaitement, ou l\'approche de la ménopause.',
        ],
      },
      { p: 'Un cycle plus court ou plus long de temps en temps est courant. Ce qui compte, c\'est surtout la tendance sur plusieurs mois.' },
    ],
    seeDoctor: ['vos cycles sont régulièrement plus courts que 21 jours ou plus longs que 45 jours.', 'vos cycles ont nettement changé sans raison apparente.'],
    sources: [NHS_PERIODS],
  },
  {
    slug: 'comment-mia-calcule',
    title: 'Comment MIA calcule ses estimations',
    theme: 'Comprendre le cycle',
    summary: 'Ce que MIA fait avec vos dates, et pourquoi elle préfère parfois ne pas donner de date.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'MIA compte les jours entre les débuts de règles que vous avez enregistrés. Un cycle est pris en compte s\'il dure entre 15 et 90 jours.' },
      {
        ul: [
          'Avant trois cycles valides, MIA ne propose aucune estimation.',
          'Ensuite, elle calcule la moyenne de vos six derniers cycles valides.',
          'Si vos cycles sont réguliers (écart de 7 jours au plus), elle propose une date « autour du ».',
          'S\'ils varient davantage (écart de 8 à 20 jours), elle propose une plage « entre le … et le … ».',
          'S\'ils varient beaucoup (plus de 20 jours), elle ne propose aucune date.',
        ],
      },
      { p: 'Une estimation n\'est jamais une certitude. Vous pouvez exclure un cycle du calcul depuis l\'Historique si vous savez qu\'il est exceptionnel.' },
    ],
    sources: [],
  },

  // — Les règles —
  {
    slug: 'regles-ce-qui-est-courant',
    title: 'Les règles : ce qui est courant',
    theme: 'Les règles',
    summary: 'Durée, quantité de flux, couleur : des repères pour savoir ce qui est habituel.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { h: 'Durée' },
      { p: 'Les règles durent le plus souvent de 2 à 7 jours. Elles sont souvent plus abondantes les deux ou trois premiers jours, puis diminuent.' },
      { h: 'Quantité' },
      { p: 'La perte totale est en moyenne de quelques cuillères à soupe. Il est difficile de la mesurer : ce qui compte, c\'est surtout si votre flux vous gêne dans votre vie quotidienne.' },
      { h: 'Couleur' },
      { p: 'Le sang peut être rouge vif, rouge foncé, brun ou rosé selon les jours. Un sang brun en début ou en fin de règles est fréquent.' },
      { h: 'Dans MIA' },
      { p: 'Vous pouvez noter le flux (traces, léger, moyen, abondant) pour repérer ce qui est habituel pour vous.' },
    ],
    seeDoctor: ['vos règles durent plus de 7 jours.', 'vous devez changer de protection toutes les heures ou presque, pendant plusieurs heures.', 'vous avez des caillots plus gros qu\'une pièce de monnaie.'],
    sources: [NHS_PERIODS, NHS_HEAVY],
  },
  {
    slug: 'protections-et-hygiene',
    title: 'Protections et hygiène',
    theme: 'Les règles',
    summary: 'Serviettes, tampons, cups, culottes : comment les utiliser en confort et en sécurité.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { h: 'Choisir une protection' },
      { p: 'Il n\'y a pas de « bonne » protection : serviettes, tampons, cups menstruelles et culottes de règles conviennent chacune à des situations différentes. Vous pouvez en changer selon les jours.' },
      { h: 'Fréquence de changement' },
      {
        ul: [
          'Serviette : la changer régulièrement, en général toutes les 4 à 6 heures, plus souvent si le flux est abondant.',
          'Tampon : ne pas le garder plus de 8 heures, utiliser l\'absorption la plus faible suffisante, et en changer la nuit plutôt que de le garder trop longtemps.',
          'Cup : suivre la durée indiquée par le fabricant (souvent jusqu\'à 12 heures) et la nettoyer selon la notice.',
        ],
      },
      { h: 'Hygiène' },
      {
        ul: [
          'Se laver les mains avant et après avoir changé de protection.',
          'La toilette se fait à l\'extérieur seulement, avec de l\'eau ou un savon doux ; les douches vaginales sont déconseillées.',
          'Si vous n\'avez pas accès à des protections, parlez-en à un adulte de confiance, à l\'infirmière scolaire ou à un service de santé : ce besoin est légitime.',
        ],
      },
    ],
    seeDoctor: ['vous avez une forte fièvre, des vertiges, des vomissements ou une éruption cutanée pendant que vous utilisez un tampon : retirez-le et consultez en urgence (risque de choc toxique).'],
    sources: [NHS_PERIODS],
  },

  // — Premières règles —
  {
    slug: 'premieres-regles',
    title: 'Premières règles : à quoi s\'attendre',
    theme: 'Premières règles',
    summary: 'L\'âge, les premiers cycles irréguliers, et comment se préparer.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Les premières règles arrivent le plus souvent entre 10 et 15 ans, en moyenne vers 12 ou 13 ans, souvent un à deux ans après le début du développement de la poitrine. Chaque corps a son rythme.' },
      { h: 'Ce qui est fréquent au début' },
      {
        ul: [
          'Des règles qui arrivent à des dates imprévisibles, parfois à plusieurs mois d\'intervalle.',
          'Un flux léger au début, qui change d\'un mois à l\'autre.',
          'Des crampes dans le bas du ventre, de la fatigue ou des changements d\'humeur.',
        ],
      },
      { h: 'Se préparer' },
      { p: 'Garder une protection dans votre sac permet d\'être tranquille. Si les règles arrivent par surprise, du papier toilette plié peut dépanner en attendant, et vous pouvez demander de l\'aide à une personne de confiance.' },
      { h: 'En parler' },
      { p: 'Parler à un adulte de confiance (parent, tante, grande sœur, infirmière scolaire) peut aider. Aucune question n\'est bête.' },
    ],
    seeDoctor: ['vous n\'avez pas eu vos premières règles à 15 ou 16 ans.', 'les douleurs vous empêchent d\'aller à l\'école ou de faire vos activités.'],
    sources: [NHS_PERIODS],
  },

  // — Symptômes —
  {
    slug: 'douleurs-de-regles',
    title: 'Douleurs de règles',
    theme: 'Symptômes',
    summary: 'Des crampes fréquentes, et quand elles demandent un avis médical.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Beaucoup de personnes ont des crampes dans le bas du ventre avant et pendant les règles. Elles viennent de contractions de l\'utérus et durent en général un à trois jours.' },
      { h: 'Ce qui peut soulager' },
      {
        ul: [
          'La chaleur sur le ventre (bouillotte, bain chaud).',
          'Un peu de mouvement doux, comme la marche ou des étirements.',
          'Le repos et des boissons chaudes.',
          'Si vous prenez un médicament contre la douleur, demandez conseil à un pharmacien ou à un médecin pour la dose qui vous convient.',
        ],
      },
      { h: 'Les noter' },
      { p: 'Noter les crampes dans le Journal de MIA permet de voir leur évolution et d\'en parler plus précisément en consultation.' },
    ],
    seeDoctor: ['la douleur est forte et ne passe pas avec les moyens habituels.', 'elle vous empêche d\'aller à l\'école, au travail ou de dormir.', 'elle s\'aggrave avec le temps ou apparaît en dehors des règles.'],
    sources: [NHS_PAIN],
  },
  {
    slug: 'syndrome-premenstruel',
    title: 'Le syndrome prémenstruel',
    theme: 'Symptômes',
    summary: 'Ces symptômes qui apparaissent avant les règles et disparaissent avec elles.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Dans les jours qui précèdent les règles, certaines personnes ressentent des signes physiques ou émotionnels. Ils disparaissent en général peu après le début des règles.' },
      {
        ul: [
          'Physiques : ballonnements, seins sensibles, maux de tête, acné, fatigue, envies alimentaires.',
          'Émotionnels : irritabilité, tristesse, anxiété, difficultés de concentration, troubles du sommeil.',
        ],
      },
      { h: 'Repérer un motif' },
      { p: 'En notant vos symptômes chaque jour dans MIA, vous pouvez voir s\'ils reviennent à la même période du cycle. Cela aide à mieux les anticiper.' },
      { h: 'Ce qui peut aider' },
      { p: 'Un sommeil régulier, une activité physique, une alimentation équilibrée et des moments de détente aident souvent.' },
    ],
    seeDoctor: ['les symptômes perturbent fortement votre vie quotidienne, vos études ou vos relations.', 'vous avez des idées noires : parlez-en rapidement à un professionnel ou à une personne de confiance.'],
    sources: [NHS_PMS],
  },
  {
    slug: 'humeur-et-fatigue',
    title: 'Humeur et fatigue autour des règles',
    theme: 'Symptômes',
    summary: 'Pourquoi l\'énergie et l\'humeur peuvent changer au fil du cycle.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Les hormones évoluent au cours du cycle et peuvent influencer l\'énergie, le sommeil et l\'humeur. Se sentir plus fatiguée ou plus sensible à certains moments est courant.' },
      { h: 'Quelques repères' },
      {
        ul: [
          'Un coup de fatigue pendant les règles peut venir de la perte de sang, surtout si le flux est abondant.',
          'Un sommeil de moins bonne qualité avant les règles est fréquent.',
          'Vos émotions sont réelles, même si elles varient avec le cycle : elles méritent d\'être écoutées.',
        ],
      },
      { p: 'Dans le Journal, noter l\'humeur (calme, irritable, triste, anxieuse) et la fatigue permet d\'en discuter avec un professionnel si besoin.' },
    ],
    seeDoctor: ['vous êtes très fatiguée de façon durable, avec un essoufflement ou des vertiges : une carence en fer est possible.', 'votre humeur reste basse pendant plus de deux semaines.'],
    sources: [NHS_PMS, NHS_HEAVY],
  },

  // — Cycles irréguliers —
  {
    slug: 'cycles-irreguliers',
    title: 'Cycles irréguliers : causes fréquentes',
    theme: 'Cycles irréguliers',
    summary: 'Pourquoi les cycles peuvent varier beaucoup, et ce que MIA fait dans ce cas.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Un cycle est dit irrégulier quand sa durée change beaucoup d\'un mois à l\'autre. C\'est fréquent, surtout au début de la vie menstruelle et à l\'approche de la ménopause.' },
      { h: 'Causes fréquentes' },
      {
        ul: [
          'Les premières années après les premières règles.',
          'Le stress, un changement de poids, un sport très intense, le manque de sommeil.',
          'Une grossesse ou l\'allaitement.',
          'Une contraception hormonale, ou son arrêt.',
          'Certaines situations médicales, par exemple un trouble de la thyroïde ou le syndrome des ovaires polykystiques.',
          'La périménopause.',
        ],
      },
      { h: 'Ce que fait MIA' },
      { p: 'Quand les durées de vos cycles sont très différentes, MIA ne propose pas de date : elle préfère ne pas donner une fausse précision. Continuer à noter vos règles reste utile pour en parler à un professionnel.' },
    ],
    seeDoctor: ['vos règles ont disparu depuis 3 mois ou plus (et vous n\'êtes pas enceinte).', 'vos cycles sont régulièrement plus courts que 21 jours ou plus longs que 45 jours.', 'vous avez des saignements entre les règles.'],
    sources: [NHS_PERIODS],
  },
  {
    slug: 'quand-sen-preoccuper',
    title: 'Cycle en retard : quand s\'en préoccuper',
    theme: 'Cycles irréguliers',
    summary: 'Que faire si les règles tardent, sans dramatiser.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Un retard de quelques jours est courant, surtout si vos cycles sont irréguliers. Il y a souvent une explication simple : stress, fatigue, voyage, maladie.' },
      { h: 'Que faire' },
      {
        ul: [
          'Vérifier la date enregistrée dans MIA et la corriger si besoin.',
          'Si une grossesse est possible, un test de grossesse est le moyen le plus simple de lever le doute.',
          'Si le retard dure et que vous vous inquiétez, parlez-en à un professionnel de santé.',
        ],
      },
      { p: 'Dans MIA, quand la date estimée est passée, le message reste neutre : les cycles varient d\'un mois à l\'autre.' },
    ],
    seeDoctor: ['vous avez des douleurs vives d\'un côté du ventre, avec ou sans saignement.', 'vous n\'avez pas eu vos règles depuis 3 mois.'],
    sources: [NHS_PERIODS],
  },

  // — Quand consulter —
  {
    slug: 'quand-consulter',
    title: 'Quand consulter un professionnel de santé',
    theme: 'Quand consulter',
    summary: 'Les signes qui justifient un avis médical.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'MIA ne remplace pas un professionnel de santé. Voici des situations où il est recommandé d\'en consulter un (médecin, sage-femme, gynécologue, infirmière scolaire).' },
      { h: 'Consultez si' },
      {
        ul: [
          'Les premières règles ne sont pas arrivées vers 15 ou 16 ans.',
          'Vos règles ont disparu depuis 3 mois ou plus, hors grossesse.',
          'Vos règles durent plus de 7 jours ou sont très abondantes (changement de protection toutes les heures environ).',
          'Vos cycles sont régulièrement plus courts que 21 jours ou plus longs que 45 jours.',
          'Vous avez des saignements entre les règles ou après un rapport.',
          'Vos douleurs sont fortes, s\'aggravent ou vous empêchent de vivre normalement.',
        ],
      },
      { h: 'Consultez en urgence si' },
      {
        ul: [
          'Vous avez de la fièvre, des vertiges, des vomissements ou une éruption cutanée pendant l\'utilisation d\'un tampon.',
          'Vous avez une douleur très vive du ventre, ou un saignement très abondant avec malaise.',
        ],
      },
      { p: 'Pour préparer la consultation, vous pouvez exporter vos données depuis Profil → Données (export CSV lisible dans un tableur).' },
    ],
    sources: [NHS_PERIODS, NHS_HEAVY],
  },

  // — Les étapes de la vie —
  {
    slug: 'adolescence',
    title: 'À l\'adolescence',
    theme: 'Les étapes de la vie',
    summary: 'Un corps qui change et des cycles qui se mettent en place.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'L\'adolescence est une période de changements. Les cycles mettent parfois deux à trois ans à se régulariser. Des cycles variables, des règles plus ou moins abondantes et des douleurs passagères sont fréquents.' },
      { p: 'Vous n\'avez pas à vous comparer aux autres : chaque corps a son rythme. Noter vos règles dans MIA vous aide à mieux vous connaître, et à en parler si besoin.' },
    ],
    seeDoctor: ['vous avez des douleurs importantes, des règles très abondantes ou une absence de règles qui vous inquiète.'],
    sources: [NHS_PERIODS],
  },
  {
    slug: 'apres-une-grossesse',
    title: 'Après une grossesse',
    theme: 'Les étapes de la vie',
    summary: 'Le retour des règles après un accouchement ou pendant l\'allaitement.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Après un accouchement, le retour des règles varie beaucoup. Pendant l\'allaitement, elles peuvent tarder plusieurs mois ; sans allaitement, elles reviennent en général plus tôt.' },
      { p: 'Les premiers cycles peuvent être différents de ceux d\'avant : durée, flux, douleurs. Cela se stabilise souvent avec le temps.' },
      { p: 'Une ovulation peut avoir lieu avant le retour des règles : l\'absence de règles ne protège pas d\'une nouvelle grossesse. MIA n\'est pas une méthode contraceptive : pour la contraception, parlez à un professionnel de santé.' },
    ],
    seeDoctor: ['vous avez un saignement très abondant ou prolongé après l\'accouchement.', 'vous avez des douleurs importantes ou de la fièvre.'],
    sources: [NHS_PERIODS],
  },
  {
    slug: 'perimenopause',
    title: 'La périménopause',
    theme: 'Les étapes de la vie',
    summary: 'Quand les cycles s\'allongent ou deviennent imprévisibles.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'La périménopause est la période de transition qui précède la ménopause, souvent à partir de la quarantaine. Les hormones fluctuent, et les cycles peuvent devenir plus courts, plus longs ou imprévisibles.' },
      { h: 'Signes possibles' },
      {
        ul: [
          'Cycles irréguliers, règles plus ou moins abondantes.',
          'Bouffées de chaleur, sueurs nocturnes.',
          'Troubles du sommeil, changements d\'humeur, sécheresse vaginale.',
        ],
      },
      { p: 'On parle de ménopause lorsque les règles ont disparu depuis 12 mois consécutifs ; en moyenne vers 51 ans. À cette période, MIA ne donne souvent pas de date : c\'est volontaire, pour ne pas afficher de fausse précision.' },
    ],
    seeDoctor: ['vous avez des saignements très abondants ou des saignements entre les règles.', 'vous avez des saignements après 12 mois sans règles.', 'vos symptômes gênent votre quotidien : des solutions existent.'],
    sources: [NHS_MENO],
  },
];
