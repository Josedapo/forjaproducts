/**
 * Forja Score configuration — single source of truth for weights and thresholds.
 *
 * IMPORTANT: These constants are also documented in the screening skill at
 * `~/.claude/skills/forja-idea-screening/assets/forja-score-formula.md`.
 * If you change values here, update the asset to keep both in sync, otherwise
 * scores written by Claude during screening will diverge from scores computed
 * at runtime by the dashboard fallback.
 */

import type { ForjaScoreDimensionKey } from "./types";

export const FORJA_SCORE_WEIGHTS: Record<ForjaScoreDimensionKey, number> = {
  seoEntry: 25,
  competitivePressure: 20,
  marketDemand: 15,
  marketSize: 15,
  executionFeasibility: 15,
  riskProfile: 10,
};

// Sanity check at module load: weights must total 100
const _weightsSum = Object.values(FORJA_SCORE_WEIGHTS).reduce((s, v) => s + v, 0);
if (_weightsSum !== 100) {
  throw new Error(
    `FORJA_SCORE_WEIGHTS must sum to 100, got ${_weightsSum}. Update forjaScoreConfig.ts.`
  );
}

/**
 * Score bands used for color coding and labels in the dashboard.
 * These describe what the math says — they do NOT override the qualitative verdict.
 */
export const FORJA_SCORE_THRESHOLDS = {
  excellent: 80, // green, strong build signal
  good: 60, // green-yellow, build with caveats
  marginal: 40, // yellow, watchlist territory
  weak: 20, // red, weak signal
} as const;

/**
 * Divergence detection between the score and the qualitative verdict.
 * The verdict is authoritative — these flags surface "the data disagrees with you"
 * for review, but never block the verdict.
 */
export const DIVERGENCE_THRESHOLDS = {
  optimisticMin: 70, // score >= 70 with DISCARD = data says yes, you said no
  pessimisticMax: 40, // score < 40 with ADVANCE = data says no, you said yes
} as const;

/**
 * Keyword KD bands used by SEO Entry Feasibility.
 * Aligned with the existing color coding in idea/[slug]/page.tsx.
 */
export const KEYWORD_THRESHOLDS = {
  easyKd: 15,
  moderateKd: 40,
} as const;

/**
 * Volume → score mapping for Market Demand and Market Size.
 * Log-scale buckets calibrated against the 4 existing screened ideas.
 */
export const VOLUME_BUCKETS: { min: number; score: number }[] = [
  { min: 50000, score: 100 },
  { min: 10000, score: 80 },
  { min: 2000, score: 60 },
  { min: 500, score: 40 },
  { min: 0, score: 20 },
];

/**
 * Complexity → base score for Execution Feasibility.
 */
export const COMPLEXITY_SCORES = {
  LOW: 90,
  MEDIUM: 60,
  "MEDIUM-HIGH": 40,
  HIGH: 20,
} as const;

/**
 * Risk level → points for Risk Profile (averaged across assumptions).
 */
export const RISK_LEVEL_SCORES = {
  LOW: 100,
  MEDIUM: 50,
  HIGH: 0,
} as const;
