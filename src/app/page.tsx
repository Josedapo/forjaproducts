import { getIdeasData, getAllProducts } from "@/lib/data";
import StatsBar from "@/components/StatsBar";
import ProductsTable from "@/components/ProductsTable";
import IdeasTable from "@/components/IdeasTable";

export default function DashboardPage() {
  const { candidates, backlog } = getIdeasData();
  const products = getAllProducts();

  const allIdeas = [...candidates, ...backlog];
  const advanceCount = allIdeas.filter((i) =>
    i.status.includes("ADVANCE")
  ).length;
  const pendingCount = allIdeas.filter((i) => i.status === "Pending").length;
  const scoredIdeas = allIdeas.filter((i) => i.painScore !== null);
  const avgPain =
    scoredIdeas.length > 0
      ? (
          scoredIdeas.reduce((sum, i) => sum + (i.painScore ?? 0), 0) /
          scoredIdeas.length
        ).toFixed(1)
      : "--";

  const stats = [
    { label: "Productos", value: products.length },
    { label: "Ideas totales", value: allIdeas.length },
    { label: "Advance", value: advanceCount },
    { label: "Pendientes", value: pendingCount },
    { label: "Pain medio", value: avgPain },
  ];

  return (
    <div>
      <StatsBar stats={stats} />

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-text">Productos</h2>
        <ProductsTable products={products} />
      </section>

      <IdeasTable ideas={candidates} title="Candidatas" />
      <IdeasTable ideas={backlog} title="Backlog" />
    </div>
  );
}
