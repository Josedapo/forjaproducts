import { readFileSync } from "fs";
import { join } from "path";
import type { Idea, IdeasData, ProductsData, Product, ProductDocument, ScreenedIdea } from "./types";

const dataDir = join(process.cwd(), "data");

let ideasCache: IdeasData | null = null;
let productsCache: ProductsData | null = null;

export function getIdeasData(): IdeasData {
  if (!ideasCache) {
    const raw = readFileSync(join(dataDir, "ideas.json"), "utf-8");
    ideasCache = JSON.parse(raw) as IdeasData;
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
