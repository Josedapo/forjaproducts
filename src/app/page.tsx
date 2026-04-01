import { getFilteredIdeas, getAllProducts } from "@/lib/data";
import StatsBar from "@/components/StatsBar";
import DashboardTabs from "@/components/DashboardTabs";

export default function DashboardPage() {
  const { candidates, backlog } = getFilteredIdeas();
  const products = getAllProducts();

  const allIdeas = [...candidates, ...backlog];
  const allDates = allIdeas.map((i) => i.added).filter(Boolean) as string[];
  const latestAdded = allDates.length > 0 ? allDates.sort().at(-1)! : null;
  const advanceCount = allIdeas.filter((i) =>
    i.status.includes("ADVANCE")
  ).length;
  const pendingCount = allIdeas.filter(
    (i) => !i.status.includes("ADVANCE") && !i.status.includes("PIVOT") && !i.status.includes("DISCARD")
  ).length;
  const scoredIdeas = allIdeas.filter((i) => i.painScore !== null);
  const avgPain =
    scoredIdeas.length > 0
      ? (
          scoredIdeas.reduce((sum, i) => sum + (i.painScore ?? 0), 0) /
          scoredIdeas.length
        ).toFixed(1)
      : "--";

  return (
    <div>
      <StatsBar
        products={products.length}
        totalIdeas={allIdeas.length}
        advance={advanceCount}
        pending={pendingCount}
        avgPain={avgPain}
      />
      <DashboardTabs
        products={products}
        candidates={candidates}
        backlog={backlog}
        latestAdded={latestAdded}
      />
    </div>
  );
}
