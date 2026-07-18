"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Send, Eye, MousePointerClick, TrendingUp, UserMinus, Activity } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import LoadingState from "@/components/dashboard/LoadingState";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get } from "@dnews/api-client";
import type { DashboardAnalytics } from "@dnews/types";

export default function AnalyticsPage() {
  return (
    <RoleGuard roles={["Admin"]}>
      <AnalyticsContent />
    </RoleGuard>
  );
}

function AnalyticsContent() {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const result = await get<DashboardAnalytics>("/newsletter/reports/dashboard");
        setData(result);
      } catch {
        setError("Failed to load analytics.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-sm bg-dnews-border/50" />)}</div><LoadingState variant="card" rows={2} /></div>;

  if (error) return <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>;

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">Newsletter Analytics</h2>
        <p className="mt-1 text-sm text-dnews-muted">Performance metrics and subscriber insights.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Subscribers" value={data.subscribers.total} icon={Users} variant="default" />
        <StatsCard label="Active Subscribers" value={data.subscribers.active} icon={Users} variant="default" />
        <StatsCard label="Campaigns Sent" value={data.campaigns.sent} icon={Send} variant="default" />
        <StatsCard label="Unsubscribed" value={data.subscribers.unsubscribed} icon={UserMinus} variant="red" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Delivered" value={data.delivery.delivered} icon={Send} variant="default" />
        <StatsCard label="Delivery Rate" value={`${data.delivery.deliveryRate}%`} icon={Activity} variant="default" />
        <StatsCard label="Open Rate" value={`${data.engagement.openRate}%`} icon={Eye} variant="default" />
        <StatsCard label="Click Rate" value={`${data.engagement.clickRate}%`} icon={MousePointerClick} variant="default" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
          <h3 className="mb-3 font-heading text-sm font-semibold text-dnews-dark">Engagement</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">Total Opens</p>
              <p className="mt-1 font-heading text-2xl font-bold text-dnews-dark">{data.engagement.totalOpens}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">Total Clicks</p>
              <p className="mt-1 font-heading text-2xl font-bold text-dnews-dark">{data.engagement.totalClicks}</p>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
          <h3 className="mb-3 font-heading text-sm font-semibold text-dnews-dark">Delivery</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">Total Sent</p>
              <p className="mt-1 font-heading text-2xl font-bold text-dnews-dark">{data.delivery.total}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-dnews-muted">Failed</p>
              <p className="mt-1 font-heading text-2xl font-bold text-dnews-red">{data.delivery.failed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
        <h3 className="mb-3 font-heading text-sm font-semibold text-dnews-dark">Recent Campaigns</h3>
        {data.campaigns.recent.length === 0 ? (
          <p className="text-sm text-dnews-muted">No campaigns sent yet.</p>
        ) : (
          <div className="space-y-2">
            {data.campaigns.recent.map((c: any) => (
              <Link key={c.id} href={`/dashboard/newsletter/campaigns/${c.id}`} className="flex items-center justify-between rounded-sm border border-dnews-border/50 px-3 py-2 transition-colors hover:bg-dnews-light-gray">
                <span className="text-sm font-medium text-dnews-dark">{c.title}</span>
                <div className="flex items-center gap-4 text-xs text-dnews-muted">
                  <span>{c.totalRecipients} recipients</span>
                  <span>{c.totalOpened} opens</span>
                  <span>{c.totalClicked} clicks</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
