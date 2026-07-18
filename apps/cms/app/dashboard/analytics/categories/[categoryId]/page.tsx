"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Clock, FileText, Users, BarChart3 } from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import DateRangeFilter from "@/components/analytics/DateRangeFilter";
import { get } from "@dnews/api-client";
import type { CategoryAnalytics } from "@dnews/types";
import { formatNumber } from "@dnews/types";

export default function CategoryAnalyticsPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><CategoryAnalyticsContent /></RoleGuard>);
}

function CategoryAnalyticsContent() {
  const params = useParams();
  const categoryId = parseInt(params.categoryId as string);
  const [data, setData] = useState<CategoryAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await get<CategoryAnalytics>(`/analytics/categories/${categoryId}?period=${p}`);
      setData(res);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { fetchData(period); }, [fetchData, period]);

  const storyColumns: Column<{ articleId: string; title: string; views: number }>[] = [
    { key: "title", header: "Story", render: (s) => (
      <Link href={`/dashboard/analytics/articles/${s.articleId}`} className="text-sm font-medium text-dnews-dark hover:text-dnews-accent line-clamp-1">{s.title}</Link>
    )},
    { key: "views", header: "Views", render: (s) => <span className="text-sm font-semibold">{formatNumber(s.views)}</span> },
  ];

  const authorColumns: Column<{ id: string; name: string; count: number; views: number }>[] = [
    { key: "name", header: "Author", render: (a) => (
      <Link href={`/dashboard/analytics/authors/${a.id}`} className="text-sm font-medium text-dnews-dark hover:text-dnews-accent">{a.name}</Link>
    )},
    { key: "count", header: "Articles", render: (a) => <span className="text-xs text-dnews-gray">{a.count}</span> },
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
            <h2 className="font-heading text-xl font-bold text-dnews-dark">Category Analytics</h2>
            <p className="mt-1 text-sm text-dnews-muted">Category #{categoryId}</p>
          </div>
        </div>
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      {loading && <LoadingState />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Total Articles" value={data.totalArticles} icon={FileText} variant="default" />
            <StatsCard label="Total Views" value={formatNumber(data.totalViews)} icon={Eye} variant="default" />
            <StatsCard label="Unique Readers" value={formatNumber(data.uniqueReaders)} icon={Users} variant="default" />
            <StatsCard label="Avg Time" value={`${data.avgTime.toFixed(0)}s`} icon={Clock} variant="default" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {data.topStories.length > 0 && (
              <div className="rounded-sm border border-dnews-border bg-dnews-card">
                <div className="border-b border-dnews-border px-4 py-3"><h3 className="text-sm font-semibold text-dnews-dark">Top Stories</h3></div>
                <DataTable columns={storyColumns} data={data.topStories} keyExtractor={(s) => s.articleId} loading={false} />
              </div>
            )}
            {data.topAuthors.length > 0 && (
              <div className="rounded-sm border border-dnews-border bg-dnews-card">
                <div className="border-b border-dnews-border px-4 py-3"><h3 className="text-sm font-semibold text-dnews-dark">Top Authors</h3></div>
                <DataTable columns={authorColumns} data={data.topAuthors} keyExtractor={(a) => a.id} loading={false} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
