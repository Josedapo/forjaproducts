"use client";

import { useState, useMemo } from "react";
import type { Idea } from "@/lib/types";
import PainScore from "./PainScore";
import StatusBadge from "./StatusBadge";

interface IdeasTableProps {
  ideas: Idea[];
  title: string;
}

type SortField = "idea" | "painScore" | "status";
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
    <div className="mb-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-border bg-surface2 px-3 py-1.5 text-sm text-text outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-border bg-surface2 px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
          >
            <option value="all">Todos</option>
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
                Idea{sortIndicator("idea")}
              </th>
              <th className="px-4 py-3 font-medium text-text-dim">
                Descripcion
              </th>
              <th className="hidden px-4 py-3 font-medium text-text-dim lg:table-cell">
                Pain
              </th>
              <th
                className="cursor-pointer px-4 py-3 font-medium text-text-dim hover:text-text"
                onClick={() => toggleSort("painScore")}
              >
                Score{sortIndicator("painScore")}
              </th>
              <th className="hidden px-4 py-3 font-medium text-text-dim md:table-cell">
                Fuente
              </th>
              <th
                className="cursor-pointer px-4 py-3 font-medium text-text-dim hover:text-text"
                onClick={() => toggleSort("status")}
              >
                Estado{sortIndicator("status")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((idea) => (
              <>
                <tr
                  key={idea.idea}
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
                      <span className="font-medium text-text">{idea.idea}</span>
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
                  <td className="px-4 py-3">
                    <StatusBadge status={idea.status} />
                  </td>
                </tr>
                {idea.pivotHistory && expandedIdea === idea.idea && (
                  <tr key={`${idea.idea}-pivot`} className="border-b border-border">
                    <td colSpan={6} className="bg-surface2/30 px-8 py-3">
                      <p className="mb-2 text-xs font-medium text-text-dim">
                        Historial de pivotes
                      </p>
                      <div className="space-y-1.5">
                        {idea.pivotHistory.map((pivot, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="text-text-dim">{pivot.date}</span>
                            <span className="text-text">{pivot.idea}</span>
                            <StatusBadge status={pivot.status} />
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-text-dim"
                >
                  Sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
