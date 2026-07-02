interface AdSlotProps {
  size?: "small" | "medium" | "large";
  label?: string;
}

export default function AdSlot({ size = "medium", label = "Advertisement" }: AdSlotProps) {
  const heights = {
    small: "h-[90px]",
    medium: "h-[200px]",
    large: "h-[400px]",
  };

  return (
    <div
      className={`${heights[size]} mb-6 flex items-center justify-center rounded border border-dashed border-dnews-border bg-dnews-light-gray text-xs text-dnews-muted`}
    >
      {label}
    </div>
  );
}
