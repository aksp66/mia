// Articles complémentaires. Mêmes règles que `articles.ts` : textes originaux, sources indiquées,
// en attente de relecture par une personne compétente en santé (`reviewer: null`).
import type { Article, Source } from './articles';

const nhs = (label: string, path: string): Source => ({ label: `NHS — ${label}`, url: `https://www.nhs.uk/${path}`, lang: 'en' });
const PERIODS = nhs('Periods', 'conditions/periods/');
const HEAVY = nhs('Heavy periods', 'conditions/heavy-periods/');
const IRON = nhs('Iron deficiency anaemia', 'conditions/iron-deficiency-anaemia/');
const MIGRAINE = nhs('Migraine', 'conditions/migraine/');
const PMS = nhs('Premenstrual syndrome', 'conditions/pre-menstrual-syndrome/');
const PCOS = nhs('Polycystic ovary syndrome', 'conditions/polyendocrine-metabolic-ovarian-syndrome-pmos/');
const ENDO = nhs('Endometriosis', 'conditions/endometriosis/');
const DISCHARGE = nhs('Vaginal discharge', 'symptoms/vaginal-discharge/');
const MENO = nhs('Menopause and perimenopause', 'conditions/menopause-and-perimenopause/');
const EXERCISE = nhs('Exercise', 'live-well/exercise/');
const R = '2026-11-03';

export const MORE_ARTICLES: Article[] = [
  // — Comprendre le cycle —
  {
    slug: 'bien-noter-son-cycle',
    title: 'Bien noter son cycle avec MIA',
    theme: 'Comprendre le cycle',
    summary: 'Quelques gestes simples pour que vos données soient utiles.',
    featured: true,
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Plus vos notes sont régulières, plus les constats de MIA sont fiables. Pas besoin d\'être parfaite : quelques habitudes suffisent.' },
      { h: 'Les gestes qui comptent' },
      {
        ul: [
          'Notez le premier jour de saignement, même s\'il est léger : c\'est le « jour 1 » du cycle.',
          'Renseignez la date de fin des règles quand vous y pensez : au bout de trois dates de fin, MIA affiche aussi la durée moyenne de vos règles.',
          'Notez vos symptômes le jour où ils apparaissent, plutôt que de les reconstituer plus tard.',
          'Si vous avez oublié, vous pouvez enregistrer une date passée depuis le Journal.',
        ],
      },
      { h: 'Corriger et exclure' },
      { p: 'Une erreur de date se corrige à tout moment. Si un cycle est exceptionnel (voyage, maladie, arrêt d\'une contraception), vous pouvez l\'exclure du calcul depuis l\'Historique.' },
      { h: 'Penser à sauvegarder' },
      { p: 'Vos données restent sur ce téléphone. Exportez-les de temps en temps (Profil → Données), idéalement avec la sauvegarde chiffrée.' },
    ],
    sources: [],
  },
  {
    slug: 'hormones-du-cycle',
    title: 'Les hormones du cycle, simplement',
    theme: 'Comprendre le cycle',
    summary: 'Œstrogènes et progestérone : qui fait quoi, sans jargon.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Le cycle est piloté par des hormones, des messagers chimiques produits par le cerveau et les ovaires. Deux d\'entre elles sont souvent citées.' },
      {
        ul: [
          'Les œstrogènes montent dans la première partie du cycle et font se reconstituer la muqueuse de l\'utérus.',
          'La progestérone prend le relais dans la seconde partie et prépare cette muqueuse à une éventuelle grossesse.',
        ],
      },
      { p: 'Quand une grossesse ne démarre pas, ces hormones baissent et les règles reviennent. Leurs variations peuvent aussi influencer l\'humeur, le sommeil, l\'énergie ou la sensibilité des seins.' },
      { p: 'Ces niveaux changent d\'une personne à l\'autre et d\'un cycle à l\'autre. C\'est pourquoi MIA n\'essaie pas de deviner où vous en êtes sur le plan hormonal.' },
    ],
    sources: [PERIODS],
  },

  // — Les règles —
  {
    slug: 'regles-abondantes',
    title: 'Règles abondantes',
    theme: 'Les règles',
    summary: 'Comment reconnaître un flux trop important et que faire.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Des règles sont dites abondantes quand elles gênent votre vie quotidienne. Il n\'y a pas besoin de mesurer précisément le sang perdu : ce sont les conséquences qui comptent.' },
      { h: 'Signes qui doivent alerter' },
      {
        ul: [
          'Changer de protection toutes les une à deux heures, plusieurs heures de suite.',
          'Devoir doubler les protections, ou se lever la nuit pour en changer.',
          'Des caillots plus gros qu\'une pièce de monnaie.',
          'Des règles qui durent plus de 7 jours.',
          'De la fatigue importante, un essoufflement ou une pâleur : une carence en fer est possible.',
        ],
      },
      { h: 'Que faire' },
      { p: 'Notez dans MIA le flux (« abondant ») et la durée. Ces informations aident un professionnel de santé à comprendre la situation. Des solutions existent, mais elles dépendent de la cause : mieux vaut en parler que de supporter.' },
    ],
    seeDoctor: ['vos règles sont abondantes de façon régulière.', 'vous vous sentez très fatiguée, étourdie ou essoufflée pendant vos règles.', 'vous saignez beaucoup avec un malaise : consultez en urgence.'],
    sources: [HEAVY, IRON],
  },
  {
    slug: 'regles-et-sport',
    title: 'Règles et activité physique',
    theme: 'Les règles',
    summary: 'Bouger pendant ses règles : c\'est possible, et parfois bénéfique.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Les règles n\'empêchent pas de faire du sport. Pour beaucoup de personnes, une activité modérée soulage même les crampes et améliore l\'humeur.' },
      { h: 'Quelques repères' },
      {
        ul: [
          'Écoutez votre énergie : une marche, du yoga ou des étirements conviennent aux jours de fatigue.',
          'Choisissez une protection adaptée à l\'activité (cup, tampon, culotte de règles, serviette fine).',
          'Pensez à bien vous hydrater.',
          'Se reposer un jour de forte douleur ou de fatigue est aussi une bonne décision.',
        ],
      },
      { p: 'Si le sport très intense fait disparaître vos règles pendant plusieurs mois, parlez-en à un professionnel de santé.' },
    ],
    seeDoctor: ['vos règles ont disparu depuis 3 mois alors que vous vous entraînez beaucoup.', 'la douleur vous empêche de faire vos activités habituelles.'],
    sources: [EXERCISE, PERIODS],
  },
  {
    slug: 'regles-et-alimentation',
    title: 'Alimentation, fer et règles',
    theme: 'Les règles',
    summary: 'Pas de régime spécial : surtout veiller aux apports en fer.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Il n\'existe pas de « régime des règles ». Une alimentation variée et suffisante est la meilleure base.' },
      { h: 'Le fer' },
      { p: 'Les règles font perdre un peu de fer, surtout si elles sont abondantes. Le fer se trouve dans les légumes secs (lentilles, haricots, pois chiches), les légumes verts à feuilles, les œufs, la viande et le poisson. Un aliment riche en vitamine C (agrumes, poivron, tomate) à côté du repas aide à l\'absorber.' },
      { h: 'Au quotidien' },
      {
        ul: [
          'Boire régulièrement de l\'eau.',
          'Ne pas sauter de repas : l\'envie de sucre avant les règles est fréquente et n\'a rien de honteux.',
          'Ne pas prendre de complément en fer sans avis d\'un professionnel de santé ou d\'un pharmacien.',
        ],
      },
    ],
    seeDoctor: ['vous êtes pâle, très fatiguée ou essoufflée de façon durable : une prise de sang peut vérifier le fer.'],
    sources: [IRON],
  },
  {
    slug: 'regles-au-quotidien',
    title: 'Les règles au quotidien : école, travail, voyages',
    theme: 'Les règles',
    summary: 'Astuces pratiques pour vivre ses règles sereinement.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { h: 'Être prête' },
      { p: 'Gardez une protection de rechange et un sac discret dans votre cartable ou votre sac. Une culotte ou un vêtement de rechange peut aussi rassurer.' },
      { h: 'La nuit' },
      { p: 'Une serviette longue, une culotte de règles ou une cup permettent de dormir plus tranquille. Dormir sur le côté, avec une serviette plus longue à l\'arrière, limite les fuites.' },
      { h: 'Les taches' },
      { p: 'Rincez le tissu rapidement à l\'eau froide : l\'eau chaude fixe la tache. Lavez ensuite normalement.' },
      { h: 'En voyage' },
      { p: 'Emportez plus de protections que nécessaire et pensez à l\'hygiène des mains quand l\'eau n\'est pas disponible (lingettes, gel).' },
      { h: 'En parler' },
      { p: 'À l\'école ou au travail, vous pouvez demander à aller aux toilettes quand vous en avez besoin. Vous n\'avez pas à vous justifier.' },
    ],
    sources: [PERIODS],
  },

  // — Symptômes —
  {
    slug: 'maux-de-tete-et-cycle',
    title: 'Maux de tête et cycle',
    theme: 'Symptômes',
    summary: 'Pourquoi les maux de tête peuvent revenir avec les règles.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Chez certaines personnes, les maux de tête apparaissent avant ou pendant les règles. La baisse des œstrogènes à cette période est l\'une des explications possibles.' },
      { h: 'Ce qui peut aider' },
      {
        ul: [
          'Dormir à des heures régulières et manger à heures fixes.',
          'Boire suffisamment.',
          'Repérer ce qui déclenche les crises : le Journal de MIA permet de voir si elles reviennent à la même période du cycle.',
          'Demander à un pharmacien ou un médecin quel médicament convient et à quelle dose.',
        ],
      },
    ],
    seeDoctor: ['les maux de tête sont fréquents, très forts ou s\'accompagnent de troubles de la vue.', 'un mal de tête soudain et violent, avec fièvre, raideur de la nuque ou confusion : urgence.'],
    sources: [MIGRAINE],
  },
  {
    slug: 'ballonnements-et-digestion',
    title: 'Ballonnements, nausées et digestion',
    theme: 'Symptômes',
    summary: 'Le ventre aussi réagit au cycle.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Avant ou pendant les règles, le ventre peut gonfler, le transit changer (constipation ou diarrhée) et des nausées apparaître. Les hormones agissent aussi sur la digestion.' },
      { h: 'Pour se sentir mieux' },
      {
        ul: [
          'Manger lentement, en plus petites quantités.',
          'Boire de l\'eau et marcher un peu.',
          'Limiter les boissons gazeuses si vous êtes ballonnée.',
          'Une bouillotte chaude sur le ventre détend.',
        ],
      },
    ],
    seeDoctor: ['vous avez des vomissements répétés, du sang dans les selles ou une douleur du ventre intense.', 'ces troubles sont présents toute l\'année et pas seulement autour des règles.'],
    sources: [PMS],
  },
  {
    slug: 'pertes-au-fil-du-cycle',
    title: 'Les pertes vaginales au fil du cycle',
    theme: 'Symptômes',
    summary: 'Ce qui est habituel, et les signes qui doivent faire consulter.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Les pertes vaginales sont normales : elles nettoient et protègent le vagin. Leur aspect change au cours du cycle (plus claires et filantes à certains moments, plus épaisses à d\'autres).' },
      { h: 'Ce qui est habituel' },
      { p: 'Des pertes blanches ou transparentes, sans odeur forte et sans gêne.' },
      { h: 'À surveiller' },
      {
        ul: [
          'Une odeur forte ou inhabituelle.',
          'Des démangeaisons, des brûlures ou une rougeur.',
          'Une couleur verte, grise ou très jaune, ou un aspect de lait caillé.',
          'Des douleurs au ventre ou pendant les rapports.',
        ],
      },
      { p: 'Vous pouvez noter « pertes » dans le Journal. Éviter les douches vaginales et les savons parfumés limite les irritations.' },
    ],
    seeDoctor: ['vos pertes changent d\'odeur, de couleur ou d\'aspect, ou s\'accompagnent de démangeaisons ou de douleurs.'],
    sources: [DISCHARGE],
  },

  // — Cycles irréguliers —
  {
    slug: 'stress-sommeil-et-cycle',
    title: 'Stress, sommeil et cycle',
    theme: 'Cycles irréguliers',
    summary: 'Comment le mode de vie peut décaler les règles.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Le cerveau commande les hormones du cycle. Une période de stress intense, un manque de sommeil durable, un deuil, des examens ou un déménagement peuvent retarder ou décaler les règles.' },
      { h: 'Ce qui aide souvent' },
      {
        ul: [
          'Un sommeil régulier.',
          'Une activité physique modérée.',
          'Des moments de détente, et parler de ce qui pèse à quelqu\'un de confiance.',
        ],
      },
      { p: 'Le cycle se rétablit en général quand la période difficile passe. Si vos règles ne reviennent pas, ou si vous vous sentez débordée, un professionnel de santé peut vous aider.' },
    ],
    seeDoctor: ['vos règles manquent depuis 3 mois.', 'le stress ou la tristesse vous empêchent de dormir ou de faire vos activités.'],
    sources: [PERIODS],
  },
  {
    slug: 'sopk-reperes',
    title: 'Le syndrome des ovaires polykystiques : repères',
    theme: 'Cycles irréguliers',
    summary: 'Une cause fréquente de cycles irréguliers, à faire diagnostiquer.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Le syndrome des ovaires polykystiques (SOPK) est un trouble hormonal fréquent. Il peut provoquer des cycles longs ou irréguliers, de l\'acné, une pilosité plus marquée ou des difficultés à être enceinte.' },
      { p: 'Il ne se diagnostique pas avec une application : il faut un avis médical, souvent avec des examens (prise de sang, échographie).' },
      { h: 'Ce qui peut vous orienter' },
      {
        ul: [
          'Cycles très variables ou espacés depuis plusieurs mois.',
          'Acné persistante, pilosité inhabituelle, prise de poids difficile à expliquer.',
        ],
      },
      { p: 'Un suivi existe et les symptômes se prennent en charge. Vos notes dans MIA peuvent aider à en parler.' },
    ],
    seeDoctor: ['vos cycles sont très irréguliers ou espacés depuis plusieurs mois, surtout avec acné ou pilosité inhabituelle.'],
    sources: [PCOS],
  },
  {
    slug: 'absence-de-regles',
    title: 'Absence de règles',
    theme: 'Cycles irréguliers',
    summary: 'Les causes possibles et quand demander un avis.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Ne pas avoir ses règles peut avoir des causes très différentes, bénignes ou non. Il est utile de les connaître sans s\'alarmer.' },
      { h: 'Causes fréquentes' },
      {
        ul: [
          'Une grossesse : un test est le moyen le plus simple de lever le doute si c\'est possible.',
          'L\'allaitement, ou certains moyens de contraception hormonale.',
          'Un stress important, une perte de poids marquée, un sport très intense.',
          'Un trouble hormonal (thyroïde, SOPK).',
          'La périménopause ou la ménopause.',
        ],
      },
      { p: 'Un retard isolé de quelques jours est courant. C\'est une absence de plusieurs mois qui mérite un avis.' },
    ],
    seeDoctor: ['vous n\'avez pas eu vos règles depuis 3 mois.', 'vous n\'avez pas eu vos premières règles à 15 ou 16 ans.', 'une douleur vive d\'un côté du ventre apparaît : consultez en urgence.'],
    sources: [PERIODS],
  },

  // — Quand consulter —
  {
    slug: 'preparer-une-consultation',
    title: 'Préparer une consultation',
    theme: 'Quand consulter',
    summary: 'Comment tirer le meilleur d\'un rendez-vous avec un professionnel de santé.',
    featured: true,
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Une consultation sur les règles ou le cycle est un rendez-vous de santé comme un autre. Elle ne nécessite pas forcément d\'examen : cela dépend de la situation, et vous pouvez toujours poser des questions ou vous faire accompagner par une personne de confiance.' },
      { h: 'Avant le rendez-vous' },
      {
        ul: [
          'Exportez vos données depuis Profil → Données : le fichier CSV s\'ouvre dans un tableur et se présente facilement.',
          'Notez la date de vos dernières règles, la durée habituelle de vos cycles et ce qui a changé.',
          'Listez vos symptômes, leur intensité et ce qui les soulage.',
          'Préparez vos questions et les médicaments que vous prenez.',
        ],
      },
      { h: 'Pendant' },
      { p: 'Dites les choses simplement, avec vos mots. Il n\'y a pas de question gênante pour un professionnel de santé. N\'hésitez pas à faire reformuler ce que vous n\'avez pas compris.' },
    ],
    sources: [PERIODS],
  },
  {
    slug: 'endometriose-reperes',
    title: 'L\'endométriose : repères',
    theme: 'Quand consulter',
    summary: 'Des douleurs de règles qui ne sont pas « normales » méritent d\'être entendues.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'L\'endométriose est une maladie où un tissu semblable à la muqueuse de l\'utérus se développe en dehors de l\'utérus. Elle peut provoquer des douleurs importantes, parfois pendant des années avant d\'être reconnue.' },
      { h: 'Signes qui peuvent faire y penser' },
      {
        ul: [
          'Des douleurs de règles très fortes, qui s\'aggravent ou ne sont pas calmées par les moyens habituels.',
          'Des douleurs pendant les rapports, ou en allant aux toilettes pendant les règles.',
          'Une fatigue importante, des difficultés à être enceinte.',
        ],
      },
      { p: 'MIA ne peut pas diagnostiquer l\'endométriose, mais noter vos douleurs dans le Journal aide à montrer leur fréquence. Une douleur forte n\'est pas à minimiser.' },
    ],
    seeDoctor: ['vos douleurs de règles sont fortes, vous empêchent de vivre normalement ou s\'aggravent.'],
    sources: [ENDO],
  },

  // — Idées reçues et bien-être —
  {
    slug: 'idees-recues-sur-les-regles',
    title: 'Idées reçues sur les règles',
    theme: 'Idées reçues et bien-être',
    summary: 'Vrai ou faux : on démêle les croyances courantes.',
    featured: true,
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { h: '« Les règles sont sales. »' },
      { p: 'Faux. Le sang des règles est un phénomène naturel. Vous n\'avez pas à avoir honte.' },
      { h: '« Pendant les règles, on ne peut pas se baigner, se laver les cheveux ou faire du sport. »' },
      { p: 'Faux. Vous pouvez faire toutes ces activités. Pour se baigner, une protection interne (tampon ou cup) ou une culotte de bain adaptée convient.' },
      { h: '« Tout le monde a un cycle de 28 jours. »' },
      { p: 'Faux. 28 jours est une moyenne : un cycle plus court ou plus long est courant.' },
      { h: '« Avoir très mal est normal. »' },
      { p: 'Pas toujours. Des crampes légères à modérées sont fréquentes, mais une douleur qui vous empêche de vivre normalement mérite un avis médical.' },
      { h: '« Si je n\'ai pas mes règles, je suis forcément enceinte. »' },
      { p: 'Non : de nombreuses causes existent. Si une grossesse est possible, un test permet de savoir.' },
    ],
    sources: [PERIODS],
  },
  {
    slug: 'parler-des-regles',
    title: 'Parler des règles sans tabou',
    theme: 'Idées reçues et bien-être',
    summary: 'Comment en parler à ses proches, à l\'école, au travail.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Les règles concernent une grande partie de la population, mais en parler reste parfois difficile. Cela peut peser, surtout au début.' },
      { h: 'Quelques pistes' },
      {
        ul: [
          'Choisissez une personne de confiance : parent, tante, grande sœur, amie, infirmière scolaire.',
          'Commencez par un fait simple : « J\'ai mal au ventre à cause de mes règles. »',
          'Si vous êtes parent ou proche, écoutez sans minimiser et répondez simplement.',
          'Vous avez le droit de garder une partie de votre vie privée : MIA reste sur votre téléphone et peut être verrouillée par un code.',
        ],
      },
      { p: 'Si vous manquez de protections ou d\'accès à des soins, dites-le à un adulte ou à un service de santé : ce n\'est pas un luxe.' },
    ],
    sources: [],
  },

  // — Les étapes de la vie —
  {
    slug: 'menopause',
    title: 'La ménopause',
    theme: 'Les étapes de la vie',
    summary: 'Quand les règles s\'arrêtent définitivement.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'On parle de ménopause quand les règles ont disparu depuis 12 mois consécutifs, hors grossesse. Elle survient en moyenne vers 51 ans, avec de grandes variations.' },
      { h: 'Après la ménopause' },
      {
        ul: [
          'Les bouffées de chaleur et les troubles du sommeil peuvent persister un moment.',
          'Les os et le cœur méritent une attention particulière : demandez conseil à un professionnel de santé.',
          'Tout saignement après 12 mois sans règles doit être signalé à un médecin.',
        ],
      },
      { p: 'Des solutions existent pour soulager les symptômes : n\'hésitez pas à en parler.' },
    ],
    seeDoctor: ['vous avez un saignement après 12 mois sans règles.', 'vos symptômes gênent votre quotidien.'],
    sources: [MENO],
  },
  {
    slug: 'contraception-hormonale-et-suivi',
    title: 'Contraception hormonale et suivi dans MIA',
    theme: 'Les étapes de la vie',
    summary: 'Pourquoi les saignements sous contraception ne sont pas toujours de vraies règles.',
    reviewer: null,
    revised: R,
    version: 1,
    body: [
      { p: 'Certaines contraceptions hormonales (pilule, implant, stérilet hormonal, injection) modifient le cycle : les saignements peuvent être plus légers, plus rares, ou absents.' },
      { h: 'Ce que cela change pour MIA' },
      {
        ul: [
          'Un saignement sous pilule n\'est souvent pas une véritable règle : c\'est un saignement de privation.',
          'Les cycles calculés par MIA peuvent alors refléter votre contraception plutôt que votre cycle naturel.',
          'Les estimations peuvent être moins utiles. Vous pouvez exclure des cycles du calcul depuis l\'Historique.',
        ],
      },
      { h: 'Important' },
      { p: 'MIA n\'est pas une méthode contraceptive et ne protège pas d\'une grossesse. Pour choisir, changer ou arrêter une contraception, parlez à un professionnel de santé.' },
    ],
    seeDoctor: ['vous avez des saignements inhabituels, des douleurs ou un doute sur votre contraception.'],
    sources: [PERIODS],
  },
];
