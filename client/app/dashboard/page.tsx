import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Users,
  Mail,
  MessageCircle,
  Image,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";

const stats = [
  {
    label: "Total Articles",
    value: 0,
    icon: FileText,
    trend: { value: "0%", positive: true },
  },
  {
    label: "Pending Comments",
    value: 0,
    icon: MessageSquare,
    trend: { value: "0", positive: false },
    variant: "red" as const,
  },
  {
    label: "Total Users",
    value: 0,
    icon: Users,
    trend: { value: "0%", positive: true },
  },
  {
    label: "Newsletter Subscribers",
    value: 0,
    icon: Mail,
    trend: { value: "0%", positive: true },
  },
  {
    label: "Contact Messages",
    value: 0,
    icon: MessageCircle,
    trend: { value: "0", positive: false },
    variant: "red" as const,
  },
  {
    label: "Media Files",
    value: 0,
    icon: Image,
    trend: { value: "0%", positive: true },
  },
  {
    label: "Categories",
    value: 0,
    icon: LayoutDashboard,
  },
  {
    label: "Tags",
    value: 0,
    icon: LayoutDashboard,
  },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Welcome to Dnews Africa Dashboard
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Overview of your news platform at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-8">
        <h3 className="mb-4 font-heading text-lg font-semibold text-dnews-dark">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            label="Create Article"
            description="Write and publish a new article"
            href="/dashboard/articles"
            icon={FileText}
          />
          <QuickActionCard
            label="Moderate Comments"
            description="Review and approve pending comments"
            href="/dashboard/comments"
            icon={MessageSquare}
          />
          <QuickActionCard
            label="View Messages"
            description="Check new contact messages"
            href="/dashboard/messages"
            icon={MessageCircle}
          />
          <QuickActionCard
            label="Manage Media"
            description="Upload and manage media files"
            href="/dashboard/media"
            icon={Image}
          />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  label,
  description,
  href,
  icon: Icon,
}: {
  label: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <a
      href={href}
      className="group rounded-sm border border-dnews-border bg-dnews-card p-5 transition-all hover:border-dnews-accent hover:shadow-md"
    >
      <div className="mb-3 inline-flex rounded-lg bg-dnews-accent/10 p-3">
        <Icon size={22} className="text-dnews-accent" />
      </div>
      <h4 className="font-heading text-base font-semibold text-dnews-dark group-hover:text-dnews-accent">
        {label}
      </h4>
      <p className="mt-1 text-sm text-dnews-muted">{description}</p>
    </a>
  );
}
