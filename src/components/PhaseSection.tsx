interface PhaseSectionProps {
  title: string;
  children: React.ReactNode | null;
}

export default function PhaseSection({ title, children }: PhaseSectionProps) {
  const hasContent = children !== null && children !== undefined;

  return (
    <section className="mb-6 rounded-lg border border-border bg-surface">
      <div className="border-l-4 border-l-accent px-6 py-4">
        <h3 className="mb-3 text-base font-semibold text-text">{title}</h3>
        {hasContent ? (
          children
        ) : (
          <p className="text-sm text-text-dim">Pendiente</p>
        )}
      </div>
    </section>
  );
}
