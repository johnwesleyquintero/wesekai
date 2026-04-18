/**
 * @file Centralized configuration for the WESEKAI scoring engine.
 */

export const SCORING_CONFIG = {
  /** Weights for individual tags used in World-Building calculation */
  TAG_WEIGHTS: {
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
  } as Record<string, number>,

  /** Multi-tag synergies providing bonus points */
  SYNERGIES: [
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
  ],

  /** World-Building (WB) Scoring Constants */
  WB: {
    INITIAL_SCORE: 1.0,
    REASON_THRESHOLD: 1.5,
    UNKNOWN_TAG_WEIGHT: 0.5,
    MAX_SCORE: 10.0,
    MAX_REASONS: 3,
    DEFAULT_REASON: '+ Standard World-Building',
  },

  /** Recommendation Engine Multipliers and Thresholds */
  ENGINE: {
    FROZEN_BRANCH_THRESHOLD: -1.0,
    POSITIVE_HIT_THRESHOLD: 1.0,
    DRIFT: {
      HEAVY_PENALTY: 0.1, // >= 2 frozen branch hits
      LIGHT_PENALTY: 0.4, // 1 frozen branch hit
      BOOST: 1.3, // >= 2 positive hits
    },
    WEIGHTS: {
      WB_SCORE: 0.4,
      COMMUNITY_SCORE: 0.2,
      TAG_MATCH: 0.2,
      ELITE_BONUS: 2.0,
    },
    RECENCY: {
      FALLBACK_YEAR: 2015,
      MAX_BONUS: 2.5,
      DECAY_RATE: 0.25,
    },
    MEMORY_PENALTY: {
      SHOWN_3_PLUS: 0.4,
      SHOWN_2: 0.7,
      SKIPPED: 0.6,
    },
    /** Constants for UI/Telemetry visualization */
    VISUAL: {
      MAX_WEIGHT_CAP: 3.0,
    },
    /** Used to normalize the final score to a 0-1 range for confidence */
    NORMALIZATION_DIVISOR: 12.5,
    /** The floor/starting point for tag match scores */
    BASE_TAG_MATCH_OFFSET: 5,
    /** Max score for the tag matching component */
    MAX_TAG_MATCH_SCORE: 10,
  },
};

export type ScoringConfig = typeof SCORING_CONFIG;
