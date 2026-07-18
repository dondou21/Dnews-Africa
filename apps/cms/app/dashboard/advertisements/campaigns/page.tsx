"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { Plus, Search, Trash2, Edit } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Modal";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get, post, patch, del } from "@dnews/api-client";
import type { AdCampaign, AdCampaignsResponse } from "@dnews/types";

export default function AdCampaignsPage() {
  return (<RoleGuard roles={["Admin"]}><CampaignsContent /></RoleGuard>);
}

function CampaignsContent() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [advertisers, setAdvertisers] = useState<{ id: string; companyName: string }[]>([]);
  const [name, setName] = useState("");
  const [advertiserId, setAdvertiserId] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdCampaign | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      const res = await get<AdCampaignsResponse>(`/ad-campaigns?${params}`);
      setCampaigns(res.campaigns);
      setPagination(res.pagination);
    } catch { setError("Failed to load campaigns."); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);
  useEffect(() => { get<{ id: string; companyName: string }[]>("/advertisers/list").then(setAdvertisers).catch(() => {}); }, []);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); } }, [success]);

  const resetForm = () => { setName(""); setAdvertiserId(""); setBudget(""); setStartDate(""); setEndDate(""); setEditingId(null); };

  const openEdit = (c: AdCampaign) => {
    setName(c.name); setAdvertiserId(c.advertiserId); setBudget(c.budget ? String(c.budget) : "");
    setStartDate(c.startDate ? c.startDate.split("T")[0] : ""); setEndDate(c.endDate ? c.endDate.split("T")[0] : "");
    setEditingId(c.id); setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (!name || !advertiserId) { setError("Name and advertiser are required."); return; }
    setSubmitting(true);
    try {
      const body = { name, advertiserId, budget: budget ? Number(budget) : undefined, startDate: startDate || undefined, endDate: endDate || undefined };
      if (editingId) { await patch(`/ad-campaigns/${editingId}`, body); } else { await post("/ad-campaigns", body); }
      setSuccess(editingId ? "Campaign updated." : "Campaign created.");
      setShowForm(false); resetForm(); fetchCampaigns();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true);
    try { await del(`/ad-campaigns/${deleteTarget.id}`); setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget.id)); setSuccess("Campaign deleted."); setDeleteTarget(null); }
    catch { setError("Failed to delete."); } finally { setDeleting(false); }
  };

  const columns: Column<AdCampaign>[] = [
    { key: "name", header: "Name", render: (c) => <span className="text-sm font-medium text-dnews-dark">{c.name}</span> },
    { key: "advertiser", header: "Advertiser", render: (c) => <span className="text-xs text-dnews-muted">{c.advertiser.companyName}</span> },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "budget", header: "Budget", render: (c) => <span className="text-xs text-dnews-gray">{c.budget ? `$${c.budget}` : "—"}</span> },
    { key: "totalAds", header: "Ads", className: "text-center", render: (c) => <span className="text-xs text-dnews-gray">{c._count?.ads || 0}</span> },
    {
      key: "actions", header: "Actions", className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEdit(c)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent" title="Edit"><Edit size={14} /></button>
          <button onClick={() => setDeleteTarget(c)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-red" title="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="font-heading text-xl font-bold text-dnews-dark">Ad Campaigns</h2><p className="mt-1 text-sm text-dnews-muted">{pagination.total > 0 ? `${pagination.total} campaign${pagination.total !== 1 ? "s" : ""}` : "Manage advertising campaigns."}</p></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"><Plus size={14} /> New Campaign</button>
      </div>
      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      {success && <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20"><p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p></div>}

      <div className="flex items-center justify-between">
        <div />
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search campaigns..." className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
          </div>
        </form>
      </div>

      <DataTable columns={columns} data={campaigns} keyExtractor={(c) => c.id} loading={loading} emptyTitle="No campaigns" emptyDescription="Create your first ad campaign." />
      {pagination.totalPages > 1 && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editingId ? "Edit Campaign" : "New Campaign"} size="md"
        footer={<><button onClick={() => { setShowForm(false); resetForm(); }} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button><button onClick={handleSubmit} disabled={submitting} className="rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{submitting ? "Saving..." : editingId ? "Update" : "Create"}</button></>}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Advertiser</label><select value={advertiserId} onChange={(e) => setAdvertiserId(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent"><option value="">Select</option>{advertisers.map((a) => <option key={a.id} value={a.id}>{a.companyName}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Budget</label><input type="number" step="0.01" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Start Date</label><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">End Date</label><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Campaign" size="sm"
        footer={<><button onClick={() => setDeleteTarget(null)} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button><button onClick={handleDelete} disabled={deleting} className="rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{deleting ? "Deleting..." : "Delete"}</button></>}>
        <p className="text-sm text-dnews-gray">Delete <span className="font-medium text-dnews-dark">{deleteTarget?.name}</span>?</p>
      </Modal>
    </div>
  );
}
