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
  Tags,
  ShieldCheck,
  MessageSquare,
  FolderTree,
  ArrowRight,
  Plus,
  BarChart3,
  PenTool,
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import { get } from "@dnews/api-client";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { DashboardStats } from "@dnews/types";
import type { Article } from "@dnews/types";

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
        <PageHeader
          title={`Welcome${firstName ? `, ${firstName}` : ""}`}
          description="Overview of your news platform at a glance."
        />
        <div className="rounded-xl border border-dnews-red/20 bg-dnews-red/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dnews-red/10">
              <FileWarning size={16} className="text-dnews-red" />
            </div>
            <p className="text-sm font-medium text-dnews-red">{error}</p>
          </div>
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
      label: "Drafts",
      value: stats.overview.draftArticles,
      icon: FileWarning,
      href: "/dashboard/articles?status=DRAFT",
      variant: "amber" as const,
    },
    {
      label: "Pending Review",
      value: stats.overview.pendingReviewArticles,
      icon: SendHorizonal,
      href: "/dashboard/articles?status=PENDING_REVIEW",
      variant: "purple" as const,
    },
    {
      label: "Published",
      value: stats.overview.publishedArticles,
      icon: CheckCircle2,
      href: "/dashboard/articles?status=PUBLISHED",
      variant: "green" as const,
    },
    {
      label: "Scheduled",
      value: stats.overview.scheduledArticles,
      icon: Calendar,
      href: "/dashboard/articles?status=SCHEDULED",
      variant: "purple" as const,
    },
    {
      label: "Categories",
      value: stats.categories.totalCategories,
      icon: LayoutDashboard,
      href: "/dashboard/categories",
    },
    {
      label: "Subcategories",
      value: "—",
      icon: FolderTree,
      href: "/dashboard/subcategories",
    },
    {
      label: "Tags",
      value: "—",
      icon: Tags,
      href: "/dashboard/tags",
    },
    {
      label: "Users",
      value: stats.users.totalUsers,
      icon: Users,
      href: "/dashboard/users",
    },
    {
      label: "Media Files",
      value: stats.media.totalFiles,
      icon: Image,
      href: "/dashboard/media",
    },
    {
      label: "Newsletter Subscribers",
      value: stats.newsletter.totalSubscribers,
      icon: Mail,
      href: "/dashboard/newsletter",
    },
    {
      label: "Unread Messages",
      value: stats.contact.unreadMessages,
      icon: MessageSquare,
      href: "/dashboard/messages",
      variant: stats.contact.unreadMessages > 0 ? ("red" as const) : ("default" as const),
    },
    {
      label: "Contact Messages",
      value: stats.contact.totalMessages,
      icon: MessageCircle,
      variant: "red" as const,
      href: "/dashboard/messages",
    },
    {
      label: "Roles",
      value: "—",
      icon: ShieldCheck,
      href: "/dashboard/roles",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome${firstName ? `, ${firstName}` : ""}`}
        description="Here&apos;s what&apos;s happening with your news platform today."
      />

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <StatsCard key={card.label} {...card} />
          ))}
        </div>
      </section>

      {["Admin", "Editor"].includes(role) && !scheduledLoading && scheduledArticles.length > 0 && (
        <section>
          <SectionHeader
            title="Upcoming Scheduled Articles"
            action={
              <Link
                href="/dashboard/articles?status=SCHEDULED"
                className="inline-flex items-center gap-1 text-xs font-medium text-dnews-accent hover:text-dnews-accent-light transition-colors"
              >
                View all <ArrowRight size={12} />
              </Link>
            }
          />
          <div className="space-y-2">
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
                  className="group flex items-center justify-between rounded-xl border border-dnews-border bg-dnews-card px-5 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
                      <Calendar size={16} className="text-purple-500" />
                    </div>
                    <span className="truncate text-sm font-medium text-dnews-dark group-hover:text-dnews-accent">
                      {article.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {remaining > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-500/10 dark:text-purple-400">
                        <Clock size={12} />
                        {days > 0 ? `${days}d ` : ""}{displayHours}h {minutes}m
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-dnews-red dark:bg-red-500/10">
                        Overdue
                      </span>
                    )}
                    <ExternalLink size={14} className="text-dnews-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Quick Actions" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["Admin", "Editor", "Journalist"].includes(role) && (
            <QuickActionCard
              label="Create Article"
              description="Write and publish a new article"
              href="/dashboard/articles/new"
              icon={PenTool}
            />
          )}
          {["Admin", "Editor"].includes(role) && (
            <QuickActionCard
              label="Manage Categories"
              description="Organize content with categories and subcategories"
              href="/dashboard/categories"
              icon={LayoutDashboard}
            />
          )}
          {["Admin", "Editor"].includes(role) && (
            <QuickActionCard
              label="Manage Tags"
              description="Create and manage article tags"
              href="/dashboard/tags"
              icon={Tags}
            />
          )}
          {["Admin", "Editor", "Journalist"].includes(role) && (
            <QuickActionCard
              label="Media Library"
              description="Upload and manage media files"
              href="/dashboard/media"
              icon={Image}
            />
          )}
          {["Admin", "Editor"].includes(role) && (
            <QuickActionCard
              label="View Messages"
              description="Check new contact messages and comments"
              href="/dashboard/messages"
              icon={MessageCircle}
            />
          )}
          {["Admin"].includes(role) && (
            <QuickActionCard
              label="Manage Users"
              description="Manage user accounts and roles"
              href="/dashboard/users"
              icon={Users}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-heading text-2xl font-bold text-dnews-dark">
        {title}
      </h2>
      <p className="text-sm text-dnews-muted">{description}</p>
    </div>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-heading text-lg font-semibold text-dnews-dark">
        {title}
      </h3>
      {action}
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
    <Link
      href={href}
      className="group flex items-start gap-4 rounded-xl border border-dnews-border bg-dnews-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-dnews-accent hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dnews-accent"
    >
      <div className="shrink-0 rounded-xl bg-dnews-accent/10 p-3 ring-1 ring-inset ring-white/10">
        <Icon size={22} className="text-dnews-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-heading text-base font-semibold text-dnews-dark group-hover:text-dnews-accent transition-colors">
          {label}
        </h4>
        <p className="mt-1 text-sm text-dnews-muted leading-relaxed">{description}</p>
      </div>
      <ArrowRight size={16} className="mt-1 shrink-0 text-dnews-muted opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" />
    </Link>
  );
}
