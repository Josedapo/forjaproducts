import Link from "next/link";
import type { Product } from "@/lib/types";
import PhaseBadge from "./PhaseBadge";

interface ProductsTableProps {
  products: Product[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface2 text-left">
            <th className="px-4 py-3 font-medium text-text-dim">Nombre</th>
            <th className="px-4 py-3 font-medium text-text-dim">Fase</th>
            <th className="px-4 py-3 font-medium text-text-dim">Idea origen</th>
            <th className="px-4 py-3 font-medium text-text-dim">URL</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product.slug}
              className="border-b border-border last:border-b-0 hover:bg-surface2/50"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/product/${product.slug}`}
                  className="font-medium text-accent hover:underline"
                >
                  {product.name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <PhaseBadge phase={product.phase} />
              </td>
              <td className="px-4 py-3 text-text-dim">
                {product.origin.timeline[product.origin.timeline.length - 1]?.idea ?? "--"}
              </td>
              <td className="px-4 py-3">
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {product.url}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
