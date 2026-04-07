import type { VerdictAlignment } from "@/lib/types";

interface StatusBadgeProps {
  status: string;
  size?: "default" | "large";
  alignment?: VerdictAlignment;
}

function getStatusStyle(status: string, size: string): string {
  const s = status.toLowerCase();
  if (size === "large") {
    if (s.includes("advance")) return "bg-green text-white";
    if (s.includes("pivot")) return "bg-yellow text-white";
    if (s.includes("discard")) return "bg-red text-white";
    return "bg-surface2 text-text-dim";
  }
  if (s.includes("advance")) return "bg-green/10 text-green";
  if (s.includes("pivot")) return "bg-yellow/10 text-yellow";
  if (s.includes("discard")) return "bg-red/10 text-red";
  return "bg-surface2 text-text-dim";
}

function getStatusLabel(status: string): string {
  if (status.includes("ADVANCE")) return "ADVANCE";
  if (status.includes("PIVOT")) return "PIVOT";
  if (status.includes("DISCARD")) return "DISCARD";
  return "PENDING";
}

function alignmentTooltip(alignment: VerdictAlignment): string {
  if (alignment === "divergent-optimistic") {
    return "Forja Score suggests ADVANCE but verdict is DISCARD. Worth reviewing.";
  }
  if (alignment === "divergent-pessimistic") {
    return "Forja Score suggests DISCARD but verdict is ADVANCE. Strong conviction call — monitor closely.";
  }
  return "";
}

export default function StatusBadge({ status, size = "default", alignment }: StatusBadgeProps) {
  const sizeClass = size === "large"
    ? "px-4 py-1.5 text-sm font-bold tracking-wide"
    : "px-2.5 py-0.5 text-xs font-medium";

  const isDivergent = alignment && alignment !== "aligned";
  const dotSize = size === "large" ? "h-2.5 w-2.5" : "h-2 w-2";

  return (
    <span className="relative inline-block">
      <span
        className={`inline-block rounded-full ${sizeClass} ${getStatusStyle(status, size)}`}
      >
        {getStatusLabel(status)}
      </span>
      {isDivergent && (
        <span
          title={alignmentTooltip(alignment)}
          className={`absolute -top-0.5 -right-0.5 ${dotSize} rounded-full bg-red border-2 border-surface`}
          aria-label="Score and verdict diverge"
        />
      )}
    </span>
  );
}
