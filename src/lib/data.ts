import { readFileSync } from "fs";
import { join } from "path";
import type { Idea, IdeasData, PivotHistoryItem, ProductsData, Product, ProductDocument, ScreenedIdea, ScreeningData } from "./types";
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

/**
 * Look up the pivot's original screened idea by name (case-insensitive) and
 * propagate its slug, forjaScore total, and alignment so the dashboard can
 * link and badge the pivot row even when the JSON didn't carry those fields.
 */
function enrichPivot(
  pivot: PivotHistoryItem,
  screenedByName: Map<string, ScreenedIdea>
): PivotHistoryItem {
  if (pivot.slug && pivot.forjaScore != null) return pivot;
  const match = screenedByName.get(pivot.idea.trim().toLowerCase());
  if (!match) return pivot;
  const enriched = ensureForjaScore(match.screeningData);
  return {
    ...pivot,
    slug: pivot.slug ?? match.slug,
    forjaScore: pivot.forjaScore ?? enriched.forjaScore?.total,
    alignment: pivot.alignment ?? enriched.forjaScore?.alignment,
  };
}

export function getIdeasData(): IdeasData {
  if (!ideasCache) {
    const raw = readFileSync(join(dataDir, "ideas.json"), "utf-8");
    const parsed = JSON.parse(raw) as IdeasData;

    // Build name → screenedIdea index for pivot history enrichment, and a
    // slug → screenedIdea index so idea rows can pull their screeningData
    // from the screenedIdeas array instead of duplicating it inline.
    const screenedByName = new Map<string, ScreenedIdea>();
    const screenedBySlug = new Map<string, ScreenedIdea>();
    for (const s of parsed.screenedIdeas || []) {
      screenedByName.set(s.idea.trim().toLowerCase(), s);
      screenedBySlug.set(s.slug, s);
    }

    const hydrateIdea = (i: Idea): Idea => {
      // Prefer inline screeningData (legacy duplication pattern); fall back
      // to lookup by slug in screenedIdeas so new ideas don't need to repeat
      // the full screening payload in two places.
      let rawScreening = i.screeningData;
      if (!rawScreening && i.slug) {
        const match = screenedBySlug.get(i.slug);
        if (match) rawScreening = match.screeningData;
      }
      const screening = rawScreening ? ensureForjaScore(rawScreening) : undefined;
      const pivots = i.pivotHistory
        ? i.pivotHistory.map((p) => enrichPivot(p, screenedByName))
        : i.pivotHistory;
      return { ...i, screeningData: screening, pivotHistory: pivots };
    };

    ideasCache = {
      ideas: parsed.ideas.map(hydrateIdea),
      screenedIdeas: (parsed.screenedIdeas || []).map((s) => ({
        ...s,
        screeningData: ensureForjaScore(s.screeningData),
      })),
    };
  }
  return ideasCache;
}

/**
 * Internal: build the unified pool of ideas BEFORE the predecessor collapse.
 * Includes raw `ideas` array rows + ghost rows synthesized from `screenedIdeas`
 * that have no matching slug in the main array (e.g. pivot predecessors).
 *
 * Used by getAllIdeas() (which then collapses chains by hiding predecessors)
 * AND by buildPivotIndex() (which needs to see the full graph including
 * predecessors to build the chain links).
 */
function getAllIdeasRaw(): Idea[] {
  const { ideas, screenedIdeas } = getIdeasData();

  const ideasBySlug = new Set<string>();
  for (const idea of ideas) {
    if (idea.slug) ideasBySlug.add(idea.slug);
  }

  const ghostRows: Idea[] = [];
  for (const screened of screenedIdeas) {
    if (ideasBySlug.has(screened.slug)) continue;
    const sd = screened.screeningData;
    ghostRows.push({
      idea: screened.idea,
      slug: screened.slug,
      description: sd.idea.what,
      pain: sd.idea.problem,
      source: "From screening",
      painScore: null,
      added: sd.evaluatedDate,
      status: `Evaluated - ${sd.verdict}`,
      reportUrl: null,
      pivotHistory: null,
      screeningData: sd,
    });
  }

  return [...ideas, ...ghostRows];
}

export interface PivotPredecessor {
  name: string;
  slug?: string;
}

export interface PivotIndex {
  /** lowercased leaf idea name → its immediate predecessor (most recent) */
  predecessorByLeaf: Map<string, PivotPredecessor>;
  /** set of lowercased idea names that ARE predecessors (will be hidden from the listing) */
  predecessorNames: Set<string>;
  /** lowercased predecessor name → the leaf it pivoted into (used to redirect search hits) */
  leafByPredecessor: Map<string, PivotPredecessor>;
}

/**
 * Build the pivot graph from the two existing sources of pivot information:
 *
 * 1. `pivotHistory` field on any idea — entries are predecessors of that idea
 * 2. Pairs in `product.origin.timeline` — every item except the last is a
 *    predecessor of the next item in the chain
 *
 * Hopping convention for chains of length > 2: each leaf only points to its
 * IMMEDIATE predecessor. Longer chains are navigated by hopping (clicking
 * the pill on a leaf takes you to the predecessor, which itself shows its
 * predecessor's pill on the detail page).
 */
export function buildPivotIndex(): PivotIndex {
  const predecessorByLeaf = new Map<string, PivotPredecessor>();
  const predecessorNames = new Set<string>();
  const leafByPredecessor = new Map<string, PivotPredecessor>();

  const findSlugForName = (name: string): string | undefined => {
    const key = name.trim().toLowerCase();
    for (const s of getScreenedIdeas()) {
      if (s.idea.trim().toLowerCase() === key) return s.slug;
    }
    return undefined;
  };

  // Source 1: pivotHistory on raw ideas (e.g. seo-content-strategy-auditor)
  for (const idea of getAllIdeasRaw()) {
    if (!idea.pivotHistory || idea.pivotHistory.length === 0) continue;
    const leafKey = idea.idea.trim().toLowerCase();
    const immediatePred = idea.pivotHistory[idea.pivotHistory.length - 1];
    predecessorByLeaf.set(leafKey, {
      name: immediatePred.idea,
      slug: immediatePred.slug ?? findSlugForName(immediatePred.idea),
    });
    for (const p of idea.pivotHistory) {
      const predKey = p.idea.trim().toLowerCase();
      predecessorNames.add(predKey);
      leafByPredecessor.set(predKey, {
        name: idea.idea,
        slug: idea.slug,
      });
    }
  }

  // Source 2: product origin.timeline pairs (e.g. Bookata: Netflix → Recomendador)
  for (const product of getAllProducts()) {
    const timeline = product.origin.timeline;
    if (timeline.length < 2) continue;
    const leafItem = timeline[timeline.length - 1];
    const leafKey = leafItem.idea.trim().toLowerCase();
    const immediatePred = timeline[timeline.length - 2];
    predecessorByLeaf.set(leafKey, {
      name: immediatePred.idea,
      slug: findSlugForName(immediatePred.idea),
    });
    for (let i = 0; i < timeline.length - 1; i++) {
      const predKey = timeline[i].idea.trim().toLowerCase();
      predecessorNames.add(predKey);
      leafByPredecessor.set(predKey, {
        name: leafItem.idea,
        slug: findSlugForName(leafItem.idea),
      });
    }
  }

  return { predecessorByLeaf, predecessorNames, leafByPredecessor };
}

/**
 * Returns the unified list of ideas with pivot chains COLLAPSED to their leaf.
 *
 * - Each pivot chain (e.g. Netflix de libros infantiles → Recomendador de libros
 *   infantiles tipo Netflix) renders as a single row: the leaf (most recent
 *   iteration). Predecessors are hidden from the listing but stay reachable
 *   via the `↩ Evolved from: X` pill rendered on the leaf row.
 * - Product-linked ideas remain visible with their `→ Product Name` pill.
 * - Ghost rows from `screenedIdeas` (pivot predecessors and product-linked
 *   ideas without canonical rows) are still synthesized so leaves are never
 *   missing.
 */
export function getAllIdeas(): Idea[] {
  const raw = getAllIdeasRaw();
  const { predecessorNames } = buildPivotIndex();
  return raw.filter((idea) => !predecessorNames.has(idea.idea.trim().toLowerCase()));
}

/**
 * Returns a Map<lowercase idea name, Product> for O(1) lookups when
 * rendering the "→ Product Name" pill in the ideas table.
 *
 * Match rule: any idea name appearing in any product's origin.timeline
 * resolves to that product (case-insensitive).
 */
export function getProductLookupByIdeaName(): Map<string, Product> {
  const lookup = new Map<string, Product>();
  for (const product of getAllProducts()) {
    for (const item of product.origin.timeline) {
      lookup.set(item.idea.trim().toLowerCase(), product);
    }
  }
  return lookup;
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

/**
 * Index screened ideas by lowercase idea name. Used by OriginTimeline (and
 * any other view that receives only an idea name) to look up slug, Forja
 * Score and verdict alignment in O(1).
 */
export function getScreenedIndex(): {
  slugByName: Record<string, string>;
  scoreByName: Record<string, { score: number; alignment: import("./types").VerdictAlignment }>;
} {
  const slugByName: Record<string, string> = {};
  const scoreByName: Record<string, { score: number; alignment: import("./types").VerdictAlignment }> = {};
  for (const si of getScreenedIdeas()) {
    const key = si.idea.trim().toLowerCase();
    slugByName[key] = si.slug;
    const score = si.screeningData.forjaScore;
    if (score) {
      scoreByName[key] = { score: score.total, alignment: score.alignment };
    }
  }
  return { slugByName, scoreByName };
}

export function getProductByIdeaSlug(ideaSlug: string, ideaName?: string): Product | undefined {
  return getAllProducts().find((p) =>
    p.origin.ideaSlug === ideaSlug ||
    (ideaName && p.origin.timeline.some((t) => t.idea.toLowerCase() === ideaName.toLowerCase()))
  );
}
