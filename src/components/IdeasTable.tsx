"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import type { Idea } from "@/lib/types";
import PainScore from "./PainScore";
import StatusBadge from "./StatusBadge";

interface IdeasTableProps {
  ideas: Idea[];
  title: string;
}

type SortField = "idea" | "painScore" | "added" | "status";
type SortDir = "asc" | "desc";

export default function IdeasTable({ ideas, title }: IdeasTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("painScore");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);

  const statuses = useMemo(() => {
    const set = new Set(ideas.map((i) => i.status));
    return Array.from(set).sort();
  }, [ideas]);

  const latestAdded = useMemo(() => {
    const dates = ideas.map((i) => i.added).filter(Boolean) as string[];
    if (dates.length === 0) return null;
    return dates.sort().at(-1)!;
  }, [ideas]);

  const filtered = useMemo(() => {
    let result = ideas;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.idea.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.pain.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
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
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [ideas, search, statusFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "painScore" ? "desc" : "asc");
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
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-border bg-surface2 px-3 py-1.5 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-border bg-surface2 px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
          >
            <option value="all">All</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
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
            </tr>
          </thead>
          <tbody>
            {filtered.map((idea) => (
              <React.Fragment key={idea.idea}>
                <tr
                  className={`border-b border-border last:border-b-0 hover:bg-surface2/50 ${
                    idea.pivotHistory ? "cursor-pointer" : ""
                  }`}
                  onClick={() => {
                    if (idea.pivotHistory) {
                      setExpandedIdea(
                        expandedIdea === idea.idea ? null : idea.idea
                      );
                    }
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {idea.pivotHistory && (
                        <span className="text-xs text-text-dim">
                          {expandedIdea === idea.idea ? "▼" : "▶"}
                        </span>
                      )}
                      {idea.slug ? (
                        <Link
                          href={`/idea/${idea.slug}`}
                          className="font-medium text-accent hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {idea.idea}
                        </Link>
                      ) : (
                        <span className="font-medium text-text">{idea.idea}</span>
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
                    <StatusBadge status={idea.status} />
                  </td>
                </tr>
                {idea.pivotHistory && expandedIdea === idea.idea && (
                  <tr key={`${idea.idea}-pivot`} className="border-b border-border">
                    <td colSpan={7} className="bg-surface2/30 px-8 py-3">
                      <p className="mb-2 text-xs font-medium text-text-dim">
                        Pivot history
                      </p>
                      <div className="space-y-1.5">
                        {idea.pivotHistory.map((pivot, i) => {
                          const pivotSlug = pivot.reportUrl
                            ? pivot.reportUrl.replace("idea-screening-", "").replace(".html", "")
                            : null;
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="text-text-dim">{pivot.date}</span>
                              {pivotSlug ? (
                                <Link
                                  href={`/idea/${pivotSlug}`}
                                  className="text-accent hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {pivot.idea}
                                </Link>
                              ) : (
                                <span className="text-text">{pivot.idea}</span>
                              )}
                              <StatusBadge status={pivot.status} />
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-text-dim"
                >
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
