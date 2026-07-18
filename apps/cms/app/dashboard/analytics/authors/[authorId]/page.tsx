"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Clock, ScrollText, FileText, BarChart3 } from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import DateRangeFilter from "@/components/analytics/DateRangeFilter";
import { get } from "@dnews/api-client";
import type { AuthorAnalytics } from "@dnews/types";
import { formatDuration, formatNumber } from "@dnews/types";

export default function AuthorAnalyticsPage() {
  return (<RoleGuard roles={["Admin", "Editor", "Journalist"]}><AuthorAnalyticsContent /></RoleGuard>);
}

function AuthorAnalyticsContent() {
  const params = useParams();
  const authorId = params.authorId as string;
  const [data, setData] = useState<AuthorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await get<AuthorAnalytics>(`/analytics/authors/${authorId}?period=${p}`);
      setData(res);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [authorId]);

  useEffect(() => { fetchData(period); }, [fetchData, period]);

  const topColumns: Column<{ articleId: string; title: string; views: number }>[] = [
    { key: "title", header: "Article", render: (a) => (
      <Link href={`/dashboard/analytics/articles/${a.articleId}`} className="text-sm font-medium text-dnews-dark hover:text-dnews-accent line-clamp-1">{a.title}</Link>
    )},
    { key: "views", header: "Views", render: (a) => <span className="text-sm font-semibold">{formatNumber(a.views)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/analytics" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-xl font-bold text-dnews-dark">Author Analytics</h2>
            <p className="mt-1 text-sm text-dnews-muted">Performance metrics for this author.</p>
          </div>
        </div>
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      {loading && <LoadingState />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Published Articles" value={data.totalArticles} icon={FileText} variant="default" />
            <StatsCard label="Total Views" value={formatNumber(data.totalViews)} icon={Eye} variant="default" />
            <StatsCard label="Avg Views/Article" value={formatNumber(data.avgViews)} icon={BarChart3} variant="default" />
            <StatsCard label="Avg Reading Time" value={formatDuration(data.avgReadingTime)} icon={Clock} variant="default" />
            <StatsCard label="Avg Scroll Depth" value={`${Math.round(data.avgScrollDepth)}%`} icon={ScrollText} variant={data.avgScrollDepth > 50 ? "default" : "red"} />
            <StatsCard label="Completion Rate" value={`${Math.round(data.avgCompletionRate)}%`} icon={BarChart3} variant={data.avgCompletionRate > 50 ? "default" : "red"} />
          </div>

          {data.topArticles.length > 0 && (
            <div className="rounded-sm border border-dnews-border bg-dnews-card">
              <div className="border-b border-dnews-border px-4 py-3">
                <h3 className="text-sm font-semibold text-dnews-dark">Top Articles</h3>
              </div>
              <DataTable columns={topColumns} data={data.topArticles} keyExtractor={(a) => a.articleId} loading={false} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
