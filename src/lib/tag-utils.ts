/**
 * @file Shared utility functions for tag extraction and synonym mapping.
 */

/**
 * Mapping of core tags to their synonyms for keyword extraction.
 */
export const KEYWORD_SYNONYMS: Record<string, string[]> = {
  kingdom: ['kingdom', 'realm', 'monarchy', 'domain'],
  economy: ['economy', 'economics', 'finance', 'commerce', 'capitalism', 'market'],
  politics: ['politics', 'political', 'nobility', 'aristocracy', 'faction', 'court'],
  nation: ['nation', 'country', 'state', 'territory'],
  strategy: ['strategy', 'tactics', 'strategic', 'tactical', 'planning'],
  diplomacy: ['diplomacy', 'negotiation', 'treaty', 'alliance', 'ambassador'],
  rebuild: ['rebuild', 'reconstruction', 'restore', 'revive', 'rebuilding'],
  science: ['science', 'scientific', 'physics', 'chemistry'],
  technology: ['technology', 'tech', 'engineering', 'industrial', 'modern'],
  trade: ['trade', 'trading', 'commerce', 'business', 'sell', 'buy', 'merchant'],
  agriculture: ['agriculture', 'farming', 'crop', 'harvest', 'farm', 'cultivation'],
  society: ['society', 'culture', 'civilization'],
  npc: ['npc', 'non-player character', 'villager'],
  guild: ['guild', 'clan', 'faction', 'syndicate'],
  systems: ['systems', 'game system', 'status screen', 'leveling', 'stats'],
  conquest: ['conquest', 'conquer', 'invasion', 'warfare', 'domination'],
  invention: ['invention', 'invent', 'create', 'innovation', 'gadget'],
  community: ['community', 'settlement', 'town', 'people'],
  village: ['village', 'town', 'hamlet', 'settlement'],
  merchants: ['merchants', 'merchant', 'trader', 'peddler'],
  civilization: ['civilization', 'culture', 'society'],
  empire: ['empire', 'imperial', 'emperor', 'empress'],
  magic: ['magic', 'magical', 'spell', 'sorcery', 'wizardry', 'mana'],
  'demon lord': ['demon lord', 'maou', 'demon king'],
  management: ['management', 'manage', 'administration', 'governance', 'oversee'],
  crafting: ['crafting', 'craft', 'blacksmith', 'alchemy', 'synthesize', 'forging'],
  system: ['system', 'status window', 'level up', 'notification'],
  regression: ['regression', 'regressor', 'returner', 'time travel', 'past life', 'second chance'],
  reincarnation: ['reincarnation', 'reincarnated', 'rebirth', 'isekai', 'transmigration'],
  tower: ['tower', 'climb', 'floor', 'obelisk'],
  hunter: ['hunter', 'awakened', 'awakening', 'gate', 'portal'],
  dungeon: ['dungeon', 'labyrinth', 'raid', 'boss'],
  player: ['player', 'gamer', 'constellation', 'sponsor'],
};

// Pre-compiled regex map for performance optimization
const COMPILED_REGEX_MAP = new Map<string, RegExp>(
  Object.entries(KEYWORD_SYNONYMS).map(([tag, synonyms]) => {
    // Sort by length descending to ensure longer phrases match before shorter sub-words
    const uniqueKeywords = Array.from(new Set([tag, ...synonyms])).sort(
      (a, b) => b.length - a.length
    );
    return [tag, new RegExp(`\\b(${uniqueKeywords.join('|')})\\b`, 'gi')];
  })
);

/**
 * Extracts tags from a given text based on pre-defined synonyms.
 * @param text - The source text (e.g., synopsis or description).
 * @returns A Map of core tags to their match counts.
 */
export function extractTagsFromText(text: string): Map<string, number> {
  const tagWeights = new Map<string, number>();
  const normalizedText = preProcessText(text);
  if (!normalizedText) return tagWeights;

  COMPILED_REGEX_MAP.forEach((regex, tag) => {
    const matches = normalizedText.match(regex);
    if (matches) {
      tagWeights.set(tag, matches.length);
    }
  });

  return tagWeights;
}

/**
 * Sanitizes text for tag extraction by removing extra whitespace.
 */
export function preProcessText(text: string): string {
  if (typeof text !== 'string' || !text) return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Merges two tag weight maps.
 * @param base - The base map to merge into.
 * @param addition - The map to add from.
 */
export function mergeTagWeights(base: Map<string, number>, addition: Map<string, number>): void {
  addition.forEach((weight, tag) => {
    base.set(tag, (base.get(tag) || 0) + weight);
  });
}

/**
 * Finalizes tags by sorting by weight and selecting top N.
 * @param tagWeights - The Map of tags and their weights.
 * @param limit - Maximum number of tags to return.
 * @param fallback - Fallback tag if none are found.
 * @returns An array of top tags.
 */
export function finalizeTags(
  tagWeights: Map<string, number>,
  limit: number = 6,
  fallback?: string
): string[] {
  if (tagWeights.size === 0 && fallback) {
    return [fallback];
  }

  return Array.from(tagWeights.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(entry => entry[0]);
}
