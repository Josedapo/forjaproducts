/**
 * Forja Score calculator — deterministic conversion from ScreeningData to a 0-100 grade.
 *
 * The score is a quantitative complement to the qualitative verdict (ADVANCE/PIVOT/DISCARD),
 * not a replacement. Both layers are presented to the user; divergences are flagged but
 * never resolved automatically.
 *
 * The same formulas are documented in plain text at
 * `~/.claude/skills/forja-idea-screening/assets/forja-score-formula.md`
 * for Claude to apply by hand during screening. Keep them in sync.
 */

import type {
  ForjaScore,
  ForjaScoreDimension,
  ForjaScoreDimensionKey,
  ScreeningData,
  VerdictAlignment,
} from "./types";
import {
  COMPLEXITY_SCORES,
  DIVERGENCE_THRESHOLDS,
  FORJA_SCORE_WEIGHTS,
  RISK_LEVEL_SCORES,
  VOLUME_BUCKETS,
} from "./forjaScoreConfig";

/**
 * Compute the volume-weighted average KD across an idea's keywords.
 * Returns 0 if there are no keywords or total volume is 0.
 *
 * Extracted here so it can be reused both by the score calculator and by the
 * idea detail page (which already shows this number visually).
 */
export function weightedAvgKd(
  keywords: { volume: number; kd: number }[]
): { value: number; totalVolume: number } {
  const usable = keywords.filter((k) => !(k.kd === 0 && k.volume === 0));
  const totalVolume = usable.reduce((sum, k) => sum + k.volume, 0);
  if (usable.length === 0 || totalVolume === 0) {
    return { value: 0, totalVolume: 0 };
  }
  const value = Math.round(
    usable.reduce((sum, k) => sum + k.kd * k.volume, 0) / totalVolume
  );
  return { value, totalVolume };
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function bucketScore(value: number): number {
  for (const bucket of VOLUME_BUCKETS) {
    if (value >= bucket.min) return bucket.score;
  }
  return 0;
}

function normalizeVerdict(verdict: string): "ADVANCE" | "PIVOT" | "DISCARD" | "UNKNOWN" {
  const v = verdict.toLowerCase();
  if (v.includes("advance")) return "ADVANCE";
  if (v.includes("pivot")) return "PIVOT";
  if (v.includes("discard")) return "DISCARD";
  return "UNKNOWN";
}

/**
 * Decide whether the score and verdict diverge significantly.
 * Returns 'aligned' for the common case where they agree mechanically.
 */
export function getVerdictAlignment(
  verdict: string,
  score: number
): VerdictAlignment {
  const v = normalizeVerdict(verdict);
  if (v === "DISCARD" && score >= DIVERGENCE_THRESHOLDS.optimisticMin) {
    return "divergent-optimistic";
  }
  if (v === "ADVANCE" && score < DIVERGENCE_THRESHOLDS.pessimisticMax) {
    return "divergent-pessimistic";
  }
  return "aligned";
}

// ---------------------------------------------------------------------------
// Dimension calculators
// ---------------------------------------------------------------------------

function calcSeoEntry(data: ScreeningData): { raw: number | null; reason: string } {
  if (!data.keywords || data.keywords.length === 0) {
    return { raw: null, reason: "No keyword data captured" };
  }
  const { value, totalVolume } = weightedAvgKd(data.keywords);
  if (totalVolume === 0) {
    return { raw: null, reason: "Keywords have no usable volume" };
  }
  const raw = clamp(100 - value);
  const easyCount = data.keywords.filter((k) => k.kd > 0 && k.kd < 15).length;
  const reason = `Weighted avg KD ${value} across ${totalVolume.toLocaleString()} volume (${easyCount} easy keywords)`;
  return { raw, reason };
}

function calcCompetitivePressure(data: ScreeningData): {
  raw: number | null;
  reason: string;
} {
  const density = (data.competitiveDensity || "").toLowerCase();
  let densityScore: number;
  let densityLabel: string;
  if (density.includes("saturated") || density.includes("high")) {
    densityScore = 20;
    densityLabel = "Saturated";
  } else if (density.includes("moderate") || density.includes("medium")) {
    densityScore = 60;
    densityLabel = "Moderate";
  } else if (density.includes("open") || density.includes("low")) {
    densityScore = 90;
    densityLabel = "Open";
  } else {
    return { raw: null, reason: "No competitive density recorded" };
  }

  const competitors = data.competitors || [];
  const withDr = competitors.filter((c) => typeof c.dr === "number");
  const drCoverage = competitors.length > 0 ? withDr.length / competitors.length : 0;

  if (drCoverage < 0.5) {
    return {
      raw: densityScore,
      reason: `${densityLabel} density (DR data missing for >50% of competitors, using density only)`,
    };
  }

  const avgDr = withDr.reduce((s, c) => s + (c.dr ?? 0), 0) / withDr.length;
  const drScore = clamp(100 - avgDr);
  const raw = Math.round((densityScore + drScore) / 2);
  return {
    raw,
    reason: `${densityLabel} density, avg competitor DR ${Math.round(avgDr)} across ${withDr.length} competitors`,
  };
}

function calcMarketDemand(data: ScreeningData): {
  raw: number | null;
  reason: string;
} {
  const totalVolume = (data.keywords || []).reduce((s, k) => s + k.volume, 0);
  if (data.keywords.length === 0) {
    return { raw: null, reason: "No keyword data captured" };
  }
  const baseScore = bucketScore(totalVolume);
  const strongSignals = (data.communitySignals || []).filter((s) => {
    const t = (s.type || "").toUpperCase();
    return t === "COMPLAINT" || t === "REQUEST";
  });
  const bonus = strongSignals.length >= 3 ? 10 : 0;
  const raw = clamp(baseScore + bonus);
  const reason =
    `${totalVolume.toLocaleString()} total search volume, ${strongSignals.length} pain/request signals` +
    (bonus > 0 ? " (+10 demand bonus)" : "");
  return { raw, reason };
}

function calcMarketSize(data: ScreeningData): {
  raw: number | null;
  reason: string;
} {
  const totalVolume = (data.keywords || []).reduce((s, k) => s + k.volume, 0);
  if (data.keywords.length === 0) {
    return { raw: null, reason: "No keyword data captured" };
  }
  const raw = bucketScore(totalVolume);
  const reason = `${totalVolume.toLocaleString()} addressable monthly searches`;
  return { raw, reason };
}

function complexityBaseScore(complexityText: string): number | null {
  const v = (complexityText || "").toUpperCase();
  if (v.includes("MEDIUM-HIGH") || v.includes("MEDIUM HIGH")) return COMPLEXITY_SCORES["MEDIUM-HIGH"];
  if (v.includes("LOW") && !v.includes("MEDIUM")) return COMPLEXITY_SCORES.LOW;
  if (v.includes("HIGH") && !v.includes("MEDIUM")) return COMPLEXITY_SCORES.HIGH;
  if (v.includes("MEDIUM")) return COMPLEXITY_SCORES.MEDIUM;
  return null;
}

function timelineAdjustment(timelineText: string): number {
  // Look for digits + "week" or "weekend" — accept ranges like "2-3 weeks"
  const txt = (timelineText || "").toLowerCase();
  if (txt.includes("weekend") || txt.includes("hour")) return 10;
  const match = txt.match(/(\d+)\s*(?:-\s*\d+)?\s*(week|day|sem|d[ií]a)/);
  if (!match) return 0;
  const weeks = parseInt(match[1], 10);
  if (Number.isNaN(weeks)) return 0;
  if (weeks <= 2) return 10;
  if (weeks <= 4) return 0;
  return -10;
}

function dependenciesAdjustment(depsText: string): number {
  const t = (depsText || "").toLowerCase();
  if (t.includes("none") || t.trim() === "") return 10;
  // Penalize paid APIs / costly external services
  if (t.includes("$") || t.includes("/mo") || t.includes("paid") || t.includes("subscription")) {
    return -10;
  }
  return 0;
}

function calcExecutionFeasibility(data: ScreeningData): {
  raw: number | null;
  reason: string;
} {
  const exec = data.executability;
  if (!exec) return { raw: null, reason: "No executability data captured" };
  const base = complexityBaseScore(exec.complexity);
  if (base === null) {
    return { raw: null, reason: "Complexity not classified" };
  }
  const tlAdj = timelineAdjustment(exec.timeline);
  const depAdj = dependenciesAdjustment(exec.dependencies);
  const raw = clamp(base + tlAdj + depAdj);
  const reason = `Complexity ${base}/100, timeline ${tlAdj >= 0 ? "+" : ""}${tlAdj}, deps ${depAdj >= 0 ? "+" : ""}${depAdj}`;
  return { raw, reason };
}

function calcRiskProfile(data: ScreeningData): {
  raw: number | null;
  reason: string;
} {
  const assumptions = data.assumptions || [];
  if (assumptions.length === 0) {
    return { raw: null, reason: "No assumptions captured" };
  }
  const points: number[] = assumptions.map((a) => {
    const r = (a.risk || "").toUpperCase() as keyof typeof RISK_LEVEL_SCORES;
    return RISK_LEVEL_SCORES[r] ?? 50;
  });
  const raw = Math.round(points.reduce((s: number, p: number) => s + p, 0) / points.length);
  const highCount = assumptions.filter((a) => (a.risk || "").toUpperCase() === "HIGH").length;
  const reason = `${assumptions.length} assumptions, ${highCount} HIGH-risk`;
  return { raw, reason };
}

// ---------------------------------------------------------------------------
// Main calculator
// ---------------------------------------------------------------------------

const DIMENSION_FNS: Record<
  ForjaScoreDimensionKey,
  (data: ScreeningData) => { raw: number | null; reason: string }
> = {
  seoEntry: calcSeoEntry,
  competitivePressure: calcCompetitivePressure,
  marketDemand: calcMarketDemand,
  marketSize: calcMarketSize,
  executionFeasibility: calcExecutionFeasibility,
  riskProfile: calcRiskProfile,
};

export function calculateForjaScore(data: ScreeningData): ForjaScore {
  const dimensions = {} as Record<ForjaScoreDimensionKey, ForjaScoreDimension>;
  const missingInputs: ForjaScoreDimensionKey[] = [];

  let presentWeightSum = 0;
  let weightedTotal = 0;

  (Object.keys(FORJA_SCORE_WEIGHTS) as ForjaScoreDimensionKey[]).forEach((key) => {
    const weight = FORJA_SCORE_WEIGHTS[key];
    const { raw, reason } = DIMENSION_FNS[key](data);
    if (raw === null) {
      missingInputs.push(key);
      dimensions[key] = { raw: 0, weighted: 0, reason };
      return;
    }
    const weighted = (raw * weight) / 100;
    dimensions[key] = { raw, weighted: Math.round(weighted * 10) / 10, reason };
    presentWeightSum += weight;
    weightedTotal += weighted;
  });

  // Re-normalize: scale up the present dimensions to fill the 100 point space
  const total =
    presentWeightSum === 0
      ? 0
      : Math.round((weightedTotal / presentWeightSum) * 100);

  const alignment = getVerdictAlignment(data.verdict, total);

  return {
    total,
    calculatedAt: new Date().toISOString().slice(0, 10),
    dimensions,
    missingInputs,
    alignment,
  };
}

/**
 * Returns the score from data if present, otherwise computes it on the fly.
 * This is the safe accessor used throughout the dashboard so legacy ideas
 * (without a persisted forjaScore) never break the UI.
 */
export function getForjaScore(data: ScreeningData): ForjaScore {
  return data.forjaScore ?? calculateForjaScore(data);
}
