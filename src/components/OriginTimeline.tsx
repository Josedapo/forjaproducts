import Link from "next/link";
import type { TimelineItem } from "@/lib/types";
import StatusBadge from "./StatusBadge";

interface OriginTimelineProps {
  timeline: TimelineItem[];
  ideaSlugMap?: Record<string, string>;
}

export default function OriginTimeline({
  timeline,
  ideaSlugMap,
}: OriginTimelineProps) {
  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {timeline.map((item, i) => {
          const slug = ideaSlugMap?.[item.idea.toLowerCase()];

          return (
            <div key={i} className="relative flex items-start gap-3">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-1.5 h-[11px] w-[11px] rounded-full border-2 ${
                  i === timeline.length - 1
                    ? "border-accent bg-accent"
                    : "border-border bg-surface"
                }`}
              />
              <div className="flex-1">
                {slug ? (
                  <Link
                    href={`/idea/${slug}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {item.idea}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-text">{item.idea}</p>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-text-dim">{item.date}</span>
                  <StatusBadge
                    status={
                      item.verdict === "ADVANCE"
                        ? "Evaluated - ADVANCE"
                        : item.verdict === "PIVOT"
                          ? "Evaluated - PIVOT"
                          : item.verdict
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
