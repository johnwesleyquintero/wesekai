export interface ScoringResult {
  score: number;
  reasons: string[];
}

const TAG_WEIGHTS: Record<string, number> = {
  civilization: 3.0,
  kingdom: 2.5,
  empire: 2.5,
  economy: 2.5,
  politics: 2.5,
  nation: 2.5,
  strategy: 2.5,
  diplomacy: 2.0,
  rebuild: 2.0,
  science: 2.0,
  technology: 2.0,
  trade: 1.5,
  agriculture: 1.5,
  society: 1.5,
  military: 1.5,
  npc: 1.0,
  guild: 1.5,
  systems: 1.5,
  games: 1.0,
  conquest: 1.5,
  invention: 1.5,
  community: 1.0,
  village: 1.0,
  merchants: 1.5,
  isekai: 1.0,
  reincarnation: 1.0,
  fantasy: 0.5,
  magic: 0.5,
  'demon lord': 0.5,
  adventure: 0.5,
};

const SYNERGIES = [
  { tags: ['kingdom', 'diplomacy'], bonus: 1.0, reason: '+ Kingdom Diplomacy' },
  { tags: ['economy', 'trade'], bonus: 1.0, reason: '+ Economic Trade' },
  { tags: ['politics', 'economy'], bonus: 1.5, reason: '+ Political Economy' },
  { tags: ['civilization', 'science'], bonus: 1.5, reason: '+ Scientific Advancement' },
  { tags: ['agriculture', 'economy'], bonus: 1.0, reason: '+ Agricultural Economy' },
  { tags: ['rebuild', 'society'], bonus: 1.0, reason: '+ Societal Rebuilding' },
  { tags: ['strategy', 'military'], bonus: 1.0, reason: '+ Military Strategy' },
  { tags: ['invention', 'economy'], bonus: 1.0, reason: '+ Economic Invention' },
  { tags: ['kingdom', 'nation'], bonus: 0.5 },
  { tags: ['isekai', 'kingdom'], bonus: 0.5 },
];

export function calculateWorldBuildingScore(tags: string[]): ScoringResult {
  let score = 1.0;
  const reasons: string[] = [];
  const tagSet = new Set(tags.map(t => t.toLowerCase()));

  for (const tag of tagSet) {
    const weight = TAG_WEIGHTS[tag];
    if (weight) {
      score += weight;
      if (weight >= 1.5) {
        reasons.push(`+ ${tag.charAt(0).toUpperCase() + tag.slice(1)}`);
      }
    } else {
      score += 0.5;
    }
  }

  for (const synergy of SYNERGIES) {
    if (synergy.tags.every(t => tagSet.has(t))) {
      score += synergy.bonus;
      if (synergy.reason) reasons.push(synergy.reason);
    }
  }

  const finalScore = Math.min(10.0, Math.round(score * 10) / 10);
  const uniqueReasons = Array.from(new Set(reasons)).slice(0, 3);

  return {
    score: finalScore,
    reasons: uniqueReasons.length > 0 ? uniqueReasons : ['+ Standard World-Building'],
  };
}
