// BROUILLONS : aucun article ne doit être publié sans relecture par une personne compétente en santé
// (sections 2 et 17). Tant que `reviewer` est null, l'application affiche « en attente de relecture ».
export interface Article {
  slug: string;
  title: string;
  theme: string;
  reviewer: string | null;
  revised: string;
  version: number;
  seeDoctor?: string;
  body: string[];
}

export const ARTICLES: Article[] = [
  {
    slug: 'comprendre-le-cycle',
    title: 'Les phases du cycle',
    theme: 'Comprendre le cycle',
    reviewer: null,
    revised: '2026-11-02',
    version: 1,
    body: [
      'Le cycle menstruel se compte du premier jour des règles jusqu\'à la veille des règles suivantes. Sa durée varie d\'une personne à l\'autre, et d\'un mois à l\'autre.',
      'MIA calcule vos cycles à partir des dates de début de règles que vous enregistrez. Plus vous en notez, plus l\'estimation est utile, mais elle reste une estimation.',
    ],
  },
  {
    slug: 'cycles-irreguliers',
    title: 'Cycles irréguliers',
    theme: 'Cycles irréguliers',
    reviewer: null,
    revised: '2026-11-02',
    version: 1,
    seeDoctor: 'vos cycles changent nettement et durablement, ou s\'accompagnent de douleurs importantes.',
    body: [
      'Il est courant que les cycles varient, surtout les premières années après les premières règles, après une grossesse ou à l\'approche de la ménopause.',
      'Quand les durées sont très différentes d\'un cycle à l\'autre, MIA ne propose pas de date : elle préfère ne pas donner une fausse précision.',
      'Noter vos règles et vos symptômes dans MIA peut vous aider à en parler à un professionnel de santé.',
    ],
  },
  {
    slug: 'premieres-regles',
    title: 'Premières règles : à quoi s\'attendre',
    theme: 'Premières règles',
    reviewer: null,
    revised: '2026-11-02',
    version: 1,
    seeDoctor: 'vous avez des douleurs qui vous empêchent de vivre normalement ou des saignements très abondants.',
    body: [
      'Les premiers cycles sont souvent irréguliers : c\'est fréquent. Parler à un adulte de confiance peut aider à se sentir plus sereine.',
    ],
  },
];
