interface PhaseBadgeProps {
  phase: string;
}

function getPhaseStyle(phase: string): string {
  switch (phase.toLowerCase()) {
    case "shape":
      return "bg-green/10 text-green";
    case "build":
      return "bg-blue/10 text-blue";
    case "validate":
      return "bg-yellow/10 text-yellow";
    case "live":
      return "bg-green/10 text-green";
    default:
      return "bg-surface2 text-text-dim";
  }
}

export default function PhaseBadge({ phase }: PhaseBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getPhaseStyle(phase)}`}
    >
      {phase}
    </span>
  );
}
