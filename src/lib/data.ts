import { readFileSync } from "fs";
import { join } from "path";
import type { IdeasData, ProductsData, Product } from "./types";

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
