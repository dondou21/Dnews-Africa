"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Download, Trash2, Edit, Users, UserCheck, Clock, Ban, UserX } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Modal";
import LoadingState from "@/components/dashboard/LoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get, patch, del } from "@/lib/api-client";
import type {
  NewsletterSubscriber,
  NewsletterSubscribersResponse,
  NewsletterStats,
  NewsletterStatus,
} from "@/types/newsletter";

const statusFilters = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Blocked", value: "BLOCKED" },
  { label: "Unsubscribed", value: "UNSUBSCRIBED" },
];

const sourceFilters = [
  { label: "All Sources", value: "ALL" },
  { label: "Home Page", value: "HOME_PAGE" },
  { label: "Footer", value: "FOOTER" },
  { label: "Article", value: "ARTICLE" },
  { label: "Popup", value: "POPUP" },
  { label: "Manual", value: "MANUAL" },
];

export default function NewsletterPage() {
  return (
    <RoleGuard roles={["Admin"]}>
      <NewsletterPageContent />
    </RoleGuard>
  );
}

function NewsletterPageContent() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("ALL");
  const [source, setSource] = useState("ALL");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");

  const [editTarget, setEditTarget] = useState<NewsletterSubscriber | null>(null);
  const [editStatus, setEditStatus] = useState<NewsletterStatus>("ACTIVE");
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await get<NewsletterStats>("/newsletter/subscribers/stats");
      setStats(data);
    } catch {
      // stats silently fail
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "15");
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      if (source !== "ALL") params.set("source", source);
      if (sort) params.set("sort", sort);

      const res = await get<NewsletterSubscribersResponse>(`/newsletter/subscribers?${params}`);
      setSubscribers(res.subscribers);
      setPagination(res.pagination);
    } catch {
      setError("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, source, sort]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

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

  const handleSourceFilter = (value: string) => {
    setSource(value);
    setPage(1);
  };

  const openEdit = (sub: NewsletterSubscriber) => {
    setEditTarget(sub);
    setEditStatus(sub.status);
    setEditName(sub.name || "");
    setEditError("");
    setEditing(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditError("");
    try {
      const body: Record<string, unknown> = { status: editStatus };
      if (editName !== (editTarget.name || "")) body.name = editName;
      await patch(`/newsletter/subscribers/${editTarget.id}`, body);
      setSuccess("Subscriber updated successfully.");
      setEditing(false);
      setEditTarget(null);
      fetchSubscribers();
      fetchStats();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : "Update failed.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/newsletter/subscribers/${deleteTarget.id}`);
      setSuccess("Subscriber removed successfully.");
      setDeleteTarget(null);
      fetchSubscribers();
      fetchStats();
    } catch {
      setError("Failed to remove subscriber.");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const headers = ["Email", "Name", "Status", "Verified", "Source", "Subscribed Date"];
    const rows = subscribers.map((s) => [
      s.email,
      s.name || "",
      s.status,
      s.verified ? "Yes" : "No",
      s.source || "",
      new Date(s.subscribedAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<NewsletterSubscriber>[] = [
    {
      key: "email",
      header: "Email",
      render: (s) => (
        <div>
          <p className="text-sm font-medium text-dnews-dark">{s.email}</p>
          {s.name && <p className="text-xs text-dnews-muted">{s.name}</p>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: "verified",
      header: "Verified",
      className: "text-center",
      render: (s) => (
        <span className={`text-xs font-medium ${s.verified ? "text-green-600" : "text-dnews-muted"}`}>
          {s.verified ? "Yes" : "No"}
        </span>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (s) => (
        <span className="text-xs text-dnews-gray">
          {s.source ? s.source.replace("_", " ") : "—"}
        </span>
      ),
    },
    {
      key: "subscribedAt",
      header: "Date",
      render: (s) => (
        <span className="whitespace-nowrap text-xs text-dnews-muted">
          {new Date(s.subscribedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(s)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
            title="Edit subscriber"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(s)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
            title="Remove subscriber"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            Newsletter Subscribers
          </h2>
          <p className="mt-1 text-sm text-dnews-muted">
            {pagination.total > 0
              ? `${pagination.total} subscriber${pagination.total !== 1 ? "s" : ""} total`
              : "Manage your newsletter subscriber list."}
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={subscribers.length === 0}
          className="flex items-center gap-2 rounded-sm border border-dnews-border px-3 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray disabled:opacity-50"
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-sm bg-dnews-border/50" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatsCard label="Total" value={stats.total} icon={Users} variant="default" />
          <StatsCard label="Active" value={stats.active} icon={UserCheck} variant="default" />
          <StatsCard label="Pending" value={stats.pending} icon={Clock} variant="red" />
          <StatsCard label="Blocked" value={stats.blocked} icon={Ban} variant="red" />
          <StatsCard label="Unsubscribed" value={stats.unsubscribed} icon={UserX} variant="red" />
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
            value={source}
            onChange={(e) => handleSourceFilter(e.target.value)}
            className="rounded-sm border border-dnews-border bg-dnews-bg px-2 py-1.5 text-xs text-dnews-gray outline-none"
          >
            {sourceFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search email or name..."
              className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
        </form>
      </div>

      <DataTable
        columns={columns}
        data={subscribers}
        keyExtractor={(s) => s.id}
        loading={loading}
        emptyTitle="No subscribers found"
        emptyDescription={
          search || status !== "ALL" || source !== "ALL"
            ? "Try adjusting your search or filters."
            : "No newsletter subscribers yet."
        }
      />

      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <Modal
        open={editing}
        onClose={() => { setEditing(false); setEditTarget(null); }}
        title="Edit Subscriber"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setEditing(false); setEditTarget(null); }}
              className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              Save Changes
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {editError && (
            <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-3 py-2">
              <p className="text-xs font-medium text-dnews-red">{editError}</p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Email
            </label>
            <p className="text-sm text-dnews-dark">{editTarget?.email}</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as NewsletterStatus)}
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="BLOCKED">Blocked</option>
              <option value="UNSUBSCRIBED">Unsubscribed</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Subscriber"
        size="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-red/80 disabled:opacity-60"
            >
              {deleting ? "Removing..." : "Remove"}
            </button>
          </>
        }
      >
        <p className="text-sm text-dnews-gray">
          Are you sure you want to remove{" "}
          <span className="font-medium text-dnews-dark">
            {deleteTarget?.email}
          </span>
          ? This will mark them as unsubscribed.
        </p>
      </Modal>
    </div>
  );
}
