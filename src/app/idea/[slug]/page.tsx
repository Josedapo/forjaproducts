import { notFound } from "next/navigation";
import Link from "next/link";
import { getScreenedIdeas, getScreenedIdea, getProductByIdeaSlug } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";
import ForjaScoreBadge from "@/components/ForjaScoreBadge";
import { FORJA_SCORE_WEIGHTS, FORJA_SCORE_THRESHOLDS } from "@/lib/forjaScoreConfig";
import type { ForjaScore, ForjaScoreDimensionKey, VerdictAlignment } from "@/lib/types";

const DIMENSION_LABELS: Record<ForjaScoreDimensionKey, string> = {
  seoEntry: "SEO Entry Feasibility",
  competitivePressure: "Competitive Pressure",
  marketDemand: "Market Demand",
  marketSize: "Market Size",
  executionFeasibility: "Execution Feasibility",
  riskProfile: "Risk Profile",
};

function scoreBand(score: number): { label: string; color: string } {
  if (score >= FORJA_SCORE_THRESHOLDS.excellent) return { label: "Excellent", color: "#38a169" };
  if (score >= FORJA_SCORE_THRESHOLDS.good) return { label: "Good", color: "#65a30d" };
  if (score >= FORJA_SCORE_THRESHOLDS.marginal) return { label: "Marginal — Watchlist", color: "#d69e2e" };
  if (score >= FORJA_SCORE_THRESHOLDS.weak) return { label: "Weak", color: "#e53e3e" };
  return { label: "Very weak", color: "#9b1c1c" };
}

function alignmentNote(alignment: VerdictAlignment): { text: string; color: string } | null {
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

function verdictPresentation(decision: string): { color: string; subtitle: string } {
  const d = decision.toUpperCase();
  if (d === "ADVANCE") {
    return {
      color: "#38a169",
      subtitle: "La idea tiene potencial suficiente para definir estrategia y construirla",
    };
  }
  if (d === "PIVOT") {
    return {
      color: "#d69e2e",
      subtitle: "La idea tiene valor pero necesita reposicionamiento para ser viable",
    };
  }
  if (d === "DISCARD") {
    return {
      color: "#e53e3e",
      subtitle: "La idea no tiene potencial suficiente como está planteada",
    };
  }
  return { color: "#6b6560", subtitle: "" };
}

export function generateStaticParams() {
  return getScreenedIdeas().map((i) => ({ slug: i.slug }));
}

interface IdeaPageProps {
  params: Promise<{ slug: string }>;
}

function RiskBadge({ risk }: { risk: string }) {
  const r = risk.toUpperCase();
  let style = "bg-surface2 text-text-dim";
  if (r === "HIGH") style = "bg-red/10 text-red";
  else if (r === "MEDIUM") style = "bg-yellow/10 text-yellow";
  else if (r === "LOW") style = "bg-green/10 text-green";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {r}
    </span>
  );
}

function SignalTypeBadge({ type }: { type: string }) {
  const t = type.toUpperCase();
  let style = "bg-surface2 text-text-dim";
  if (t === "COMPLAINT") style = "bg-red/10 text-red";
  else if (t === "REQUEST") style = "bg-blue/10 text-blue";
  else if (t === "DISCUSSION") style = "bg-yellow/10 text-yellow";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {t}
    </span>
  );
}

function ComplexityField({ value }: { value: string }) {
  const v = value.toUpperCase();
  let level = 2;
  let color = "#d69e2e";
  let label = "MEDIUM";
  let segments = [false, false, false, false];

  if (v.includes("LOW") && !v.includes("MEDIUM")) {
    level = 1; color = "#38a169"; label = "LOW";
    segments = [true, false, false, false];
  } else if (v.includes("MEDIUM-HIGH") || v.includes("MEDIUM HIGH")) {
    level = 3; color = "#e53e3e"; label = "MEDIUM-HIGH";
    segments = [true, true, true, false];
  } else if (v.includes("HIGH") && !v.includes("MEDIUM")) {
    level = 4; color = "#e53e3e"; label = "HIGH";
    segments = [true, true, true, true];
  } else {
    level = 2; color = "#d69e2e"; label = "MEDIUM";
    segments = [true, true, false, false];
  }

  const segColors = ["#38a169", "#d69e2e", "#e53e3e", "#e53e3e"];

  return (
    <div className="rounded-md border border-border bg-surface2/50 px-4 py-3">
      <p className="mb-3 border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-accent">Complexity</p>
      <div className="mb-2 flex items-center gap-2">
        <div className="flex gap-1">
          {segments.map((active, i) => (
            <div
              key={i}
              className="h-3 w-8 rounded-sm"
              style={{ backgroundColor: active ? segColors[i] : "#e2e5ea" }}
            />
          ))}
        </div>
        <span className="text-sm font-bold" style={{ color }}>{label}</span>
      </div>
      <p className="text-xs text-text-dim leading-relaxed">{value}</p>
    </div>
  );
}

function TimelineField({ value }: { value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface2/50 px-4 py-3">
      <p className="mb-3 border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-accent">Timeline</p>
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#C07840" strokeWidth="1.5">
          <circle cx="10" cy="10" r="8" />
          <path d="M10 5v5l3 3" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-semibold text-text">{value}</span>
      </div>
    </div>
  );
}

function DensityIndicator({ density }: { density: string }) {
  const d = density.toLowerCase();
  let level = 0;
  let color = "#38a169";
  let label = "Low";

  if (d.includes("saturated") || d.includes("high")) {
    level = 100;
    color = "#e53e3e";
    label = "Saturated";
  } else if (d.includes("moderate") || d.includes("medium")) {
    level = 60;
    color = "#d69e2e";
    label = "Moderate";
  } else if (d.includes("open") || d.includes("low")) {
    level = 25;
    color = "#38a169";
    label = "Open";
  } else {
    level = 50;
    color = "#d69e2e";
    label = density.split("(")[0].trim() || "Unknown";
  }

  return (
    <div className="mb-4 rounded-lg border border-border bg-surface2/50 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-accent">Competitive Density</span>
        <span className="text-sm font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${level}%`, background: `linear-gradient(90deg, #38a169, ${color})` }}
        />
      </div>
      <p className="text-xs text-text-dim">{density}</p>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-lg border border-border bg-surface">
      <div className="border-l-4 border-l-accent px-6 py-4">
        <h3 className="mb-3 text-base font-semibold text-text">{title}</h3>
        {children}
      </div>
    </section>
  );
}

function formatText(text: string) {
  // Split on numbered patterns like (1), (2) or semicolons for long lists
  const numberedPattern = /\(\d+\)\s*/;
  if (numberedPattern.test(text)) {
    const parts = text.split(/(?=\(\d+\))/).filter(Boolean).map(s => s.trim());
    if (parts.length > 1) {
      return (
        <ul className="space-y-2">
          {parts.map((part, i) => (
            <li key={i} className="flex gap-2 text-sm text-text">
              <span className="mt-0.5 shrink-0 text-accent font-bold">{i + 1}.</span>
              <span>{part.replace(/^\(\d+\)\s*/, "")}</span>
            </li>
          ))}
        </ul>
      );
    }
  }
  // Split on semicolons if text is long
  if (text.includes(";") && text.length > 150) {
    const parts = text.split(";").map(s => s.trim()).filter(Boolean);
    return (
      <ul className="space-y-1.5">
        {parts.map((part, i) => (
          <li key={i} className="flex gap-2 text-sm text-text">
            <span className="mt-0.5 shrink-0 text-accent">&#8226;</span>
            <span>{part}</span>
          </li>
        ))}
      </ul>
    );
  }
  return <p className="text-sm text-text leading-relaxed">{text}</p>;
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface2/50 px-4 py-3">
      <p className="mb-3 border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-accent">{label}</p>
      {formatText(value)}
    </div>
  );
}

export default async function IdeaPage({ params }: IdeaPageProps) {
  const { slug } = await params;
  const screened = getScreenedIdea(slug);

  if (!screened) {
    notFound();
  }

  const { screeningData: data } = screened;
  const linkedProduct = getProductByIdeaSlug(screened.slug, screened.idea);
  const forjaScore = data.forjaScore;

  return (
    <div>
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-dim hover:text-accent"
      >
        &larr; Dashboard
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-2xl font-semibold text-text">{screened.idea}</h2>
          <StatusBadge
            size="large"
            alignment={forjaScore?.alignment}
            status={
              data.verdict === "ADVANCE"
                ? "Evaluated - ADVANCE"
                : data.verdict === "PIVOT"
                  ? "Evaluated - PIVOT"
                  : data.verdict === "DISCARD"
                    ? "Evaluated - DISCARD"
                    : data.verdict
            }
          />
          {forjaScore && <ForjaScoreBadge score={forjaScore.total} size="large" />}
          {linkedProduct && (
            <Link
              href={`/product/${linkedProduct.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              {linkedProduct.name} &rarr;
            </Link>
          )}
        </div>
        <p className="mt-1 text-sm text-text-dim">
          Evaluated {data.evaluatedDate}
        </p>
      </div>

      {/* 1. Idea */}
      <SectionCard title="Idea">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <InfoField label="What" value={data.idea.what} />
          </div>
          <InfoField label="Audience" value={data.idea.audience} />
          <InfoField label="Problem" value={data.idea.problem} />
          <div className="sm:col-span-2">
            <InfoField label="Solution" value={data.idea.solution} />
          </div>
          <div className="sm:col-span-2">
            <InfoField
              label="Differentiation"
              value={data.idea.differentiation}
            />
          </div>
        </div>
      </SectionCard>

      {/* 2. Critical Assumptions */}
      <SectionCard title="Critical Assumptions">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">
                  Assumption
                </th>
                <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Risk</th>
              </tr>
            </thead>
            <tbody>
              {data.assumptions.map((a, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2 text-text">{a.assumption}</td>
                  <td className="px-4 py-2">
                    <RiskBadge risk={a.risk} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 3. Competitive Landscape */}
      <SectionCard title="Competitive Landscape">
        <DensityIndicator density={data.competitiveDensity} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Name</th>
                <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">Type</th>
                <th className="px-4 py-2 font-medium text-text-dim text-right">DR</th>
                <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">
                  Weakness
                </th>
              </tr>
            </thead>
            <tbody>
              {data.competitors.map((c, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2 font-medium text-text">{c.name}</td>
                  <td className="px-4 py-2 text-text-dim">{c.type}</td>
                  <td className="px-4 py-2 text-right">
                    {c.dr != null ? (
                      <span className={`font-medium ${c.dr >= 70 ? "text-red" : c.dr >= 40 ? "text-yellow" : "text-green"}`}>
                        {c.dr}
                      </span>
                    ) : (
                      <span className="text-text-dim">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-text-dim">{c.weakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 4. Market Data */}
      <SectionCard title="Market Data">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent">
                  Keyword
                </th>
                <th className="px-4 py-2 font-medium text-text-dim text-right">
                  Volume
                </th>
                <th className="px-4 py-2 font-medium text-text-dim text-right">
                  KD
                </th>
              </tr>
            </thead>
            <tbody>
              {data.keywords.map((k, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-2 text-text">{k.keyword}</td>
                  <td className="px-4 py-2 text-right text-text">
                    {k.volume.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={`font-medium ${
                        k.kd <= 15
                          ? "text-green"
                          : k.kd <= 40
                            ? "text-yellow"
                            : "text-red"
                      }`}
                    >
                      {k.kd}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Weighted Average KD */}
        {data.keywords.length > 0 && (() => {
          const totalVolume = data.keywords.reduce((sum, k) => sum + k.volume, 0);
          const weightedKd = totalVolume > 0
            ? Math.round(data.keywords.reduce((sum, k) => sum + k.kd * k.volume, 0) / totalVolume)
            : 0;
          const kdColor = weightedKd <= 15 ? "#38a169" : weightedKd <= 40 ? "#d69e2e" : "#e53e3e";
          const kdLabel = weightedKd <= 15 ? "Easy" : weightedKd <= 40 ? "Medium" : "Hard";
          const kdColorClass = weightedKd <= 15 ? "text-green" : weightedKd <= 40 ? "text-yellow" : "text-red";
          return (
            <div className="mt-4 rounded-lg border-2 px-5 py-4" style={{ borderColor: `${kdColor}30`, backgroundColor: `${kdColor}08` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">Weighted Avg KD</p>
                  <p className="mt-0.5 text-xs text-text-dim">Weighted by search volume ({totalVolume.toLocaleString()} total vol)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold ${kdColorClass}`}>{weightedKd}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ backgroundColor: `${kdColor}15`, color: kdColor }}>{kdLabel}</span>
                </div>
              </div>
            </div>
          );
        })()}
      </SectionCard>

      {/* 5. Community Signals */}
      <SectionCard title="Community Signals">
        <div className="space-y-3">
          {data.communitySignals.map((s, i) => (
            <div
              key={i}
              className="rounded-md border border-border bg-surface2/50 px-4 py-3"
            >
              <div className="mb-1.5 flex items-center gap-2">
                <SignalTypeBadge type={s.type} />
                <span className="text-xs text-text-dim">{s.source}</span>
              </div>
              <p className="text-sm text-text">{s.signal}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 6. Executability */}
      <SectionCard title="Executability">
        <div className="grid gap-4 sm:grid-cols-2">
          <ComplexityField value={data.executability.complexity} />
          <TimelineField value={data.executability.timeline} />
          <InfoField
            label="Dependencies"
            value={data.executability.dependencies}
          />
          <InfoField label="Risks" value={data.executability.risks} />
        </div>
      </SectionCard>

      {/* 7. Verdict & Score (combined) */}
      <SectionCard title="Verdict">
        {(() => {
          const decision = data.verdict_detail.decision;
          const presentation = verdictPresentation(decision);
          const band = forjaScore ? scoreBand(forjaScore.total) : null;
          const note = forjaScore ? alignmentNote(forjaScore.alignment) : null;

          return (
            <>
              {/* Big centered verdict title */}
              <div className="pt-2 pb-2 text-center">
                <h2
                  className="text-5xl font-extrabold tracking-tight"
                  style={{ color: presentation.color }}
                >
                  {decision.toUpperCase()}
                </h2>
                {presentation.subtitle && (
                  <p className="mx-auto mt-3 max-w-2xl text-sm text-text-dim">
                    {presentation.subtitle}
                  </p>
                )}
              </div>

              {/* Score grid: big score card + dimensions table */}
              {forjaScore && band && (
                <div className="mt-8 grid gap-4 md:grid-cols-[minmax(180px,1fr)_2fr]">
                  {/* Big score card */}
                  <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface2/50 px-6 py-8 text-center">
                    <div
                      className="text-6xl font-extrabold leading-none"
                      style={{ color: band.color }}
                    >
                      {forjaScore.total}
                    </div>
                    <div className="mt-1 text-base text-text-dim">/ 100</div>
                    <div
                      className="mt-4 text-xs font-bold uppercase tracking-wider"
                      style={{ color: band.color }}
                    >
                      {band.label}
                    </div>
                  </div>

                  {/* Dimensions table */}
                  <div className="overflow-x-auto rounded-lg border border-border bg-surface2/50">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-accent">
                            Dimensión
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-accent">
                            Raw
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-accent">
                            Weighted
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(Object.keys(FORJA_SCORE_WEIGHTS) as ForjaScoreDimensionKey[]).map((key) => {
                          const dim = forjaScore.dimensions[key];
                          const weight = FORJA_SCORE_WEIGHTS[key];
                          const isMissing = forjaScore.missingInputs.includes(key);
                          return (
                            <tr
                              key={key}
                              className="border-b border-border last:border-b-0"
                            >
                              <td className="px-4 py-3 text-text">
                                {DIMENSION_LABELS[key]}{" "}
                                <span className="text-xs text-text-dim">({weight})</span>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-text">
                                {isMissing ? (
                                  <span className="text-text-dim">N/A</span>
                                ) : (
                                  `${dim.raw}/100`
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-text">
                                {isMissing ? (
                                  <span className="text-text-dim">N/A</span>
                                ) : (
                                  `${dim.weighted}/${weight}`
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Alignment note (if divergent) */}
              {note && (
                <div
                  className="mt-4 rounded-md border px-4 py-2 text-sm"
                  style={{
                    borderColor: `${note.color}40`,
                    backgroundColor: `${note.color}08`,
                    color: note.color,
                  }}
                >
                  {note.text}
                </div>
              )}

              {/* Pros / Cons with top colored borders */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {/* In Favor */}
                <div className="rounded-md border border-border border-t-4 border-t-green bg-surface2/50 px-5 py-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-green">
                    + A favor
                  </p>
                  <ul className="space-y-2">
                    {data.verdict_detail.inFavor.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 border-b border-border pb-2 text-sm text-text last:border-b-0 last:pb-0"
                      >
                        <span className="mt-0.5 shrink-0 text-green">+</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Against */}
                <div className="rounded-md border border-border border-t-4 border-t-red bg-surface2/50 px-5 py-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-red">
                    − En contra
                  </p>
                  <ul className="space-y-2">
                    {data.verdict_detail.against.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 border-b border-border pb-2 text-sm text-text last:border-b-0 last:pb-0"
                      >
                        <span className="mt-0.5 shrink-0 text-red">−</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pivot suggestions as grid cards */}
              {data.verdict_detail.pivotSuggestions &&
                data.verdict_detail.pivotSuggestions.length > 0 && (
                  <div className="mt-8">
                    <p className="mb-4 text-xs font-bold uppercase tracking-wider text-accent">
                      Sugerencias de Pivote
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {data.verdict_detail.pivotSuggestions.map((suggestion, i) => (
                        <div
                          key={i}
                          className="rounded-md border border-border bg-surface2/50 px-5 py-4"
                        >
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-accent">
                            Pivote {i + 1}
                          </p>
                          <p className="text-sm leading-relaxed text-text">
                            {suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </>
          );
        })()}
      </SectionCard>
    </div>
  );
}
