"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Users,
  Mail,
  MessageCircle,
  Image,
  FileWarning,
  SendHorizonal,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import { get } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { DashboardStats } from "@/types/dashboard";
import type { Article } from "@/types/article";

export default function DashboardOverview() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Journalist", "Moderator"]}>
      <DashboardOverviewContent />
    </RoleGuard>
  );
}

function DashboardOverviewContent() {
  const { user } = useAuth();
  const role = user?.role.name ?? "";
  const firstName = user?.firstName ?? "";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scheduledArticles, setScheduledArticles] = useState<Article[]>([]);
  const [scheduledLoading, setScheduledLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    get<DashboardStats>("/dashboard")
      .then(setStats)
      .catch(() => setError("Failed to load dashboard statistics."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (["Admin", "Editor"].includes(role)) {
      get<{ articles: Article[] }>("/articles/admin/all?status=SCHEDULED&limit=10")
        .then((res) => setScheduledArticles(res.articles || []))
        .catch(() => {})
        .finally(() => setScheduledLoading(false));
    } else {
      setScheduledLoading(false);
    }
  }, [role]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  if (loading) {
    return <LoadingState rows={4} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            Welcome{firstName ? `, ${firstName}` : ""}
          </h2>
          <p className="mt-1 text-sm text-dnews-muted">
            Overview of your news platform at a glance.
          </p>
        </div>
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <EmptyState
        title="No data available"
        description="Dashboard statistics could not be loaded."
        icon={FileWarning}
      />
    );
  }

  const cards = [
    {
      label: "Total Articles",
      value: stats.overview.totalArticles,
      icon: FileText,
      href: "/dashboard/articles",
    },
    {
      label: "Draft Articles",
      value: stats.overview.draftArticles,
      icon: FileWarning,
      href: "/dashboard/articles?status=DRAFT",
    },
    {
      label: "Pending Review",
      value: stats.overview.pendingReviewArticles,
      icon: SendHorizonal,
      href: "/dashboard/articles?status=PENDING_REVIEW",
    },
    {
      label: "Published Articles",
      value: stats.overview.publishedArticles,
      icon: CheckCircle2,
      href: "/dashboard/articles?status=PUBLISHED",
    },
    {
      label: "Scheduled",
      value: stats.overview.scheduledArticles,
      icon: Calendar,
      href: "/dashboard/articles?status=SCHEDULED",
    },
    {
      label: "Categories",
      value: stats.categories.totalCategories,
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      value: stats.users.totalUsers,
      icon: Users,
    },
    {
      label: "Media",
      value: stats.media.totalFiles,
      icon: Image,
    },
    {
      label: "Newsletter Subscribers",
      value: stats.newsletter.totalSubscribers,
      icon: Mail,
    },
    {
      label: "Contact Messages",
      value: stats.contact.totalMessages,
      icon: MessageCircle,
      variant: "red" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Welcome{firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Overview of your news platform at a glance.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card) => (
          <StatsCard key={card.label} {...card} />
        ))}
      </div>

      {["Admin", "Editor"].includes(role) && !scheduledLoading && scheduledArticles.length > 0 && (
        <div>
          <h3 className="mb-4 font-heading text-lg font-semibold text-dnews-dark">
            Upcoming Scheduled Articles
          </h3>
          <div className="mb-8 space-y-2">
            {scheduledArticles.map((article) => {
              const remaining = article.scheduledAt ? new Date(article.scheduledAt).getTime() - now : 0;
              const hours = Math.floor(remaining / 3600000);
              const minutes = Math.floor((remaining % 3600000) / 60000);
              const days = Math.floor(hours / 24);
              const displayHours = hours % 24;
              return (
                <Link
                  key={article.id}
                  href={`/dashboard/articles/${article.id}`}
                  className="flex items-center justify-between rounded-sm border border-dnews-border bg-dnews-card px-4 py-3 transition-colors hover:bg-dnews-light-gray"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Calendar size={16} className="shrink-0 text-purple-500" />
                    <span className="truncate text-sm font-medium text-dnews-dark">
                      {article.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {remaining > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-purple-600">
                        <Clock size={12} />
                        {days > 0 ? `${days}d ` : ""}{displayHours}h {minutes}m
                      </span>
                    ) : (
                      <span className="text-xs text-dnews-red">Overdue</span>
                    )}
                    <ExternalLink size={14} className="text-dnews-muted" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="mb-4 font-heading text-lg font-semibold text-dnews-dark">
          Quick Actions
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Admin", "Editor", "Journalist"].includes(role) && (
            <QuickActionCard
              label="Create Article"
              description="Write and publish a new article"
              href="/dashboard/articles"
              icon={FileText}
            />
          )}
          {["Admin", "Editor"].includes(role) && (
            <QuickActionCard
              label="View Messages"
              description="Check new contact messages"
              href="/dashboard/messages"
              icon={MessageCircle}
            />
          )}
          {["Admin", "Editor", "Journalist"].includes(role) && (
            <QuickActionCard
              label="Manage Media"
              description="Upload and manage media files"
              href="/dashboard/media"
              icon={Image}
            />
          )}
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
