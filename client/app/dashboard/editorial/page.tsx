"use client";

import { useEffect, useState } from "react";
import { FileText, CheckSquare, Clock, Calendar, AlertTriangle, PenTool } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get } from "@/lib/api-client";
import type { WorkflowStats } from "@/types/editorial";

export default function EditorialPage() {
  return (<RoleGuard roles={["Admin", "Editor", "Journalist"]}><EditorialDashboard /></RoleGuard>);
}

function EditorialDashboard() {
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<WorkflowStats>("/editorial/stats")
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "My Drafts", value: stats?.myDrafts ?? 0, icon: FileText, variant: "default" as const, href: "/dashboard/editorial/drafts" },
    { label: "Pending Reviews", value: stats?.pendingReviews ?? 0, icon: CheckSquare, variant: "default" as const, href: "/dashboard/editorial/review" },
    { label: "Needs Revision", value: stats?.needsRevision ?? 0, icon: AlertTriangle, variant: "red" as const, href: "/dashboard/editorial/drafts" },
    { label: "Scheduled", value: stats?.scheduledCount ?? 0, icon: Calendar, variant: "default" as const, href: "/dashboard/editorial/scheduled" },
    { label: "Published Today", value: stats?.publishedToday ?? 0, icon: Clock, variant: "default" as const, href: "/dashboard/editorial/published" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">Editorial Dashboard</h2>
          <p className="mt-1 text-sm text-dnews-muted">Manage the editorial workflow.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => (
          <a key={card.label} href={card.href} className="block transition-opacity hover:opacity-80">
            <StatsCard label={card.label} value={card.value} icon={card.icon} variant={card.variant} />
          </a>
        ))}
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-sm border border-dnews-border bg-dnews-card p-6">
              <div className="mb-2 h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-8 w-12 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
