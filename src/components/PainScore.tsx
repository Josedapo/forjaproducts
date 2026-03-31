interface PainScoreProps {
  score: number | null;
}

function getScoreColor(score: number): string {
  if (score >= 5) return "bg-red text-white";
  if (score >= 4) return "bg-yellow text-white";
  if (score >= 3) return "bg-blue text-white";
  return "bg-surface2 text-text-dim";
}

export default function PainScore({ score }: PainScoreProps) {
  if (score === null) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface2 text-xs text-text-dim">
        --
      </span>
    );
  }

  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${getScoreColor(score)}`}
    >
      {score}
    </span>
  );
}
