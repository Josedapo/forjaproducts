import { readFileSync } from "fs";
import { join } from "path";
import type { Idea, IdeasData, ProductsData, Product, ProductDocument, ScreenedIdea, ScreeningData } from "./types";
import { calculateForjaScore } from "./forjaScore";

const dataDir = join(process.cwd(), "data");

let ideasCache: IdeasData | null = null;
let productsCache: ProductsData | null = null;

/**
 * Ensure every screening payload has a forjaScore.
 * If the JSON already includes one (written by /forja-dashboard from the
 * markdown source of truth), keep it. Otherwise compute on the fly so legacy
 * ideas never break the UI.
 */
function ensureForjaScore(screening: ScreeningData): ScreeningData {
  if (screening.forjaScore) return screening;
  return { ...screening, forjaScore: calculateForjaScore(screening) };
}

export function getIdeasData(): IdeasData {
  if (!ideasCache) {
    const raw = readFileSync(join(dataDir, "ideas.json"), "utf-8");
    const parsed = JSON.parse(raw) as IdeasData;

    // Hydrate forjaScore on every screening payload, both in candidates/backlog
    // and in the dedicated screenedIdeas list.
    const hydrateIdea = (i: Idea): Idea =>
      i.screeningData ? { ...i, screeningData: ensureForjaScore(i.screeningData) } : i;

    ideasCache = {
      candidates: parsed.candidates.map(hydrateIdea),
      backlog: parsed.backlog.map(hydrateIdea),
      screenedIdeas: (parsed.screenedIdeas || []).map((s) => ({
        ...s,
        screeningData: ensureForjaScore(s.screeningData),
      })),
    };
  }
  return ideasCache;
}

/**
 * Returns ideas filtered to exclude those that have become products.
 * Ideas linked to a product are historical data shown in the product dashboard,
 * not in the ideas tables.
 */
export function getFilteredIdeas(): { candidates: Idea[]; backlog: Idea[] } {
  const { candidates, backlog } = getIdeasData();
  const products = getAllProducts();

  // Collect all idea names linked to products (from origin timelines)
  const productIdeaNames = new Set<string>();
  for (const product of products) {
    for (const item of product.origin.timeline) {
      productIdeaNames.add(item.idea.toLowerCase());
    }
  }

  const isLinkedToProduct = (idea: Idea) =>
    productIdeaNames.has(idea.idea.toLowerCase());

  return {
    candidates: candidates.filter((i) => !isLinkedToProduct(i)),
    backlog: backlog.filter((i) => !isLinkedToProduct(i)),
  };
}

export function getProductsData(): ProductsData {
  if (!productsCache) {
    const raw = readFileSync(join(dataDir, "products.json"), "utf-8");
    productsCache = JSON.parse(raw) as ProductsData;
  }
  return productsCache;
}

export function getAllProducts(): Product[] {
  return getProductsData().products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return getAllProducts().find((p) => p.slug === slug);
}

export function getProductDocument(productSlug: string, docId: string): ProductDocument | undefined {
  const product = getProductBySlug(productSlug);
  return product?.documents?.find((d) => d.id === docId);
}

export function getScreenedIdeas(): ScreenedIdea[] {
  return getIdeasData().screenedIdeas || [];
}

export function getScreenedIdea(slug: string): ScreenedIdea | undefined {
  return getScreenedIdeas().find((i) => i.slug === slug);
}

export function getProductByIdeaSlug(ideaSlug: string, ideaName?: string): Product | undefined {
  return getAllProducts().find((p) =>
    p.origin.ideaSlug === ideaSlug ||
    (ideaName && p.origin.timeline.some((t) => t.idea.toLowerCase() === ideaName.toLowerCase()))
  );
}
