const PHASES = [
  { key: "shape", label: "Shape", icon: "💡" },
  { key: "build", label: "Build", icon: "🔨" },
  { key: "validate", label: "Validate", icon: "🔍" },
  { key: "launch", label: "Launch", icon: "🚀" },
] as const;

interface PipelineBarProps {
  currentPhase: string;
}

function getPhaseIndex(phase: string): number {
  const idx = PHASES.findIndex((p) => p.key === phase.toLowerCase());
  return idx === -1 ? 0 : idx;
}

export default function PipelineBar({ currentPhase }: PipelineBarProps) {
  const activeIndex = getPhaseIndex(currentPhase);

  return (
    <div className="relative flex items-center justify-between py-4 px-[30px]">
      {/* Connection line between circle centers */}
      <div className="absolute top-1/2 -translate-y-1/2" style={{ left: 70, right: 70 }}>
        <div className="h-1 w-full rounded-full bg-border" />
        <div
          className="absolute top-0 left-0 h-1 rounded-full transition-all duration-500"
          style={{
            width: activeIndex === 0 ? "0%" : `${(activeIndex / (PHASES.length - 1)) * 100}%`,
            background: "linear-gradient(90deg, #38a169, #4f6df5)",
          }}
        />
      </div>

      {PHASES.map((phase, i) => {
        const isCompleted = i < activeIndex;
        const isActive = i === activeIndex;
        const isPending = i > activeIndex;

        return (
          <div
            key={phase.key}
            className="relative z-10 flex flex-col items-center gap-1.5"
            style={{ minWidth: 80 }}
          >
            {/* Circle */}
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-full border-[3px] text-xl transition-all ${
                isCompleted
                  ? "border-green bg-green/10"
                  : isActive
                    ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
                    : "border-border bg-surface"
              }`}
            >
              {isCompleted ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              ) : (
                <span className={isPending ? "grayscale opacity-40" : ""}>
                  {phase.icon}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isCompleted
                  ? "text-green"
                  : isActive
                    ? "text-accent"
                    : "text-text-dim"
              }`}
            >
              {phase.label}
            </span>

            {/* Active pulse dot */}
            {isActive && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-50" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-accent" />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
