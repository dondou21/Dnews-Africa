"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Clock, ScrollText, BarChart3, Globe, Users } from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import DateRangeFilter from "@/components/analytics/DateRangeFilter";
import LineChart from "@/components/analytics/LineChart";
import BarChart from "@/components/analytics/BarChart";
import { get } from "@/lib/api-client";
import type { ArticleAnalytics } from "@/types/analytics";
import { SOURCE_LABELS, SOURCE_COLORS, formatDuration, formatNumber } from "@/types/analytics";

export default function ArticleAnalyticsPage() {
  return (<RoleGuard roles={["Admin", "Editor", "Journalist"]}><ArticleAnalyticsContent /></RoleGuard>);
}

function ArticleAnalyticsContent() {
  const params = useParams();
  const articleId = params.articleId as string;
  const [data, setData] = useState<ArticleAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await get<ArticleAnalytics>(`/analytics/articles/${articleId}?period=${p}`);
      setData(res);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => { fetchData(period); }, [fetchData, period]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/analytics" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-xl font-bold text-dnews-dark">Article Analytics</h2>
            <p className="mt-1 text-sm text-dnews-muted line-clamp-1">{data?.articleId ? `ID: ${articleId.slice(0, 8)}…` : "Loading..."}</p>
          </div>
        </div>
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      {loading && <LoadingState />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Total Views" value={formatNumber(data.totalViews)} icon={Eye} variant="default" />
            <StatsCard label="Unique Readers" value={formatNumber(data.uniqueReaders)} icon={Users} variant="default" />
            <StatsCard label="Avg Reading Time" value={formatDuration(data.avgTimeOnPage)} icon={Clock} variant="default" />
            <StatsCard label="Completion Rate" value={`${Math.round(data.avgCompletionRate)}%`} icon={BarChart3} variant={data.avgCompletionRate > 50 ? "default" : "red"} />
            <StatsCard label="Avg Scroll Depth" value={`${Math.round(data.avgScrollDepth)}%`} icon={ScrollText} variant={data.avgScrollDepth > 50 ? "default" : "red"} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Views Over Time</h3>
              {data.dailyViews.length > 0 ? (
                <LineChart data={data.dailyViews.map((d) => ({ label: new Date(d.date).toLocaleDateString(), value: d.views }))} height={200} />
              ) : (
                <p className="text-xs text-dnews-muted py-8 text-center">No daily view data yet.</p>
              )}
            </div>
            <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Traffic Sources</h3>
              {data.trafficSources.length > 0 ? (
                <BarChart data={data.trafficSources.map((t) => ({
                  label: SOURCE_LABELS[t.source] || t.source,
                  value: t.views,
                  color: SOURCE_COLORS[t.source] || "#9ca3af",
                }))} height={200} />
              ) : (
                <p className="text-xs text-dnews-muted py-8 text-center">No traffic source data yet.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


