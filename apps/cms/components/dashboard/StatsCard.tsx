import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  href?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "default" | "red" | "amber" | "green" | "purple";
}

const variantStyles = {
  default: { text: "text-dnews-accent", bg: "bg-dnews-accent/10" },
  red: { text: "text-dnews-red", bg: "bg-dnews-red/10" },
  amber: { text: "text-dnews-amber", bg: "bg-dnews-amber/10" },
  green: { text: "text-dnews-green", bg: "bg-dnews-green/10" },
  purple: { text: "text-dnews-purple", bg: "bg-dnews-purple/10" },
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  href,
  trend,
  variant = "default",
}: StatsCardProps) {
  const styles = variantStyles[variant];

  const cardContent = (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold uppercase tracking-wider text-dnews-muted">
          {label}
        </p>
        <p className="mt-1 font-heading text-2xl font-bold text-dnews-dark tabular-nums">
          {value}
        </p>
        {trend && (
          <p
            className={`mt-1 text-xs font-medium ${
              trend.positive ? "text-dnews-green" : "text-dnews-red"
            }`}
          >
            <span className="inline-flex items-center gap-0.5">
              {trend.positive ? "\u2191" : "\u2193"}
              {trend.value}
            </span>
          </p>
        )}
      </div>
      <div className={`shrink-0 rounded-xl ${styles.bg} p-3 ring-1 ring-inset ring-white/10`}>
        <Icon size={22} className={styles.text} />
      </div>
    </div>
  );

  const cardClasses =
    "group block rounded-xl border border-dnews-border bg-dnews-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dnews-accent";

  if (href) {
    return <a href={href} className={cardClasses + " cursor-pointer"}>{cardContent}</a>;
  }

  return <div className={cardClasses}>{cardContent}</div>;
}
