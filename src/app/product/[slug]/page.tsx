import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, getProductBySlug, getScreenedIdeas } from "@/lib/data";
import PipelineBar from "@/components/PipelineBar";
import OriginTimeline from "@/components/OriginTimeline";
import PhaseSection from "@/components/PhaseSection";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function InfoCard({ label, value, icon, format = "text" }: { label: string; value: string; icon?: string; format?: "text" | "tags" | "bullets" | "tag-single" }) {
  let formatted;
  if (format === "tags") formatted = formatAsTags(value);
  else if (format === "bullets") formatted = formatAsBullets(value, "+");
  else if (format === "tag-single") formatted = (
    <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">{value}</span>
  );
  else formatted = formatValue(value);

  return (
    <div className="rounded-md border border-border bg-surface2/50 px-4 py-3">
      <p className="mb-3 border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-accent">
        {icon && <span className="mr-1.5">{icon}</span>}
        {label}
      </p>
      {formatted}
    </div>
  );
}

function formatAsTags(text: string) {
  const parts = text.split(" + ").map(s => s.trim());
  return (
    <div className="flex flex-wrap gap-1.5">
      {parts.map((part, i) => (
        <span key={i} className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
          {part}
        </span>
      ))}
    </div>
  );
}

function formatAsBullets(text: string, separator: string = "+") {
  const parts = text.split(separator).map(s => s.trim()).filter(Boolean);
  if (parts.length <= 1) return <p className="text-sm text-text leading-relaxed">{text}</p>;
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

function formatValue(text: string) {
  return <p className="text-sm text-text leading-relaxed">{text}</p>;
}

function VitalSignCard({ metric, target }: { metric: string; target: string }) {
  let icon = "📊";
  if (metric.toLowerCase().includes("session")) icon = "👥";
  else if (metric.toLowerCase().includes("click") || metric.toLowerCase().includes("amazon")) icon = "🛒";
  else if (metric.toLowerCase().includes("page")) icon = "📄";

  return (
    <div className="rounded-lg border border-border bg-surface px-5 py-4 text-center">
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 text-2xl font-bold text-accent">{target}</p>
      <p className="mt-1 text-xs text-text-dim">{metric}</p>
    </div>
  );
}

function DocumentLinks({ slug, documents, phase }: { slug: string; documents?: { id: string; name: string; phase: string }[]; phase: string }) {
  const phaseDocs = documents?.filter(d => d.phase === phase) || [];
  if (phaseDocs.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {phaseDocs.map((doc) => (
        <Link
          key={doc.id}
          href={`/product/${slug}/doc/${doc.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-sm font-medium text-accent hover:bg-accent/10 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M8 1H3a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V5L8 1z" />
            <path d="M8 1v4h4" />
          </svg>
          {doc.name}
        </Link>
      ))}
    </div>
  );
}

function NextStepsCard({ value }: { value: string }) {
  const steps = value.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div className="rounded-lg border-2 border-accent bg-accent/5 px-5 py-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] text-white">!</span>
        Next Steps
      </p>
      <ul className="space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-sm font-medium text-text">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PendingPhase({ skill }: { skill: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-surface2/30 px-5 py-4">
      <span className="text-2xl opacity-40">⏳</span>
      <div>
        <p className="text-sm font-medium text-text-dim">Pending</p>
        <p className="text-xs text-text-dim/70">This phase will be completed with <code className="rounded bg-accent/10 px-1.5 py-0.5 text-accent">{skill}</code></p>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-text">{product.name}</h2>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            title={product.url}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 3H3v10h10v-3M9 2h5v5M14 2L7 9" />
            </svg>
          </a>
        </div>
        {product.logoUrl && (
          <img
            src={product.logoUrl}
            alt={`${product.name} logo`}
            className="h-10 w-auto"
          />
        )}
      </div>

      {/* Pipeline bar */}
      <div className="mb-8">
        <PipelineBar currentPhase={product.phase} />
      </div>

      {/* Origin */}
      <PhaseSection title="Origin" icon="🌱">
        <OriginTimeline
          timeline={product.origin.timeline}
          ideaSlugMap={(() => {
            const map: Record<string, string> = {};
            for (const si of getScreenedIdeas()) {
              map[si.idea.toLowerCase()] = si.slug;
            }
            return map;
          })()}
        />
      </PhaseSection>

      {/* Shape */}
      <PhaseSection title="Shape" icon="💡">
        {product.shape ? (
          <>
          <DocumentLinks slug={slug} documents={product.documents} phase="shape" />
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon="🎯" label="Audience" value={product.shape.audience} />
            <InfoCard icon="🚫" label="Not for" value={product.shape.notFor} />
            <InfoCard icon="⭐" label="Aspiration" value={product.shape.aspiration} />
            <InfoCard icon="💎" label="Differentiator" value={product.shape.differentiator} format="bullets" />
            <InfoCard icon="💰" label="Business model" value={product.shape.businessModel} format="bullets" />
            <InfoCard icon="📏" label="Key metric" value={product.shape.keyMetric} format="tag-single" />
            <InfoCard icon="📦" label="MLP Scope" value={product.shape.mlpScope} />
            <InfoCard icon="🔍" label="SEO Target" value={product.shape.seoTarget} />
          </div>
          </>
        ) : null}
      </PhaseSection>

      {/* Build */}
      <PhaseSection title="Build" icon="🔨">
        {product.build ? (
          <>
          <DocumentLinks slug={slug} documents={product.documents} phase="build" />
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon="⚙️" label="Tech Stack" value={product.build.techStack} format="tags" />
            <InfoCard icon="🔤" label="Fonts" value={product.build.fonts} />
            <InfoCard icon="☁️" label="Hosting" value={product.build.hosting} />
            <InfoCard icon="🌐" label="Domain" value={product.build.domain} />
            <div className="sm:col-span-2">
              <InfoCard icon="📋" label="Status" value={product.build.status} />
            </div>
            <div className="sm:col-span-2">
              <NextStepsCard value={product.build.next} />
            </div>
          </div>
          </>
        ) : null}
      </PhaseSection>

      {/* Validate */}
      <PhaseSection title="Validate" icon="🔍">
        {product.validate ? (
          <pre className="text-sm text-text-dim">
            {JSON.stringify(product.validate, null, 2)}
          </pre>
        ) : (
          <PendingPhase skill="/forja-seo-validate" />
        )}
      </PhaseSection>

      {/* Launch */}
      <PhaseSection title="Launch" icon="🚀">
        {product.launch ? (
          <div>
            <p className="mb-4 border-b border-border pb-2 text-xs font-bold uppercase tracking-wider text-accent">
              Vital Signs — Targets
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {product.launch.vitalSigns.map((vs) => (
                <VitalSignCard key={vs.metric} metric={vs.metric} target={vs.target} />
              ))}
            </div>
          </div>
        ) : (
          <PendingPhase skill="/forja-launch" />
        )}
      </PhaseSection>
    </div>
  );
}
