export const WESEKAI_CONSTANTS = {
  // Names used for client-side filtering
  BANNED_GENRES: ['Boys Love', 'Mecha', 'Card Game', 'Card Games', 'Kids', 'Family'],
  // MAL Genre/Theme IDs used for API-level exclusion
  // 28: Boys Love, 18: Mecha, 54: Combat Sports/Card, 15: Kids
  BANNED_GENRE_IDS: [28, 18, 54, 15],
  // Franchise keywords to strictly filter out from titles
  BANNED_TITLE_KEYWORDS: [
    'yu-gi-oh',
    'yugioh',
    'pokemon',
    'beyblade',
    'bakugan',
    'duel masters',
    'vanguard',
    'shadowverse',
  ],
};
