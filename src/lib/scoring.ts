import { Recommendation } from '../types';

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

export function calculateRecommendationScore(
  rec: Recommendation,
  watchlistUrls: Set<string>,
  droppedUrls: Set<string>,
  tagPreferences: Record<string, number>,
  sessionMemory: {
    shown: Record<string, number>;
    skipped: Record<string, boolean>;
  }
): {
  score: number;
  confidence: number;
  drift: number;
} | null {
  if (!rec?.contentData?.url) return null;
  if (watchlistUrls.has(rec.contentData.url)) return null;
  if (droppedUrls.has(rec.contentData.url)) return null;

  let rawTagScore = 0;
  let frozenBranchHits = 0;
  let positiveHits = 0;

  rec.tags.forEach(tag => {
    const weight = tagPreferences[tag] || 0;
    rawTagScore += weight;
    if (weight <= -1.0) frozenBranchHits++;
    if (weight >= 1.0) positiveHits++;
  });

  let driftMultiplier = 1.0;
  if (frozenBranchHits >= 2) driftMultiplier = 0.1;
  else if (frozenBranchHits === 1) driftMultiplier = 0.4;
  if (positiveHits >= 2) driftMultiplier *= 1.3;

  const tagMatchScore = Math.max(0, Math.min(10, 5 + rawTagScore));
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - (rec.contentData.year || 2015));
  const recencyBonus = Math.max(0, 2.5 - age * 0.25);

  let finalScore =
    rec.wbScore * 0.4 +
    rec.contentData.score * 0.2 +
    tagMatchScore * 0.2 +
    recencyBonus +
    (rec.isElite ? 2.0 : 0);

  finalScore *= driftMultiplier;

  const shownCount = sessionMemory.shown[rec.contentData.url] || 0;
  if (shownCount >= 3) finalScore *= 0.4;
  else if (shownCount >= 2) finalScore *= 0.7;
  if (sessionMemory.skipped[rec.contentData.url]) finalScore *= 0.6;

  const normalizedScore = Math.min(1, finalScore / 12.5);
  const confidenceScore = Math.max(0, Math.min(1, normalizedScore * driftMultiplier));

  return {
    score: finalScore,
    confidence: confidenceScore,
    drift: driftMultiplier,
  };
}

export function findBestRecommendation(
  candidatePool: Recommendation[],
  watchlistUrls: Set<string>,
  droppedUrls: Set<string>,
  tagPreferences: Record<string, number>,
  sessionMemory: {
    shown: Record<string, number>;
    skipped: Record<string, boolean>;
  }
): (Recommendation & { confidenceScore: number; driftMultiplier: number }) | null {
  let bestRec: (Recommendation & { confidenceScore: number; driftMultiplier: number }) | null =
    null;
  let bestScore = -Infinity;

  for (const rec of candidatePool) {
    const scoringResult = calculateRecommendationScore(
      rec,
      watchlistUrls,
      droppedUrls,
      tagPreferences,
      sessionMemory
    );

    if (!scoringResult) continue;

    const {
      score: finalScore,
      confidence: confidenceScore,
      drift: driftMultiplier,
    } = scoringResult;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestRec = {
        ...rec,
        confidenceScore,
        driftMultiplier,
      };
    }
  }

  return bestRec;
}
