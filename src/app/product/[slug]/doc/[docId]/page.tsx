import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllProducts, getProductBySlug, getProductDocument } from "@/lib/data";
import MarkdownViewer from "@/components/MarkdownViewer";

export function generateStaticParams() {
  const products = getAllProducts();
  const params: { slug: string; docId: string }[] = [];
  for (const product of products) {
    for (const doc of product.documents || []) {
      params.push({ slug: product.slug, docId: doc.id });
    }
  }
  return params;
}

interface DocPageProps {
  params: Promise<{ slug: string; docId: string }>;
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug, docId } = await params;
  const product = getProductBySlug(slug);
  const doc = getProductDocument(slug, docId);

  if (!product || !doc) {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/product/${slug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-text-dim hover:text-accent"
      >
        &larr; {product.name}
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="text-2xl">📄</span>
        <div>
          <h2 className="text-xl font-semibold text-text">{doc.name}</h2>
          <p className="text-xs text-text-dim">
            Phase: <span className="font-medium capitalize text-accent">{doc.phase}</span>
          </p>
        </div>
      </div>

      <div className="card px-8 py-6">
        <MarkdownViewer content={doc.content} />
      </div>
    </div>
  );
}
