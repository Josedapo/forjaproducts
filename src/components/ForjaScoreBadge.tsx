import { FORJA_SCORE_THRESHOLDS } from "@/lib/forjaScoreConfig";

interface ForjaScoreBadgeProps {
  score: number;
  size?: "default" | "large";
}

function bandColor(score: number): { color: string; label: string } {
  if (score >= FORJA_SCORE_THRESHOLDS.excellent) return { color: "#38a169", label: "Excellent" };
  if (score >= FORJA_SCORE_THRESHOLDS.good) return { color: "#65a30d", label: "Good" };
  if (score >= FORJA_SCORE_THRESHOLDS.marginal) return { color: "#d69e2e", label: "Marginal" };
  if (score >= FORJA_SCORE_THRESHOLDS.weak) return { color: "#e53e3e", label: "Weak" };
  return { color: "#9b1c1c", label: "Very weak" };
}

export default function ForjaScoreBadge({ score, size = "default" }: ForjaScoreBadgeProps) {
  const { color, label } = bandColor(score);
  const isLarge = size === "large";

  // Circular SVG progress ring
  const dim = isLarge ? 56 : 42;
  const r = isLarge ? 22 : 16;
  const stroke = isLarge ? 5 : 4;
  const cx = dim / 2;
  const cy = dim / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const fontSize = isLarge ? 16 : 13;

  return (
    <div className="inline-flex items-center gap-2" title={`Forja Score: ${score}/100 — ${label}`}>
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e5ea" strokeWidth={stroke} />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx}
          y={cy + fontSize / 3}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="700"
          fill="#1c1a18"
        >
          {score}
        </text>
      </svg>
      {isLarge && (
        <div className="leading-tight">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Forja Score</p>
          <p className="text-xs font-semibold" style={{ color }}>{label}</p>
        </div>
      )}
    </div>
  );
}
