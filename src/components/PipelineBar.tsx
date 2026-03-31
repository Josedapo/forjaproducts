const PHASES = ["shape", "build", "validate", "launch"] as const;

interface PipelineBarProps {
  currentPhase: string;
}

function getPhaseIndex(phase: string): number {
  const idx = PHASES.indexOf(phase.toLowerCase() as (typeof PHASES)[number]);
  return idx === -1 ? 0 : idx;
}

export default function PipelineBar({ currentPhase }: PipelineBarProps) {
  const activeIndex = getPhaseIndex(currentPhase);

  return (
    <div className="flex items-center gap-1">
      {PHASES.map((phase, i) => {
        let style: string;
        if (i < activeIndex) {
          style = "bg-green text-white";
        } else if (i === activeIndex) {
          style = "bg-blue text-white animate-pulse";
        } else {
          style = "bg-surface2 text-text-dim";
        }

        return (
          <div
            key={phase}
            className={`flex-1 rounded-md px-3 py-1.5 text-center text-xs font-medium capitalize ${style}`}
          >
            {phase}
          </div>
        );
      })}
    </div>
  );
}
