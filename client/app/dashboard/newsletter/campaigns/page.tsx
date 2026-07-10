"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Send, Clock, Ban, FileText } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Modal";
import LoadingState from "@/components/dashboard/LoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import RoleGuard from "@/components/dashboard/RoleGuard";
import CampaignPreview from "@/components/newsletter/CampaignPreview";
import { get, post, del } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import type { Campaign, CampaignsResponse, CampaignStats } from "@/types/campaign";

const statusFilters = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Sending", value: "SENDING" },
  { label: "Sent", value: "SENT" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function CampaignsPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <CampaignsPageContent />
    </RoleGuard>
  );
}

function CampaignsPageContent() {
  const { user } = useAuth();
  const isAdmin = user?.role.name === "Admin";

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");

  const [previewCampaign, setPreviewCampaign] = useState<Campaign | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Campaign | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [sendingTarget, setSendingTarget] = useState<Campaign | null>(null);
  const [sendingConfirm, setSendingConfirm] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await get<CampaignStats>("/newsletter/campaigns/stats");
      setStats(data);
    } catch {
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "15");
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      if (sort) params.set("sort", sort);

      const res = await get<CampaignsResponse>(`/newsletter/campaigns?${params}`);
      setCampaigns(res.campaigns);
      setPagination(res.pagination);
    } catch {
      setError("Failed to load campaigns.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, sort]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleSend = async () => {
    if (!sendingTarget) return;
    setSendingConfirm(false);
    try {
      await post(`/newsletter/campaigns/${sendingTarget.id}/send`);
      setSuccess("Campaign sending started.");
      setSendingTarget(null);
      fetchCampaigns();
      fetchStats();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send campaign.");
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await post(`/newsletter/campaigns/${cancelTarget.id}/cancel`);
      setSuccess("Campaign cancelled.");
      setCancelTarget(null);
      fetchCampaigns();
      fetchStats();
    } catch {
      setError("Failed to cancel campaign.");
    } finally {
      setCancelling(false);
    }
  };

  const columns: Column<Campaign>[] = [
    {
      key: "title",
      header: "Campaign",
      render: (c) => (
        <div>
          <Link
            href={`/dashboard/newsletter/campaigns/${c.id}`}
            className="text-sm font-medium text-dnews-dark hover:text-dnews-accent transition-colors"
          >
            {c.title}
          </Link>
          <p className="text-xs text-dnews-muted mt-0.5">{c.subject}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "totalRecipients",
      header: "Recipients",
      className: "text-center",
      render: (c) => (
        <span className="text-xs text-dnews-gray">
          {c.totalRecipients > 0
            ? `${c.totalSent}/${c.totalRecipients}`
            : `${c._count.recipients}`}
        </span>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      render: (c) => (
        <span className="text-xs text-dnews-muted">
          {c.createdBy.firstName} {c.createdBy.lastName}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (c) => (
        <span className="whitespace-nowrap text-xs text-dnews-muted">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setPreviewCampaign(c)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
            title="Preview"
          >
            <Eye size={14} />
          </button>
          <Link
            href={`/dashboard/newsletter/campaigns/${c.id}/edit`}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
            title="Edit"
          >
            <Edit size={14} />
          </Link>
          {isAdmin && c.status === "DRAFT" && (
            <button
              onClick={() => { setSendingTarget(c); setSendingConfirm(true); }}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-green-600"
              title="Send"
            >
              <Send size={14} />
            </button>
          )}
          {isAdmin && (c.status === "SCHEDULED" || c.status === "DRAFT") && (
            <button
              onClick={() => setCancelTarget(c)}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
              title="Cancel"
            >
              <Ban size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            Newsletter Campaigns
          </h2>
          <p className="mt-1 text-sm text-dnews-muted">
            {pagination.total > 0
              ? `${pagination.total} campaign${pagination.total !== 1 ? "s" : ""} total`
              : "Create and manage newsletter campaigns."}
          </p>
        </div>
        <Link
          href="/dashboard/newsletter/campaigns/new"
          className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
        >
          <Plus size={14} />
          New Campaign
        </Link>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-sm bg-dnews-border/50" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard label="Total" value={stats.total} icon={FileText} variant="default" />
          <StatsCard label="Drafts" value={stats.drafts} icon={FileText} variant="default" />
          <StatsCard label="Scheduled" value={stats.scheduled} icon={Clock} variant="default" />
          <StatsCard label="Sending" value={stats.sending} icon={Send} variant="red" />
          <StatsCard label="Sent" value={stats.sent} icon={Send} variant="default" />
        </div>
      ) : null}

      {error && (
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusFilter(f.value)}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                status === f.value
                  ? "bg-dnews-accent text-white"
                  : "border border-dnews-border text-dnews-gray hover:bg-dnews-light-gray"
              }`}
            >
              {f.label}
            </button>
          ))}

          <span className="mx-1 w-px bg-dnews-border" />

          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-xs text-dnews-gray outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
          </select>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search campaigns..."
              className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
        </form>
      </div>

      <DataTable
        columns={columns}
        data={campaigns}
        keyExtractor={(c) => c.id}
        loading={loading}
        emptyTitle="No campaigns found"
        emptyDescription={
          search || status !== "ALL"
            ? "Try adjusting your search or filters."
            : "Create your first newsletter campaign to get started."
        }
        emptyAction={
          <Link
            href="/dashboard/newsletter/campaigns/new"
            className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
          >
            <Plus size={14} />
            New Campaign
          </Link>
        }
      />

      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <CampaignPreview
        campaign={previewCampaign}
        onClose={() => setPreviewCampaign(null)}
      />

      <Modal
        open={sendingConfirm}
        onClose={() => { setSendingConfirm(false); setSendingTarget(null); }}
        title="Send Campaign"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setSendingConfirm(false); setSendingTarget(null); }}
              className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              <Send size={14} />
              Send Now
            </button>
          </>
        }
      >
        <p className="text-sm text-dnews-gray">
          Are you sure you want to send{" "}
          <span className="font-medium text-dnews-dark">
            {sendingTarget?.title}
          </span>
          ? This will send the campaign to all active subscribers immediately.
        </p>
      </Modal>

      <Modal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Cancel Campaign"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setCancelTarget(null)}
              className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            >
              Close
            </button>
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-2 rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-red/80 disabled:opacity-60"
            >
              {cancelling ? "Cancelling..." : "Cancel Campaign"}
            </button>
          </>
        }
      >
        <p className="text-sm text-dnews-gray">
          Are you sure you want to cancel{" "}
          <span className="font-medium text-dnews-dark">
            {cancelTarget?.title}
          </span>
          ? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
