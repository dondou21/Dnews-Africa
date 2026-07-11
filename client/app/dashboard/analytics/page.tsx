"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Users, Eye, Activity, Clock, ArrowLeftRight, BarChart3, TrendingUp, Search, Globe, Zap } from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import DateRangeFilter from "@/components/analytics/DateRangeFilter";
import BarChart from "@/components/analytics/BarChart";
import LineChart from "@/components/analytics/LineChart";
import PieChart from "@/components/analytics/PieChart";
import Gauge from "@/components/analytics/Gauge";
import { get } from "@/lib/api-client";
import type { DashboardData, TopArticle, TrendingArticle } from "@/types/analytics";
import { SOURCE_LABELS, SOURCE_COLORS, formatDuration, formatNumber } from "@/types/analytics";

export default function AnalyticsPage() {
  return (<RoleGuard roles={["Admin", "Editor", "Journalist", "Moderator"]}><AnalyticsContent /></RoleGuard>);
}

function AnalyticsContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");
  const [tab, setTab] = useState<"overview" | "traffic" | "articles" | "realtime">("overview");

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await get<DashboardData>(`/analytics/dashboard?period=${p}`);
      setData(res);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(period); }, [fetchData, period]);

  const trafficChartData = data?.trafficSources?.map((t) => ({
    label: SOURCE_LABELS[t.source] || t.source,
    value: t.views,
    color: SOURCE_COLORS[t.source] || "#9ca3af",
  })) ?? [];

  const articleColumns: Column<TopArticle>[] = [
    { key: "title", header: "Article", render: (a) => (
      <Link href={`/dashboard/analytics/articles/${a.articleId}`} className="text-sm font-medium text-dnews-dark hover:text-dnews-accent line-clamp-1">{a.title}</Link>
    )},
    { key: "views", header: "Views", render: (a) => <span className="text-sm font-semibold">{formatNumber(a.views)}</span> },
    { key: "readers", header: "Readers", render: (a) => <span className="text-xs text-dnews-gray">{formatNumber(a.uniqueReaders)}</span> },
    { key: "avgTime", header: "Avg Time", render: (a) => <span className="text-xs text-dnews-gray">{formatDuration(a.avgTimeOnPage)}</span> },
    { key: "completion", header: "Completion", render: (a) => (
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-16 rounded-full bg-dnews-light-gray overflow-hidden">
          <div className="h-full rounded-full bg-dnews-accent" style={{ width: `${a.avgCompletionRate}%` }} />
        </div>
        <span className="text-xs text-dnews-gray">{Math.round(a.avgCompletionRate)}%</span>
      </div>
    )},
  ];

  const trendingColumns: Column<TrendingArticle>[] = [
    { key: "title", header: "Article", render: (t) => (
      <Link href={`/dashboard/analytics/articles/${t.articleId}`} className="text-sm font-medium text-dnews-dark hover:text-dnews-accent line-clamp-1">{t.title}</Link>
    )},
    { key: "views", header: "Last Hour", render: (t) => (
      <div className="flex items-center gap-1.5">
        <TrendingUp size={14} className="text-dnews-red" />
        <span className="text-sm font-bold text-dnews-red">{t.viewsLastHour}</span>
      </div>
    )},
    { key: "readers", header: "Readers", render: (t) => <span className="text-xs text-dnews-gray">{t.uniqueReaders}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">Analytics</h2>
          <p className="mt-1 text-sm text-dnews-muted">Reader insights and performance metrics.</p>
        </div>
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      {loading && !data && <LoadingState />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Today's Readers" value={data.realtime.todayVisitors} icon={Users} variant="default" />
            <StatsCard label="Active Now" value={data.activeReaders} icon={Activity} variant={data.activeReaders > 0 ? "default" : "default"} />
            <StatsCard label="Page Views" value={formatNumber(data.totalPageViews)} icon={Eye} variant="default" />
            <StatsCard label="Returning" value={`${Math.round((data.returningVisitors / Math.max(data.totalSessions, 1)) * 100)}%`} icon={ArrowLeftRight} variant="default" />
            <StatsCard label="Avg Duration" value={formatDuration(data.avgSessionDuration)} icon={Clock} variant="default" />
            <StatsCard label="Bounce Rate" value={`${data.bounceRate.toFixed(1)}%`} icon={BarChart3} variant={data.bounceRate > 50 ? "red" : "default"} />
            <StatsCard label="Pages/Session" value={data.pagesPerSession.toFixed(1)} icon={Activity} variant="default" />
            <StatsCard label="Sessions" value={formatNumber(data.totalSessions)} icon={Users} variant="default" />
          </div>

          <div className="flex items-center gap-1 border-b border-dnews-border">
            {(["overview", "traffic", "articles", "realtime"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === t ? "border-dnews-accent text-dnews-accent" : "border-transparent text-dnews-muted hover:text-dnews-dark"}`}>
                {t === "overview" ? "Overview" : t === "traffic" ? "Traffic Sources" : t === "articles" ? "Top Articles" : "Real-time"}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Page Views</h3>
                <LineChart data={data.topArticles.slice(0, 10).map((a, i) => ({ label: a.title.slice(0, 15), value: a.views }))} height={200} />
              </div>
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Traffic Distribution</h3>
                <PieChart data={trafficChartData} size={180} innerRadius={55} />
              </div>
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5 lg:col-span-2">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Trending Now</h3>
                <DataTable columns={trendingColumns} data={data.trending} keyExtractor={(t) => t.articleId} loading={false}
                  emptyTitle="No trending articles" emptyDescription="Articles with recent views will appear here." />
              </div>
            </div>
          )}

          {tab === "traffic" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Traffic Sources</h3>
                <BarChart data={trafficChartData} height={220} />
              </div>
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Distribution</h3>
                <PieChart data={trafficChartData} size={200} innerRadius={65} />
              </div>
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5 lg:col-span-2">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Source Breakdown</h3>
                <div className="space-y-2">
                  {data.trafficSources.map((s) => (
                    <div key={s.source} className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: SOURCE_COLORS[s.source] || "#9ca3af" }} />
                      <span className="flex-1 text-sm text-dnews-dark">{SOURCE_LABELS[s.source] || s.source}</span>
                      <span className="text-sm font-semibold text-dnews-dark">{formatNumber(s.views)}</span>
                      <div className="w-20 text-right text-xs text-dnews-muted">{s.percentage}%</div>
                      <div className="h-2 w-24 rounded-full bg-dnews-light-gray overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${s.percentage}%`, backgroundColor: SOURCE_COLORS[s.source] || "#9ca3af" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "articles" && (
            <div className="rounded-sm border border-dnews-border bg-dnews-card">
              <div className="border-b border-dnews-border px-4 py-3">
                <h3 className="text-sm font-semibold text-dnews-dark">Top Articles</h3>
              </div>
              <DataTable columns={articleColumns} data={data.topArticles} keyExtractor={(a) => a.articleId} loading={false}
                emptyTitle="No article data" emptyDescription="Article views will appear here once readers start engaging." />
            </div>
          )}

          {tab === "realtime" && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-dnews-dark">
                  <Zap size={14} className="text-dnews-accent" /> Active Readers
                </h3>
                <div className="text-4xl font-bold text-dnews-accent">{data.realtime.activeReaders}</div>
                <p className="mt-1 text-xs text-dnews-muted">Users active in the last 5 minutes</p>
              </div>
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Today</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-dnews-dark">{formatNumber(data.realtime.todayPageViews)}</div>
                    <p className="text-xs text-dnews-muted">Page Views</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-dnews-dark">{formatNumber(data.realtime.todayVisitors)}</div>
                    <p className="text-xs text-dnews-muted">Visitors</p>
                  </div>
                </div>
              </div>
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5 lg:col-span-2">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Active Pages</h3>
                {data.realtime.activePages.length === 0 ? (
                  <p className="text-xs text-dnews-muted">No active pages right now.</p>
                ) : (
                  <div className="space-y-2">
                    {data.realtime.activePages.map((p, i) => (
                      <div key={i} className="flex items-center justify-between rounded-sm bg-dnews-light-gray px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />
                          <span className="text-sm text-dnews-dark truncate">{p.title || p.path}</span>
                        </div>
                        <span className="shrink-0 text-xs font-medium text-dnews-gray">{p.activeUsers} users</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {!loading && !data && (
        <div className="flex items-center justify-center rounded-sm border border-dnews-border py-12">
          <div className="text-center">
            <BarChart3 size={32} className="mx-auto text-dnews-muted" />
            <p className="mt-2 text-sm text-dnews-muted">No analytics data available yet.</p>
            <p className="text-xs text-dnews-muted">Data will appear once readers visit your site.</p>
          </div>
        </div>
      )}
    </div>
  );
}
