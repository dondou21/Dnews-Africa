interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <h3 className="shrink-0 text-xs font-semibold uppercase tracking-[0.15em] text-brand-red">
        {title}
      </h3>
      <div className="h-px flex-1 bg-dnews-border" />
    </div>
  );
}
