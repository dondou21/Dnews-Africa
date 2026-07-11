"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Download, Calendar, RefreshCw, BarChart3, AlertCircle, Users } from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import DateRangeFilter from "@/components/analytics/DateRangeFilter";
import LineChart from "@/components/analytics/LineChart";
import BarChart from "@/components/analytics/BarChart";
import PieChart from "@/components/analytics/PieChart";
import { get, post } from "@/lib/api-client";
import type { ReportSummary, AnalyticsExport } from "@/types/analytics";
import { SOURCE_LABELS, SOURCE_COLORS, formatDuration, formatNumber } from "@/types/analytics";

export default function ReportsPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><ReportsContent /></RoleGuard>);
}

function ReportsContent() {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [exports, setExports] = useState<AnalyticsExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [period, setPeriod] = useState("7d");
  const [error, setError] = useState("");

  const fetchReport = useCallback(async (p: string) => {
    setLoading(true); setError("");
    try {
      const end = new Date().toISOString();
      const start = new Date(Date.now() - (p === "24h" ? 86400000 : p === "7d" ? 604800000 : p === "30d" ? 2592000000 : p === "90d" ? 7776000000 : 31536000000)).toISOString();
      const res = await post<ReportSummary>("/analytics/reports/generate", { exportType: p, periodStart: start, periodEnd: end, filters: {} });
      setReport(res);
    } catch {
      setError("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExports = useCallback(async () => {
    try {
      const res = await get<AnalyticsExport[]>("/analytics/reports/exports");
      setExports(res);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchReport(period);
    if (period === "7d") fetchExports();
  }, [fetchReport, fetchExports, period]);

  const handleExport = async (format: string) => {
    if (!report) return;
    setGenerating(true);
    try {
      await post("/analytics/reports/export", {
        exportType: period, format,
        periodStart: report.period.start,
        periodEnd: report.period.end,
        filters: {},
      });
      fetchExports();
    } catch {
      setError("Export failed.");
    } finally {
      setGenerating(false);
    }
  };

  const trafficData = report?.trafficSources?.map((t) => ({
    label: SOURCE_LABELS[t.source] || t.source,
    value: t.views,
    color: SOURCE_COLORS[t.source] || "#9ca3af",
  })) ?? [];

  const trendData = report?.dailyTrend?.map((d) => ({ label: d.date.slice(5), value: d.pageViews })) ?? [];

  const exportColumns: Column<AnalyticsExport>[] = [
    { key: "exportType", header: "Type", render: (e) => <span className="text-sm capitalize">{e.exportType}</span> },
    { key: "format", header: "Format", render: (e) => <span className="text-xs font-mono uppercase">{e.format}</span> },
    { key: "status", header: "Status", render: (e) => (
      <span className={`text-xs font-medium ${e.status === "completed" ? "text-green-600" : "text-amber-600"}`}>{e.status}</span>
    )},
    { key: "createdAt", header: "Date", render: (e) => <span className="text-xs text-dnews-gray">{new Date(e.createdAt).toLocaleDateString()}</span> },
    { key: "periodStart", header: "Period", render: (e) => (
      <span className="text-xs text-dnews-muted">{new Date(e.periodStart).toLocaleDateString()} - {new Date(e.periodEnd).toLocaleDateString()}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/analytics" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-xl font-bold text-dnews-dark">Reports</h2>
            <p className="mt-1 text-sm text-dnews-muted">Generate and export analytics reports.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DateRangeFilter value={period} onChange={setPeriod} />
          <button onClick={() => fetchReport(period)} disabled={loading}
            className="flex items-center gap-1.5 rounded-sm border border-dnews-border px-3 py-1.5 text-xs font-medium text-dnews-gray hover:bg-dnews-light-gray">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <AlertCircle size={14} className="text-dnews-red" />
          <p className="text-xs text-dnews-red">{error}</p>
        </div>
      )}

      {loading && <LoadingState />}

      {report && !loading && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard label="Total Page Views" value={formatNumber(report.summary.totalPageViews)} icon={BarChart3} variant="default" />
            <StatsCard label="Unique Visitors" value={formatNumber(report.summary.uniqueVisitors)} icon={Users} variant="default" />
            <StatsCard label="Sessions" value={formatNumber(report.summary.totalSessions)} icon={Calendar} variant="default" />
            <StatsCard label="Avg Duration" value={formatDuration(report.summary.avgSessionDuration)} icon={BarChart3} variant="default" />
            <StatsCard label="Bounce Rate" value={`${report.summary.bounceRate.toFixed(1)}%`} icon={BarChart3} variant={report.summary.bounceRate > 50 ? "red" : "default"} />
            <StatsCard label="Pages/Session" value={report.summary.pagesPerSession.toFixed(1)} icon={BarChart3} variant="default" />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => handleExport("csv")} disabled={generating}
              className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60">
              <Download size={14} /> {generating ? "Exporting..." : "Export CSV"}
            </button>
            <button onClick={() => handleExport("xlsx")} disabled={generating}
              className="flex items-center gap-2 rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray disabled:opacity-60">
              <FileText size={14} /> Export XLSX
            </button>
          </div>

          {trendData.length > 0 && (
            <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
              <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Daily Trend</h3>
              <LineChart data={trendData} height={220} />
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {trafficData.length > 0 && (
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Traffic Sources</h3>
                <PieChart data={trafficData} size={200} innerRadius={65} />
              </div>
            )}
            {report.searchAnalytics && (
              <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
                <h3 className="mb-3 text-sm font-semibold text-dnews-dark">Search Analytics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-dnews-gray">Total Searches:</span><span className="text-sm font-semibold">{report.searchAnalytics.totalSearches}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-dnews-gray">No Result Rate:</span><span className="text-sm font-semibold">{report.searchAnalytics.noResultRate}%</span></div>
                </div>
                {report.searchAnalytics.popularSearches.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-medium text-dnews-gray">Popular Searches</p>
                    {report.searchAnalytics.popularSearches.slice(0, 5).map((s, i) => (
                      <div key={i} className="flex justify-between text-xs"><span>{s.query}</span><span className="font-medium">{s.count}</span></div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {exports.length > 0 && (
            <div className="rounded-sm border border-dnews-border bg-dnews-card">
              <div className="border-b border-dnews-border px-4 py-3">
                <h3 className="text-sm font-semibold text-dnews-dark">Export History</h3>
              </div>
              <DataTable columns={exportColumns} data={exports} keyExtractor={(e) => e.id} loading={false} />
            </div>
          )}
        </>
      )}
    </div>
  );
}


