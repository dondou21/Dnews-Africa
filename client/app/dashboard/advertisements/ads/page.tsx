"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Eye, Edit, Trash2, Play, Pause } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Modal";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get, patch, del } from "@/lib/api-client";
import { resolveImageUrl } from "@/lib/image";
import type { Advertisement, AdvertisementsResponse } from "@/types/advertisement";

const statusFilters = [
  { label: "All", value: "ALL" }, { label: "Active", value: "ACTIVE" },
  { label: "Paused", value: "PAUSED" }, { label: "Expired", value: "EXPIRED" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function AdsListPage() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Moderator"]}>
      <AdsListContent />
    </RoleGuard>
  );
}

function AdsListContent() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Advertisement | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<Advertisement | null>(null);

  const fetchAds = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      const res = await get<AdvertisementsResponse>(`/advertisements?${params}`);
      setAds(res.advertisements);
      setPagination(res.pagination);
    } catch { setError("Failed to load advertisements."); } finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchAds(); }, [fetchAds]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); } }, [success]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearch(searchInput); setPage(1); };

  const handleStatusChange = async (ad: Advertisement, newStatus: string) => {
    try {
      await patch(`/advertisements/${ad.id}`, { status: newStatus });
      setSuccess(`Ad ${newStatus.toLowerCase()}.`);
      fetchAds();
    } catch { setError("Failed to update ad status."); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/advertisements/${deleteTarget.id}`);
      setAds((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setSuccess("Ad deleted.");
      setDeleteTarget(null);
    } catch { setError("Failed to delete ad."); } finally { setDeleting(false); }
  };

  const columns: Column<Advertisement>[] = [
    { key: "title", header: "Title", render: (a) => <span className="text-sm font-medium text-dnews-dark">{a.title}</span> },
    { key: "type", header: "Type", render: (a) => <span className="text-xs text-dnews-muted">{a.type}</span> },
    { key: "placement", header: "Placement", render: (a) => <span className="text-xs text-dnews-muted">{a.placement.replace(/_/g, " ")}</span> },
    { key: "advertiser", header: "Advertiser", render: (a) => <span className="text-xs text-dnews-muted">{a.advertiser.companyName}</span> },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { key: "stats", header: "Impr./Clicks", className: "text-center", render: (a) => <span className="text-xs text-dnews-gray">{a.impressions}/{a.clicks}</span> },
    {
      key: "actions", header: "Actions", className: "text-right",
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setPreviewTarget(a)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent" title="Preview"><Eye size={14} /></button>
          <Link href={`/dashboard/advertisements/ads/${a.id}/edit`} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent" title="Edit"><Edit size={14} /></Link>
          {a.status === "ACTIVE" && <button onClick={() => handleStatusChange(a, "PAUSED")} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-yellow-600" title="Pause"><Pause size={14} /></button>}
          {a.status === "PAUSED" && <button onClick={() => handleStatusChange(a, "ACTIVE")} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-green-600" title="Resume"><Play size={14} /></button>}
          {a.status !== "ARCHIVED" && <button onClick={() => setDeleteTarget(a)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red" title="Delete"><Trash2 size={14} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">Advertisements</h2>
          <p className="mt-1 text-sm text-dnews-muted">{pagination.total > 0 ? `${pagination.total} ad${pagination.total !== 1 ? "s" : ""}` : "Manage advertisements."}</p>
        </div>
        <Link href="/dashboard/advertisements/ads/new" className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"><Plus size={14} /> New Ad</Link>
      </div>

      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      {success && <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20"><p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p></div>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((f) => (
            <button key={f.value} onClick={() => { setStatus(f.value); setPage(1); }}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${status === f.value ? "bg-dnews-accent text-white" : "border border-dnews-border text-dnews-gray hover:bg-dnews-light-gray"}`}>{f.label}</button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search ads..." className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent" />
          </div>
        </form>
      </div>

      <DataTable columns={columns} data={ads} keyExtractor={(a) => a.id} loading={loading}
        emptyTitle="No advertisements found" emptyDescription={search || status !== "ALL" ? "Try adjusting filters." : "Create your first advertisement."}
        emptyAction={<Link href="/dashboard/advertisements/ads/new" className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"><Plus size={14} /> New Ad</Link>}
      />

      {pagination.totalPages > 1 && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={!!previewTarget} onClose={() => setPreviewTarget(null)} title={`Preview: ${previewTarget?.title}`} size="md">
        {previewTarget && (
          <div className="space-y-4">
            {previewTarget.image?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveImageUrl(previewTarget.image.url)} alt={previewTarget.image.alt || ""} className="w-full rounded-sm object-cover max-h-48" />
            )}
            <p className="text-sm text-dnews-dark">{previewTarget.description || "No description."}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="font-semibold text-dnews-gray">Type:</span> {previewTarget.type}</div>
              <div><span className="font-semibold text-dnews-gray">Placement:</span> {previewTarget.placement}</div>
              <div><span className="font-semibold text-dnews-gray">Status:</span> {previewTarget.status}</div>
              <div><span className="font-semibold text-dnews-gray">Target:</span> <a href={previewTarget.targetUrl} target="_blank" rel="noopener noreferrer" className="text-dnews-accent underline">{previewTarget.targetUrl}</a></div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Advertisement" size="sm"
        footer={<><button onClick={() => setDeleteTarget(null)} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button><button onClick={handleDelete} disabled={deleting} className="rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{deleting ? "Deleting..." : "Delete"}</button></>}
      >
        <p className="text-sm text-dnews-gray">Delete <span className="font-medium text-dnews-dark">{deleteTarget?.title}</span>? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
