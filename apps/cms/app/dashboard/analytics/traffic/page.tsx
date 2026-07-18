"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, ExternalLink } from "lucide-react";
import RoleGuard from "@/components/dashboard/RoleGuard";
import LoadingState from "@/components/dashboard/LoadingState";
import DateRangeFilter from "@/components/analytics/DateRangeFilter";
import BarChart from "@/components/analytics/BarChart";
import PieChart from "@/components/analytics/PieChart";
import { get } from "@dnews/api-client";
import type { TrafficSource } from "@dnews/types";
import { SOURCE_LABELS, SOURCE_COLORS, formatNumber } from "@dnews/types";

export default function TrafficPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><TrafficContent /></RoleGuard>);
}

function TrafficContent() {
  const [data, setData] = useState<TrafficSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  const fetchData = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await get<TrafficSource[]>(`/analytics/traffic?period=${p}`);
      setData(res);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(period); }, [fetchData, period]);

  const chartData = data.map((t) => ({
    label: SOURCE_LABELS[t.source] || t.source,
    value: t.views,
    color: SOURCE_COLORS[t.source] || "#9ca3af",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/analytics" className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="font-heading text-xl font-bold text-dnews-dark">Traffic Sources</h2>
            <p className="mt-1 text-sm text-dnews-muted">Where your readers come from.</p>
          </div>
        </div>
        <DateRangeFilter value={period} onChange={setPeriod} />
      </div>

      {loading && <LoadingState />}

      {data.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
            <h3 className="mb-4 text-sm font-semibold text-dnews-dark">Traffic by Source</h3>
            <BarChart data={chartData} height={250} />
          </div>
          <div className="rounded-sm border border-dnews-border bg-dnews-card p-5 flex items-center justify-center">
            <PieChart data={chartData} size={220} innerRadius={70} />
          </div>
          <div className="rounded-sm border border-dnews-border bg-dnews-card p-5 lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-dnews-dark">Detailed Breakdown</h3>
            <div className="space-y-3">
              {data.map((s) => (
                <div key={s.source} className="flex items-center gap-4">
                  <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: SOURCE_COLORS[s.source] || "#9ca3af" }} />
                  <span className="w-32 text-sm font-medium text-dnews-dark">{SOURCE_LABELS[s.source] || s.source}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-dnews-light-gray overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${s.percentage}%`, backgroundColor: SOURCE_COLORS[s.source] || "#9ca3af" }} />
                      </div>
                      <span className="w-14 text-right text-xs font-semibold text-dnews-dark">{s.percentage}%</span>
                    </div>
                  </div>
                  <span className="w-20 text-right text-sm text-dnews-gray">{formatNumber(s.views)}</span>
                  <span className="w-20 text-right text-xs text-dnews-muted">{formatNumber(s.uniqueVisitors)} unique</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="flex items-center justify-center rounded-sm border border-dnews-border py-12">
          <div className="text-center">
            <Globe size={32} className="mx-auto text-dnews-muted" />
            <p className="mt-2 text-sm text-dnews-muted">No traffic data available yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
