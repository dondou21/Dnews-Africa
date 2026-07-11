"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Play, Pause, TrendingUp, MousePointerClick, Eye } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get } from "@/lib/api-client";
import type { AdStats } from "@/types/advertisement";

export default function AdDashboardPage() {
  return (
    <RoleGuard roles={["Admin"]}>
      <AdDashboardContent />
    </RoleGuard>
  );
}

function AdDashboardContent() {
  const [stats, setStats] = useState<AdStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await get<AdStats>("/advertisements/stats");
        setStats(data);
      } catch { setError("Failed to load stats."); } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-sm bg-dnews-border/50" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">Advertisements Dashboard</h2>
          <p className="mt-1 text-sm text-dnews-muted">Overview of all advertisement activities.</p>
        </div>
        <Link href="/dashboard/advertisements/ads/new" className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light">
          <Newspaper size={14} /> New Ad
        </Link>
      </div>

      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Total Ads" value={stats.total} icon={Newspaper} variant="default" />
            <StatsCard label="Active" value={stats.active} icon={Play} variant="default" />
            <StatsCard label="Paused" value={stats.paused} icon={Pause} variant="red" />
            <StatsCard label="Expired" value={stats.expired} icon={Eye} variant="red" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatsCard label="Total Impressions" value={stats.totalImpressions} icon={Eye} variant="default" />
            <StatsCard label="Total Clicks" value={stats.totalClicks} icon={MousePointerClick} variant="default" />
            <StatsCard label="CTR" value={`${stats.ctr}%`} icon={TrendingUp} variant="default" />
          </div>
        </>
      )}
    </div>
  );
}
