"use client";

import type { Idea } from "@/lib/types";
import PainScore from "./PainScore";
import StatusBadge from "./StatusBadge";
import ForjaScoreBadge from "./ForjaScoreBadge";
import Link from "next/link";

interface IdeaDetailOverlayProps {
  idea: Idea;
  onClose: () => void;
}

export default function IdeaDetailOverlay({ idea, onClose }: IdeaDetailOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="card relative max-h-[85vh] w-full max-w-lg overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-surface px-6 pt-5 pb-4" style={{ borderRadius: "12px 12px 0 0" }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {idea.slug ? (
                <Link
                  href={`/idea/${idea.slug}`}
                  className="text-lg font-semibold text-accent hover:underline"
                >
                  {idea.idea}
                </Link>
              ) : (
                <h3 className="text-lg font-semibold text-text">{idea.idea}</h3>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge
                status={idea.status}
                alignment={idea.screeningData?.forjaScore?.alignment}
              />
              <PainScore score={idea.painScore} />
              {idea.screeningData?.forjaScore && (
                <ForjaScoreBadge score={idea.screeningData.forjaScore.total} />
              )}
              {idea.added && (
                <span className="text-xs text-text-dim">{idea.added}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-dim transition-colors hover:bg-surface2 hover:text-text"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Description */}
          <Section label="Description">
            <p className="text-sm leading-relaxed text-text">{idea.description}</p>
          </Section>

          {/* Pain */}
          <Section label="Pain">
            <p className="text-sm leading-relaxed text-text">{idea.pain}</p>
          </Section>

          {/* Source */}
          <Section label="Source">
            <p className="text-sm text-text">{idea.source}</p>
          </Section>

          {/* Pivot History */}
          {idea.pivotHistory && idea.pivotHistory.length > 0 && (
            <Section label="Pivot history">
              <div className="space-y-2">
                {idea.pivotHistory.map((pivot, i) => {
                  const pivotSlug = pivot.reportUrl
                    ? pivot.reportUrl.replace("idea-screening-", "").replace(".html", "")
                    : null;
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-text-dim">{pivot.date}</span>
                      {pivotSlug ? (
                        <Link href={`/idea/${pivotSlug}`} className="text-accent hover:underline">
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
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">{label}</p>
      {children}
    </div>
  );
}
