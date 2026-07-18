"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, FileText, Image, AlertTriangle, CheckCircle, ArrowUpDown, ExternalLink } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get } from "@dnews/api-client";
import type { SeoReport } from "@dnews/types";

export default function SeoDashboardPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><SeoDashboardContent /></RoleGuard>);
}

function SeoDashboardContent() {
  const [report, setReport] = useState<SeoReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get<SeoReport>("/seo/report").then(setReport).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = report?.stats;

  const columns: Column<any>[] = [
    { key: "title", header: "Article", render: (a) => (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-dnews-dark">{a.title}</span>
      </div>
    )},
    { key: "score", header: "Score", render: (a) => {
      const color = a.score >= 80 ? "text-green-600" : a.score >= 50 ? "text-amber-600" : "text-red-600";
      return <span className={`text-sm font-bold ${color}`}>{a.score}</span>;
    }},
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { key: "suggestions", header: "Issues", render: (a) => (
      <span className={`text-xs ${a.suggestions.length > 0 ? "text-dnews-red" : "text-green-600"}`}>
        {a.suggestions.length > 0 ? `${a.suggestions.length} issues` : "OK"}
      </span>
    )},
    { key: "actions", header: "", className: "text-right", render: (a) => (
      <Link href={`/dashboard/articles/${a.articleId}`} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent">
        <ExternalLink size={14} />
      </Link>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">SEO Dashboard</h2>
          <p className="mt-1 text-sm text-dnews-muted">Monitor and improve search optimization.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/seo/redirects" className="rounded-sm border border-dnews-border px-3 py-2 text-xs font-medium text-dnews-gray hover:bg-dnews-light-gray">Redirects</Link>
          <Link href="/dashboard/seo/settings" className="rounded-sm bg-dnews-accent px-3 py-2 text-xs font-semibold text-white">Settings</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Avg SEO Score" value={stats?.avgScore ?? 0} icon={BarChart3} variant="default" />
        <StatsCard label="Missing Meta Desc" value={stats?.missingMetaDesc ?? 0} icon={FileText} variant={stats && stats.missingMetaDesc > 0 ? "red" : "default"} />
        <StatsCard label="Missing Featured Img" value={stats?.missingFeaturedImage ?? 0} icon={Image} variant={stats && stats.missingFeaturedImage > 0 ? "red" : "default"} />
        <StatsCard label="Excellent" value={stats?.excellent ?? 0} icon={CheckCircle} variant="default" />
        <StatsCard label="Needs Improvement" value={stats?.needsImprovement ?? 0} icon={AlertTriangle} variant={stats && stats.needsImprovement > 0 ? "red" : "default"} />
        <StatsCard label="Poor SEO" value={stats?.poor ?? 0} icon={ArrowUpDown} variant={stats && stats.poor > 0 ? "red" : "default"} />
      </div>

      <div className="rounded-sm border border-dnews-border">
        <div className="border-b border-dnews-border px-4 py-3">
          <h3 className="text-sm font-semibold text-dnews-dark">Articles SEO Report</h3>
        </div>
        <DataTable columns={columns} data={report?.articles ?? []} keyExtractor={(a) => a.articleId} loading={loading} emptyTitle="No articles" emptyDescription="Articles will appear here once created." />
      </div>
    </div>
  );
}
