import { getAllIdeas, getAllProducts, getProductLookupByIdeaName, buildPivotIndex } from "@/lib/data";
import StatsBar from "@/components/StatsBar";
import DashboardTabs from "@/components/DashboardTabs";

export default function DashboardPage() {
  const ideas = getAllIdeas();
  const products = getAllProducts();
  const productLookup = getProductLookupByIdeaName();
  const pivotIndex = buildPivotIndex();

  const allDates = ideas.map((i) => i.added).filter(Boolean) as string[];
  const latestAdded = allDates.length > 0 ? allDates.sort().at(-1)! : null;
  const advanceCount = ideas.filter((i) => i.status.includes("ADVANCE")).length;
  const pivotCount = ideas.filter((i) => i.status.includes("PIVOT")).length;
  const discardCount = ideas.filter((i) => i.status.includes("DISCARD")).length;
  const pendingCount = ideas.filter(
    (i) => !i.status.includes("ADVANCE") && !i.status.includes("PIVOT") && !i.status.includes("DISCARD")
  ).length;
  const scoredIdeas = ideas.filter((i) => i.painScore !== null);
  const avgPain =
    scoredIdeas.length > 0
      ? (
          scoredIdeas.reduce((sum, i) => sum + (i.painScore ?? 0), 0) /
          scoredIdeas.length
        ).toFixed(1)
      : "--";

  const ideasWithForjaScore = ideas.filter((i) => i.screeningData?.forjaScore);
  const avgForjaScore =
    ideasWithForjaScore.length > 0
      ? Math.round(
          ideasWithForjaScore.reduce(
            (sum, i) => sum + (i.screeningData!.forjaScore!.total ?? 0),
            0
          ) / ideasWithForjaScore.length
        ).toString()
      : "--";

  // Serialize the product lookup as a plain object for the client component
  const productLookupObj: Record<string, { name: string; slug: string }> = {};
  for (const [key, p] of productLookup.entries()) {
    productLookupObj[key] = { name: p.name, slug: p.slug };
  }

  // Serialize the pivot index for the client component. Maps cannot be passed
  // across the server/client boundary as-is, so flatten to plain objects.
  const predecessorByLeafObj: Record<string, { name: string; slug?: string }> = {};
  for (const [key, pred] of pivotIndex.predecessorByLeaf.entries()) {
    predecessorByLeafObj[key] = pred;
  }
  const leafByPredecessorObj: Record<string, { name: string; slug?: string }> = {};
  for (const [key, leaf] of pivotIndex.leafByPredecessor.entries()) {
    leafByPredecessorObj[key] = leaf;
  }

  return (
    <div>
      <StatsBar
        products={products.length}
        totalIdeas={ideas.length}
        pending={pendingCount}
        discard={discardCount}
        pivot={pivotCount}
        advance={advanceCount}
        avgPain={avgPain}
        avgForjaScore={avgForjaScore}
      />
      <DashboardTabs
        products={products}
        ideas={ideas}
        productLookup={productLookupObj}
        predecessorByLeaf={predecessorByLeafObj}
        leafByPredecessor={leafByPredecessorObj}
        latestAdded={latestAdded}
      />
    </div>
  );
}
