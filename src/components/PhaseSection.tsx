interface PhaseSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode | null;
}

export default function PhaseSection({ title, icon, children }: PhaseSectionProps) {
  const hasContent = children !== null && children !== undefined;

  return (
    <section className="mb-6 card overflow-hidden">
      <div className="border-l-4 border-l-accent px-6 py-5">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-text">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
        {hasContent ? (
          children
        ) : (
          <p className="text-sm text-text-dim">Pending</p>
        )}
      </div>
    </section>
  );
}
