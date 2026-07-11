"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Search, XCircle, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import DateRangeFilter from "@/components/analytics/DateRangeFilter";
import BarChart from "@/components/analytics/BarChart";
import { get } from "@/lib/api-client";
import type { SearchAnalytics } from "@/types/analytics";

export default function SearchAnalyticsPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><SearchAnalyticsContent /></RoleGuard>);
}

function SearchAnalyticsContent() {
  const [data, setData] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await get<SearchAnalytics>(`/analytics/search?period=${p}`);
      setData(res);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(period); }, [fetchData, period]);

  const popularColumns: Column<{ query: string; count: number }>[] = [
    { key: "query", header: "Search Query", render: (s) => <span className="text-sm font-medium text-dnews-dark">{s.query}</span> },
    { key: "count", header: "Searches", render: (s) => <span className="text-sm font-semibold">{s.count}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/analytics" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-xl font-bold text-dnews-dark">Search Analytics</h2>
            <p className="mt-1 text-sm text-dnews-muted">What readers are searching for.</p>
          </div>
        </div>
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      {loading && <LoadingState />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Total Searches" value={data.totalSearches} icon={Search} variant="default" />
            <StatsCard label="No Results" value={data.noResultSearches} icon={XCircle} variant={data.noResultSearches > 0 ? "red" : "default"} />
            <StatsCard label="No Result Rate" value={`${data.noResultRate}%`} icon={AlertTriangle} variant={data.noResultRate > 20 ? "red" : "default"} />
            <StatsCard label="Unique Queries" value={data.popularSearches.length} icon={TrendingUp} variant="default" />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {data.popularSearches.length > 0 && (
              <div className="rounded-sm border border-dnews-border bg-dnews-card">
                <div className="border-b border-dnews-border px-4 py-3">
                  <h3 className="text-sm font-semibold text-dnews-dark">Popular Searches</h3>
                </div>
                <DataTable columns={popularColumns} data={data.popularSearches} keyExtractor={(s: any) => s.query} loading={false}
                  emptyTitle="No searches" emptyDescription="Search queries will appear here." />
              </div>
            )}
            {data.noResultQueries.length > 0 && (
              <div className="rounded-sm border border-dnews-border bg-dnews-card">
                <div className="border-b border-dnews-border px-4 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-dnews-dark">
                    <XCircle size={14} className="text-dnews-red" /> No Result Queries
                  </h3>
                </div>
                <div className="divide-y divide-dnews-border">
                  {data.noResultQueries.map((q, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-dnews-dark">&ldquo;{q.query}&rdquo;</span>
                      <span className="text-xs text-dnews-muted">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
