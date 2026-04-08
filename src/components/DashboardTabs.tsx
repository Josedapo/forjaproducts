"use client";

import { useState } from "react";
import type { Product, Idea } from "@/lib/types";
import ProductsTable from "./ProductsTable";
import IdeasTable from "./IdeasTable";

interface DashboardTabsProps {
  products: Product[];
  ideas: Idea[];
  productLookup: Record<string, { name: string; slug: string }>;
  predecessorByLeaf: Record<string, { name: string; slug?: string }>;
  leafByPredecessor: Record<string, { name: string; slug?: string }>;
  latestAdded: string | null;
}

const TABS = [
  { key: "products", label: "Products" },
  { key: "ideas", label: "Ideas" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function DashboardTabs({
  products,
  ideas,
  productLookup,
  predecessorByLeaf,
  leafByPredecessor,
  latestAdded,
}: DashboardTabsProps) {
  const [active, setActive] = useState<TabKey>("products");

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-xl bg-surface2 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
              active === tab.key
                ? "bg-surface text-accent shadow-sm"
                : "text-text-dim hover:text-text"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 text-xs ${
                active === tab.key ? "text-accent/70" : "text-text-dim/60"
              }`}
            >
              {tab.key === "products" ? products.length : ideas.length}
            </span>
          </button>
        ))}
      </div>

      {active === "products" && (
        <div className="card overflow-hidden">
          <ProductsTable products={products} />
        </div>
      )}

      {active === "ideas" && (
        <div className="card overflow-hidden">
          <IdeasTable
            ideas={ideas}
            title="Ideas"
            latestAdded={latestAdded}
            productLookup={productLookup}
            predecessorByLeaf={predecessorByLeaf}
            leafByPredecessor={leafByPredecessor}
            defaultSortField="forjaScore"
            defaultSortDir="desc"
          />
        </div>
      )}
    </div>
  );
}
