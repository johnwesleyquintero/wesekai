export const WESEKAI_CONSTANTS = {
  // Names used for client-side filtering
  BANNED_GENRES: ['Boys Love', 'Mecha', 'Card Game', 'Card Games', 'Kids', 'Family', 'Sports'],
  // MAL Genre/Theme IDs used for API-level exclusion
  // 28: Boys Love, 18: Mecha, 54: Combat Sports/Card, 15: Kids
  BANNED_GENRE_IDS: [28, 18, 54, 15],
  // Franchise keywords to strictly filter out from titles
  BANNED_TITLE_KEYWORDS: [
    'yu-gi-oh',
    'yugioh',
    'pokemon',
    'digimon',
    'beyblade',
    'bakugan',
    'duel masters',
    'vanguard',
    'shadowverse',
  ],
  FILTERS: [
    'All',
    'Isekai',
    'Fantasy',
    'Action',
    'Adventure',
    'Reincarnation',
    'Military',
    'Kingdom',
    'Strategy',
    'Comedy',
    'Romance',
    'Sci-Fi',
    'Drama',
  ],
  LEVEL_CONFIG: [
    { min: 0, title: 'Unawakened', color: 'text-zinc-500' },
    { min: 5, title: 'Wanderer', color: 'text-indigo-400' },
    { min: 15, title: 'Seeker', color: 'text-purple-400' },
    { min: 30, title: 'Archivist', color: 'text-emerald-400' },
    { min: 60, title: 'Sovereign', color: 'text-amber-500' },
  ],
};
