import { notFound } from "next/navigation";
import Link from "next/link";
import { getScreenedIdeas, getScreenedIdea, getProductByIdeaSlug } from "@/lib/data";
import StatusBadge from "@/components/StatusBadge";

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

      {/* 7. Verdict */}
      <SectionCard title="Verdict">
        <div className="mb-5 text-center">
          <StatusBadge
            size="large"
            status={
              data.verdict_detail.decision === "ADVANCE"
                ? "Evaluated - ADVANCE"
                : data.verdict_detail.decision === "PIVOT"
                  ? "Evaluated - PIVOT"
                  : data.verdict_detail.decision === "DISCARD"
                    ? "Evaluated - DISCARD"
                    : data.verdict_detail.decision
            }
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* In Favor */}
          <div className="rounded-md border border-green/20 bg-green-bg px-4 py-3">
            <p className="mb-2 text-xs font-medium text-green">In Favor</p>
            <ul className="space-y-1.5">
              {data.verdict_detail.inFavor.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-text">
                  <span className="mt-0.5 shrink-0 text-green">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Against */}
          <div className="rounded-md border border-red/20 bg-red-bg px-4 py-3">
            <p className="mb-2 text-xs font-medium text-red">Against</p>
            <ul className="space-y-1.5">
              {data.verdict_detail.against.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-text">
                  <span className="mt-0.5 shrink-0 text-red">-</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pivot Suggestions */}
        {data.verdict_detail.pivotSuggestions && data.verdict_detail.pivotSuggestions.length > 0 && (
          <div className="mt-4 rounded-lg border-2 border-yellow/30 bg-yellow-bg px-5 py-4">
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-yellow">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow text-[10px] text-white">↗</span>
              Pivot Suggestions
            </p>
            <div className="space-y-3">
              {data.verdict_detail.pivotSuggestions.map((suggestion, i) => (
                <div key={i} className="flex gap-3 rounded-md border border-yellow/15 bg-surface px-4 py-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow/15 text-xs font-bold text-yellow">
                    {i + 1}
                  </span>
                  <p className="text-sm text-text leading-relaxed">{suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
