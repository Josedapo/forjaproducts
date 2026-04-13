"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Idea } from "@/lib/types";
import PainScore from "./PainScore";
import StatusBadge from "./StatusBadge";
import ForjaScoreBadge from "./ForjaScoreBadge";
import IdeaDetailOverlay from "./IdeaDetailOverlay";

type SortField = "idea" | "painScore" | "added" | "status" | "forjaScore";
type SortDir = "asc" | "desc";
type LifecycleFilter = "all" | "pending" | "discard" | "pivot" | "advance";

interface IdeasTableProps {
  ideas: Idea[];
  title: string;
  latestAdded: string | null;
  productLookup?: Record<string, { name: string; slug: string }>;
  /** lowercased leaf idea name → its immediate predecessor in the pivot chain */
  predecessorByLeaf?: Record<string, { name: string; slug?: string }>;
  /** lowercased predecessor idea name → the leaf it pivoted into (used to redirect search hits) */
  leafByPredecessor?: Record<string, { name: string; slug?: string }>;
  defaultSortField?: SortField;
  defaultSortDir?: SortDir;
}

const LIFECYCLE_TABS: { key: LifecycleFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "discard", label: "Discard" },
  { key: "pivot", label: "Pivot" },
  { key: "advance", label: "Advance" },
];

function isPending(idea: Idea): boolean {
  return !idea.status.includes("ADVANCE") && !idea.status.includes("PIVOT") && !idea.status.includes("DISCARD");
}

function isDiscard(idea: Idea): boolean {
  return idea.status.includes("DISCARD");
}

function isPivot(idea: Idea): boolean {
  return idea.status.includes("PIVOT");
}

function isAdvance(idea: Idea): boolean {
  return idea.status.includes("ADVANCE");
}

export default function IdeasTable({
  ideas,
  title,
  latestAdded,
  productLookup = {},
  predecessorByLeaf = {},
  leafByPredecessor = {},
  defaultSortField = "painScore",
  defaultSortDir = "desc",
}: IdeasTableProps) {
  const [search, setSearch] = useState("");
  const [lifecycle, setLifecycle] = useState<LifecycleFilter>("all");
  const [sortField, setSortField] = useState<SortField>(defaultSortField);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir);
  const [detailIdea, setDetailIdea] = useState<Idea | null>(null);

  const linkedProductFor = (idea: Idea) =>
    productLookup[idea.idea.trim().toLowerCase()];

  const evolvedFromFor = (idea: Idea) =>
    predecessorByLeaf[idea.idea.trim().toLowerCase()];

  const lifecycleCounts = useMemo(() => {
    const counts: Record<LifecycleFilter, number> = {
      all: ideas.length,
      pending: 0,
      discard: 0,
      pivot: 0,
      advance: 0,
    };
    for (const i of ideas) {
      if (isPending(i)) counts.pending++;
      if (isDiscard(i)) counts.discard++;
      if (isPivot(i)) counts.pivot++;
      if (isAdvance(i)) counts.advance++;
    }
    return counts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas, productLookup]);

  const filtered = useMemo(() => {
    let result = ideas;

    if (search) {
      const q = search.toLowerCase();
      // Build the set of leaf names that match the query indirectly because
      // one of their hidden predecessors matches. This way searching for
      // "Netflix de libros" surfaces the Recomendador row even though
      // Netflix itself isn't in the visible list anymore.
      const indirectLeafKeys = new Set<string>();
      for (const [predKey, leaf] of Object.entries(leafByPredecessor)) {
        if (predKey.includes(q)) {
          indirectLeafKeys.add(leaf.name.trim().toLowerCase());
        }
      }
      result = result.filter(
        (i) =>
          i.idea.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.pain.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q) ||
          i.status.toLowerCase().includes(q) ||
          indirectLeafKeys.has(i.idea.trim().toLowerCase())
      );
    }

    if (lifecycle === "pending") {
      result = result.filter(isPending);
    } else if (lifecycle === "discard") {
      result = result.filter(isDiscard);
    } else if (lifecycle === "pivot") {
      result = result.filter(isPivot);
    } else if (lifecycle === "advance") {
      result = result.filter(isAdvance);
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "idea") {
        cmp = a.idea.localeCompare(b.idea);
      } else if (sortField === "painScore") {
        cmp = (a.painScore ?? -1) - (b.painScore ?? -1);
      } else if (sortField === "added") {
        cmp = (a.added ?? "").localeCompare(b.added ?? "");
      } else if (sortField === "status") {
        cmp = a.status.localeCompare(b.status);
      } else if (sortField === "forjaScore") {
        cmp =
          (a.screeningData?.forjaScore?.total ?? -1) -
          (b.screeningData?.forjaScore?.total ?? -1);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideas, search, lifecycle, sortField, sortDir, productLookup, leafByPredecessor]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "painScore" || field === "forjaScore" ? "desc" : "asc");
    }
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 pb-3">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-border bg-surface2 px-3 py-1.5 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex flex-wrap gap-1 px-5 pb-4">
        {LIFECYCLE_TABS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setLifecycle(chip.key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              lifecycle === chip.key
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface2 text-text-dim hover:text-text"
            }`}
          >
            {chip.label}
            <span className={`ml-1.5 ${lifecycle === chip.key ? "text-accent/70" : "text-text-dim/60"}`}>
              {lifecycleCounts[chip.key]}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface2 text-left">
              <th
                className="cursor-pointer px-4 py-3 font-medium text-text-dim hover:text-text"
                onClick={() => toggleSort("idea")}
              >
                <span className="whitespace-nowrap">Idea{sortIndicator("idea")}</span>
              </th>
              <th className="px-4 py-3 font-medium text-text-dim">
                Description
              </th>
              <th className="hidden px-4 py-3 font-medium text-text-dim lg:table-cell">
                Pain
              </th>
              <th
                className="cursor-pointer px-4 py-3 font-medium text-text-dim hover:text-text"
                onClick={() => toggleSort("painScore")}
              >
                <span className="whitespace-nowrap">Score{sortIndicator("painScore")}</span>
              </th>
              <th className="hidden px-4 py-3 font-medium text-text-dim md:table-cell">
                Source
              </th>
              <th
                className="hidden cursor-pointer px-4 py-3 font-medium text-text-dim hover:text-text md:table-cell"
                onClick={() => toggleSort("added")}
              >
                <span className="whitespace-nowrap">Added{sortIndicator("added")}</span>
              </th>
              <th
                className="cursor-pointer px-4 py-3 font-medium text-text-dim hover:text-text"
                onClick={() => toggleSort("status")}
              >
                <span className="whitespace-nowrap">Status{sortIndicator("status")}</span>
              </th>
              <th
                className="cursor-pointer px-4 py-3 font-medium text-text-dim hover:text-text"
                onClick={() => toggleSort("forjaScore")}
              >
                <span className="whitespace-nowrap">Forja{sortIndicator("forjaScore")}</span>
              </th>
              <th className="w-8 px-2 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((idea) => {
              const linked = linkedProductFor(idea);
              const evolvedFrom = evolvedFromFor(idea);
              return (
                <tr
                  key={idea.idea}
                  className="border-b border-border last:border-b-0 hover:bg-surface2/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {idea.slug ? (
                        <Link
                          href={`/idea/${idea.slug}`}
                          className="font-medium text-accent hover:underline"
                        >
                          {idea.idea}
                        </Link>
                      ) : (
                        <span className="font-medium text-text">{idea.idea}</span>
                      )}
                      {linked && (
                        <Link
                          href={`/product/${linked.slug}`}
                          className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent/20"
                        >
                          → {linked.name}
                        </Link>
                      )}
                      {evolvedFrom && (
                        evolvedFrom.slug ? (
                          <Link
                            href={`/idea/${evolvedFrom.slug}`}
                            title={`Evolved from: ${evolvedFrom.name}`}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface2 px-2 py-0.5 text-[11px] font-medium text-text-dim hover:border-text-dim hover:text-text"
                          >
                            ↩ from: {evolvedFrom.name}
                          </Link>
                        ) : (
                          <span
                            title={`Evolved from: ${evolvedFrom.name}`}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-surface2 px-2 py-0.5 text-[11px] font-medium text-text-dim"
                          >
                            ↩ from: {evolvedFrom.name}
                          </span>
                        )
                      )}
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-text-dim">
                    <span className="line-clamp-2">{idea.description}</span>
                  </td>
                  <td className="hidden max-w-xs px-4 py-3 text-text-dim lg:table-cell">
                    <span className="line-clamp-2">{idea.pain}</span>
                  </td>
                  <td className="px-4 py-3">
                    <PainScore score={idea.painScore} />
                  </td>
                  <td className="hidden px-4 py-3 text-text-dim md:table-cell">
                    <span className="line-clamp-1">{idea.source}</span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <span className="whitespace-nowrap text-text-dim">{idea.added ?? "—"}</span>
                      {idea.added && idea.added === latestAdded && (
                        <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                          new
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={idea.status}
                      alignment={idea.screeningData?.forjaScore?.alignment}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {idea.screeningData?.forjaScore ? (
                      <ForjaScoreBadge score={idea.screeningData.forjaScore.total} />
                    ) : (
                      <span className="text-text-dim">—</span>
                    )}
                  </td>
                  <td className="w-8 px-2 py-3">
                    <button
                      title="View details"
                      onClick={() => setDetailIdea(idea)}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-text-dim/60 transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <circle cx="7" cy="7" r="6" />
                        <path d="M7 6.5V10" />
                        <circle cx="7" cy="4.5" r="0.5" fill="currentColor" stroke="none" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-sm text-text-dim"
                >
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {detailIdea && (
        <IdeaDetailOverlay idea={detailIdea} onClose={() => setDetailIdea(null)} />
      )}
    </div>
  );
}
