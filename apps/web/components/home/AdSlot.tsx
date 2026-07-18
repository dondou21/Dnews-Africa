import Link from "next/link";

type AdVariant = "sidebar" | "banner" | "small";

interface AdSlotProps {
  variant?: AdVariant;
  className?: string;
}

const adContent: Record<AdVariant, { label: string; tagline: string }> = {
  sidebar: {
    label: "Advertisement",
    tagline: "Reach Pan-African audiences — Partner with Dnews Africa",
  },
  banner: {
    label: "Sponsor Spotlight",
    tagline: "Your brand could appear here · Learn more",
  },
  small: {
    label: "Advertise",
    tagline: "Connect with engaged readers across the continent",
  },
};

export default function AdSlot({
  variant = "sidebar",
  className = "",
}: AdSlotProps) {
  const heights: Record<AdVariant, string> = {
    sidebar: "min-h-[200px]",
    banner: "min-h-[90px]",
    small: "min-h-[90px]",
  };

  const content = adContent[variant];

  return (
    <Link
      href="/advertise"
      className={`${heights[variant]} ${className} group mb-6 flex items-center justify-center rounded-sm border border-dashed border-dnews-border bg-dnews-light-gray transition-colors hover:border-dnews-red/40 hover:bg-dnews-light-gray/80`}
    >
      <div className="px-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-dnews-muted transition-colors group-hover:text-dnews-red">
          {content.label}
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-dnews-muted/60 transition-colors group-hover:text-dnews-muted/80">
          {content.tagline}
        </p>
      </div>
    </Link>
  );
}
