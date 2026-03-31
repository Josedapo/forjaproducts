interface StatusBadgeProps {
  status: string;
  size?: "default" | "large";
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

export default function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const sizeClass = size === "large"
    ? "px-4 py-1.5 text-sm font-bold tracking-wide"
    : "px-2.5 py-0.5 text-xs font-medium";

  return (
    <span
      className={`inline-block rounded-full ${sizeClass} ${getStatusStyle(status, size)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
