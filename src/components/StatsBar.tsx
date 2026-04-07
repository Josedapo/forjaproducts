import { FORJA_SCORE_THRESHOLDS } from "@/lib/forjaScoreConfig";

interface StatsBarProps {
  products: number;
  totalIdeas: number;
  advance: number;
  pending: number;
  avgPain: string;
  avgForjaScore: string;
}

function PainBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = Math.min(value / max, 1) * 100;

  return (
    <div className="w-full">
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        <div className="flex-1" style={{ background: "#38a169", opacity: 0.25 }} />
        <div className="flex-1" style={{ background: "#d69e2e", opacity: 0.25 }} />
        <div className="flex-1" style={{ background: "#e53e3e", opacity: 0.25 }} />
      </div>
      <div className="relative h-0">
        <div
          className="absolute -top-[11px] h-5 w-1 rounded-full bg-text"
          style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
        />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-text-dim">
        <span>0</span>
        <span>5</span>
      </div>
    </div>
  );
}

function RingProgress({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? value / max : 0;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <svg viewBox="0 0 80 80" className="w-full h-auto" style={{ maxWidth: 80 }}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e5ea" strokeWidth="6" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="44" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1c1a18">
        {value}
      </text>
    </svg>
  );
}

function IconStat({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl"
        style={{ backgroundColor: color + "15" }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <span className="text-3xl font-bold text-text">{value}</span>
    </div>
  );
}

function ForjaScoreStatBar({ value }: { value: number }) {
  const pct = Math.min(value / 100, 1) * 100;
  let color = "#e53e3e";
  if (value >= FORJA_SCORE_THRESHOLDS.excellent) color = "#38a169";
  else if (value >= FORJA_SCORE_THRESHOLDS.good) color = "#65a30d";
  else if (value >= FORJA_SCORE_THRESHOLDS.marginal) color = "#d69e2e";

  return (
    <div className="w-full">
      <div className="h-3 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-text-dim">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}

export default function StatsBar({
  products,
  totalIdeas,
  advance,
  pending,
  avgPain,
  avgForjaScore,
}: StatsBarProps) {
  const painNum = parseFloat(avgPain) || 0;
  const forjaNum = parseFloat(avgForjaScore) || 0;

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
      {/* Products */}
      <div className="card px-5 py-4">
        <IconStat
          value={products}
          color="#C07840"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          }
        />
        <p className="mt-2 text-sm text-text-dim">Products</p>
      </div>

      {/* Total Ideas */}
      <div className="card px-5 py-4">
        <IconStat
          value={totalIdeas}
          color="#3182ce"
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
            </svg>
          }
        />
        <p className="mt-2 text-sm text-text-dim">Total ideas</p>
      </div>

      {/* Advance */}
      <div className="card flex flex-col items-center justify-center px-5 py-4">
        <RingProgress value={advance} max={totalIdeas} color="#38a169" />
        <p className="mt-1 text-sm text-text-dim">Advance</p>
      </div>

      {/* Pending */}
      <div className="card flex flex-col items-center justify-center px-5 py-4">
        <RingProgress value={pending} max={totalIdeas} color="#d69e2e" />
        <p className="mt-1 text-sm text-text-dim">Pending</p>
      </div>

      {/* Avg Pain */}
      <div className="card px-5 py-4">
        <p className="text-3xl font-bold text-text">{avgPain}</p>
        <p className="mb-3 text-sm text-text-dim">Avg pain</p>
        <PainBar value={painNum} />
      </div>

      {/* Avg Forja Score */}
      <div className="card px-5 py-4">
        <p className="text-3xl font-bold text-text">{avgForjaScore}</p>
        <p className="mb-3 text-sm text-text-dim">Avg Forja Score</p>
        <ForjaScoreStatBar value={forjaNum} />
      </div>
    </div>
  );
}
