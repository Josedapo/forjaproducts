import type { ForjaScore, ForjaScoreDimensionKey } from "@/lib/types";
import { FORJA_SCORE_WEIGHTS, FORJA_SCORE_THRESHOLDS } from "@/lib/forjaScoreConfig";

const DIMENSION_LABELS: Record<ForjaScoreDimensionKey, string> = {
  seoEntry: "SEO Entry Feasibility",
  competitivePressure: "Competitive Pressure",
  marketDemand: "Market Demand",
  marketSize: "Market Size",
  executionFeasibility: "Execution Feasibility",
  riskProfile: "Risk Profile",
};

function bandLabel(score: number): { label: string; color: string } {
  if (score >= FORJA_SCORE_THRESHOLDS.excellent) return { label: "Excellent", color: "#38a169" };
  if (score >= FORJA_SCORE_THRESHOLDS.good) return { label: "Good", color: "#65a30d" };
  if (score >= FORJA_SCORE_THRESHOLDS.marginal) return { label: "Marginal", color: "#d69e2e" };
  if (score >= FORJA_SCORE_THRESHOLDS.weak) return { label: "Weak", color: "#e53e3e" };
  return { label: "Very weak", color: "#9b1c1c" };
}

function alignmentNote(alignment: ForjaScore["alignment"]): { text: string; color: string } | null {
  if (alignment === "divergent-optimistic") {
    return {
      text: "Score suggests ADVANCE but verdict is DISCARD. The data disagrees with the qualitative call — review when revisiting.",
      color: "#e53e3e",
    };
  }
  if (alignment === "divergent-pessimistic") {
    return {
      text: "Score suggests DISCARD but verdict is ADVANCE. Strong conviction call — monitor closely as you build.",
      color: "#e53e3e",
    };
  }
  return null;
}

export default function ForjaScoreCard({ score }: { score: ForjaScore }) {
  const band = bandLabel(score.total);
  const note = alignmentNote(score.alignment);

  return (
    <section className="mb-6 rounded-lg border border-border bg-surface">
      <div className="border-l-4 border-l-accent px-6 py-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-text">Forja Score</h3>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold" style={{ color: band.color }}>
              {score.total}
              <span className="text-base font-medium text-text-dim">/100</span>
            </span>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${band.color}15`, color: band.color }}
            >
              {band.label}
            </span>
          </div>
        </div>

        {note && (
          <div
            className="mb-4 rounded-md border px-4 py-2 text-sm"
            style={{ borderColor: `${note.color}40`, backgroundColor: `${note.color}08`, color: note.color }}
          >
            {note.text}
          </div>
        )}

        <div className="space-y-3">
          {(Object.keys(FORJA_SCORE_WEIGHTS) as ForjaScoreDimensionKey[]).map((key) => {
            const dim = score.dimensions[key];
            const weight = FORJA_SCORE_WEIGHTS[key];
            const filledPct = (dim.weighted / weight) * 100;
            const isMissing = score.missingInputs.includes(key);
            return (
              <div key={key} className="rounded-md border border-border bg-surface2/50 px-4 py-3">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-text">
                    {DIMENSION_LABELS[key]}
                    <span className="ml-2 text-xs text-text-dim">({weight} pts)</span>
                  </span>
                  <span className="whitespace-nowrap text-sm font-semibold text-text">
                    {isMissing ? <span className="text-text-dim">N/A</span> : `${dim.weighted}/${weight}`}
                  </span>
                </div>
                {!isMissing && (
                  <div className="mb-1.5 h-2 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${filledPct}%`,
                        background: filledPct >= 70 ? "#38a169" : filledPct >= 40 ? "#d69e2e" : "#e53e3e",
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-text-dim leading-relaxed">{dim.reason}</p>
              </div>
            );
          })}
        </div>

        {score.missingInputs.length > 0 && (
          <p className="mt-3 text-xs text-text-dim">
            Score re-normalized across present dimensions. Missing inputs:{" "}
            <span className="font-medium">{score.missingInputs.map((k) => DIMENSION_LABELS[k]).join(", ")}</span>
          </p>
        )}

        <p className="mt-3 text-xs text-text-dim">
          Calculated {score.calculatedAt} · Alignment with verdict:{" "}
          <span className="font-medium">{score.alignment}</span>
        </p>
      </div>
    </section>
  );
}
