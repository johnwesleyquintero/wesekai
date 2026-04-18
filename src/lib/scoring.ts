import { Recommendation } from '../types';
import { SCORING_CONFIG } from './scoring-config';

export interface ScoringResult {
  score: number;
  reasons: string[];
}

export function calculateWorldBuildingScore(tags: string[]): ScoringResult {
  const { TAG_WEIGHTS, SYNERGIES, WB } = SCORING_CONFIG;
  let score = WB.INITIAL_SCORE;
  const reasons: string[] = [];
  const tagSet = new Set(tags.map(t => t.toLowerCase()));

  for (const tag of tagSet) {
    const weight = TAG_WEIGHTS[tag];
    if (weight) {
      score += weight;
      if (weight >= WB.REASON_THRESHOLD) {
        reasons.push(`+ ${tag.charAt(0).toUpperCase() + tag.slice(1)}`);
      }
    } else {
      score += WB.UNKNOWN_TAG_WEIGHT;
    }
  }

  for (const synergy of SYNERGIES) {
    if (synergy.tags.every(t => tagSet.has(t))) {
      score += synergy.bonus;
      if (synergy.reason) reasons.push(synergy.reason);
    }
  }

  const finalScore = Math.min(WB.MAX_SCORE, Math.round(score * 10) / 10);
  const uniqueReasons = Array.from(new Set(reasons)).slice(0, WB.MAX_REASONS);

  return {
    score: finalScore,
    reasons: uniqueReasons.length > 0 ? uniqueReasons : [WB.DEFAULT_REASON],
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
  const { ENGINE } = SCORING_CONFIG;

  if (!rec?.contentData?.url) return null;
  if (watchlistUrls.has(rec.contentData.url)) return null;
  if (droppedUrls.has(rec.contentData.url)) return null;

  let rawTagScore = 0;
  let frozenBranchHits = 0;
  let positiveHits = 0;

  rec.tags.forEach(tag => {
    const weight = tagPreferences[tag] || 0;
    rawTagScore += weight;
    if (weight <= ENGINE.FROZEN_BRANCH_THRESHOLD) frozenBranchHits++;
    if (weight >= ENGINE.POSITIVE_HIT_THRESHOLD) positiveHits++;
  });

  let driftMultiplier = 1.0;
  if (frozenBranchHits >= 2) driftMultiplier = ENGINE.DRIFT.HEAVY_PENALTY;
  else if (frozenBranchHits === 1) driftMultiplier = ENGINE.DRIFT.LIGHT_PENALTY;
  if (positiveHits >= 2) driftMultiplier *= ENGINE.DRIFT.BOOST;

  const tagMatchScore = Math.max(
    0,
    Math.min(ENGINE.MAX_TAG_MATCH_SCORE, ENGINE.BASE_TAG_MATCH_OFFSET + rawTagScore)
  );
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - (rec.contentData.year || ENGINE.RECENCY.FALLBACK_YEAR));
  const recencyBonus = Math.max(0, ENGINE.RECENCY.MAX_BONUS - age * ENGINE.RECENCY.DECAY_RATE);

  let finalScore =
    rec.wbScore * ENGINE.WEIGHTS.WB_SCORE +
    rec.contentData.score * ENGINE.WEIGHTS.COMMUNITY_SCORE +
    tagMatchScore * ENGINE.WEIGHTS.TAG_MATCH +
    recencyBonus +
    (rec.isElite ? ENGINE.WEIGHTS.ELITE_BONUS : 0);

  finalScore *= driftMultiplier;

  const shownCount = sessionMemory.shown[rec.contentData.url] || 0;
  if (shownCount >= 3) finalScore *= ENGINE.MEMORY_PENALTY.SHOWN_3_PLUS;
  else if (shownCount >= 2) finalScore *= ENGINE.MEMORY_PENALTY.SHOWN_2;

  if (sessionMemory.skipped[rec.contentData.url]) {
    finalScore *= ENGINE.MEMORY_PENALTY.SKIPPED;
  }

  const normalizedScore = Math.min(1, finalScore / ENGINE.NORMALIZATION_DIVISOR);
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
