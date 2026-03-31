import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, getProductBySlug } from "@/lib/data";
import PipelineBar from "@/components/PipelineBar";
import OriginTimeline from "@/components/OriginTimeline";
import PhaseSection from "@/components/PhaseSection";

export function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
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
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-text">{product.name}</h2>
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            {product.url}
          </a>
        </div>
      </div>

      {/* Pipeline bar */}
      <div className="mb-8">
        <PipelineBar currentPhase={product.phase} />
      </div>

      {/* Origin */}
      <PhaseSection title="Origen">
        <OriginTimeline timeline={product.origin.timeline} />
      </PhaseSection>

      {/* Shape */}
      <PhaseSection title="Shape">
        {product.shape ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard label="Audiencia" value={product.shape.audience} />
            <InfoCard label="No es para" value={product.shape.notFor} />
            <InfoCard label="Aspiracion" value={product.shape.aspiration} />
            <InfoCard
              label="Diferenciador"
              value={product.shape.differentiator}
            />
            <InfoCard
              label="Modelo de negocio"
              value={product.shape.businessModel}
            />
            <InfoCard
              label="Metrica clave"
              value={product.shape.keyMetric}
            />
            <InfoCard label="MLP Scope" value={product.shape.mlpScope} />
            <InfoCard label="SEO Target" value={product.shape.seoTarget} />
          </div>
        ) : null}
      </PhaseSection>

      {/* Build */}
      <PhaseSection title="Build">
        {product.build ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard label="Tech Stack" value={product.build.techStack} />
            <InfoCard label="Fuentes" value={product.build.fonts} />
            <InfoCard label="Hosting" value={product.build.hosting} />
            <InfoCard label="Dominio" value={product.build.domain} />
            <InfoCard label="Estado" value={product.build.status} />
            <InfoCard label="Siguiente" value={product.build.next} />
          </div>
        ) : null}
      </PhaseSection>

      {/* Validate */}
      <PhaseSection title="Validate">
        {product.validate ? (
          <pre className="text-sm text-text-dim">
            {JSON.stringify(product.validate, null, 2)}
          </pre>
        ) : null}
      </PhaseSection>

      {/* Launch */}
      <PhaseSection title="Launch">
        {product.launch ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {product.launch.vitalSigns.map((vs) => (
              <div
                key={vs.metric}
                className="rounded-md border border-border bg-surface2/50 px-4 py-3"
              >
                <p className="text-sm text-text-dim">{vs.metric}</p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {vs.target}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </PhaseSection>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface2/50 px-4 py-3">
      <p className="mb-1 text-xs font-medium text-text-dim">{label}</p>
      <p className="text-sm text-text">{value}</p>
    </div>
  );
}
