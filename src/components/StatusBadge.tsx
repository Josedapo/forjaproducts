interface StatusBadgeProps {
  status: string;
}

function getStatusStyle(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("advance")) return "bg-green/10 text-green";
  if (s.includes("pivot")) return "bg-yellow/10 text-yellow";
  if (s.includes("discard")) return "bg-red/10 text-red";
  return "bg-surface2 text-text-dim"; // Pending
}

function getStatusLabel(status: string): string {
  if (status.includes("ADVANCE")) return "ADVANCE";
  if (status.includes("PIVOT")) return "PIVOT";
  if (status.includes("DISCARD")) return "DISCARD";
  return "PENDING";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusStyle(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
