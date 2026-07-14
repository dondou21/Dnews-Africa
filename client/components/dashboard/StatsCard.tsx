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
  variant?: "default" | "red";
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  href,
  trend,
  variant = "default",
}: StatsCardProps) {
  const accentColor =
    variant === "red" ? "text-dnews-red" : "text-dnews-accent";
  const bgColor =
    variant === "red" ? "bg-dnews-red/10" : "bg-dnews-accent/10";

  const cardContent = (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">
          {label}
        </p>
        <p className="font-heading text-2xl font-bold text-dnews-dark">
          {value}
        </p>
        {trend && (
          <p
            className={`text-xs font-medium ${
              trend.positive ? "text-green-600" : "text-dnews-red"
            }`}
          >
            {trend.positive ? "+" : ""}
            {trend.value} from last month
          </p>
        )}
      </div>
      <div className={`rounded-lg ${bgColor} p-3`}>
        <Icon size={22} className={accentColor} />
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-sm border border-dnews-border bg-dnews-card p-5 transition-shadow hover:shadow-md cursor-pointer"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div className="rounded-sm border border-dnews-border bg-dnews-card p-5 transition-shadow hover:shadow-md">
      {cardContent}
    </div>
  );
}
