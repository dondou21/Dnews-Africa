interface AdSlotProps {
  size?: "small" | "medium" | "large";
  label?: string;
  className?: string;
}

export default function AdSlot({
  size = "medium",
  label = "Advertisement",
  className = "",
}: AdSlotProps) {
  const heights = {
    small: "min-h-[90px]",
    medium: "min-h-[200px]",
    large: "min-h-[400px]",
  };

  return (
    <div
      className={`${heights[size]} ${className} mb-6 flex items-center justify-center rounded-sm border border-dashed border-dnews-border bg-dnews-light-gray`}
    >
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
          {label}
        </p>
        <p className="mt-1 text-xs text-dnews-muted/60">
          Your ad could be here
        </p>
      </div>
    </div>
  );
}
