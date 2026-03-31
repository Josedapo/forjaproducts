interface Stat {
  label: string;
  value: string | number;
}

interface StatsBarProps {
  stats: Stat[];
}

export default function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-border bg-surface px-4 py-3"
        >
          <p className="text-2xl font-semibold text-text">{stat.value}</p>
          <p className="text-sm text-text-dim">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
