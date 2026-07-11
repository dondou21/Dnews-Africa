"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { Plus, Search, Edit, Trash2, Globe, Mail, Phone } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Modal";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get, post, patch, del } from "@/lib/api-client";
import type { Advertiser, AdvertisersResponse } from "@/types/advertisement";

export default function AdvertisersPage() {
  return (<RoleGuard roles={["Admin"]}><AdvertisersContent /></RoleGuard>);
}

function AdvertisersContent() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
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
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Advertiser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAdvertisers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      const res = await get<AdvertisersResponse>(`/advertisers?${params}`);
      setAdvertisers(res.advertisers);
      setPagination(res.pagination);
    } catch { setError("Failed to load advertisers."); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchAdvertisers(); }, [fetchAdvertisers]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); } }, [success]);

  const resetForm = () => { setCompanyName(""); setContactName(""); setEmail(""); setPhone(""); setWebsite(""); setNotes(""); setEditingId(null); };

  const openEdit = (a: Advertiser) => {
    setCompanyName(a.companyName); setContactName(a.contactName || ""); setEmail(a.email || "");
    setPhone(a.phone || ""); setWebsite(a.website || ""); setNotes(a.notes || "");
    setEditingId(a.id); setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (!companyName) { setError("Company name is required."); return; }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { companyName, contactName: contactName || undefined, email: email || undefined, phone: phone || undefined, website: website || undefined, notes: notes || undefined };
      if (editingId) { await patch(`/advertisers/${editingId}`, body); } else { await post("/advertisers", body); }
      setSuccess(editingId ? "Advertiser updated." : "Advertiser created.");
      setShowForm(false); resetForm(); fetchAdvertisers();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true);
    try { await del(`/advertisers/${deleteTarget.id}`); setAdvertisers((prev) => prev.filter((a) => a.id !== deleteTarget.id)); setSuccess("Advertiser deleted."); setDeleteTarget(null); }
    catch { setError("Failed to delete."); } finally { setDeleting(false); }
  };

  const columns: Column<Advertiser>[] = [
    { key: "companyName", header: "Company", render: (a) => <span className="text-sm font-medium text-dnews-dark">{a.companyName}</span> },
    { key: "contactName", header: "Contact", render: (a) => <span className="text-xs text-dnews-muted">{a.contactName || "—"}</span> },
    { key: "email", header: "Email", render: (a) => a.email ? <a href={`mailto:${a.email}`} className="text-xs text-dnews-accent hover:underline">{a.email}</a> : <span className="text-xs text-dnews-muted">—</span> },
    { key: "phone", header: "Phone", render: (a) => <span className="text-xs text-dnews-muted">{a.phone || "—"}</span> },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    {
      key: "actions", header: "Actions", className: "text-right",
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          {a.website && <a href={a.website} target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent" title="Website"><Globe size={14} /></a>}
          <button onClick={() => openEdit(a)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent" title="Edit"><Edit size={14} /></button>
          <button onClick={() => setDeleteTarget(a)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-red" title="Delete"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="font-heading text-xl font-bold text-dnews-dark">Advertisers</h2><p className="mt-1 text-sm text-dnews-muted">{pagination.total > 0 ? `${pagination.total} advertiser${pagination.total !== 1 ? "s" : ""}` : "Manage advertisers."}</p></div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"><Plus size={14} /> New Advertiser</button>
      </div>
      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      {success && <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20"><p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p></div>}

      <div className="flex items-center justify-between">
        <div />
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search advertisers..." className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
          </div>
        </form>
      </div>

      <DataTable columns={columns} data={advertisers} keyExtractor={(a) => a.id} loading={loading} emptyTitle="No advertisers" emptyDescription="Create your first advertiser." />
      {pagination.totalPages > 1 && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={showForm} onClose={() => { setShowForm(false); resetForm(); }} title={editingId ? "Edit Advertiser" : "New Advertiser"} size="md"
        footer={<><button onClick={() => { setShowForm(false); resetForm(); }} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button><button onClick={handleSubmit} disabled={submitting} className="rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{submitting ? "Saving..." : editingId ? "Update" : "Create"}</button></>}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Company Name</label><input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Contact Name</label><input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Phone</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Website</label><input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          </div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Advertiser" size="sm"
        footer={<><button onClick={() => setDeleteTarget(null)} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button><button onClick={handleDelete} disabled={deleting} className="rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{deleting ? "Deleting..." : "Delete"}</button></>}>
        <p className="text-sm text-dnews-gray">Delete <span className="font-medium text-dnews-dark">{deleteTarget?.companyName}</span>? This will also remove their ads and campaigns.</p>
      </Modal>
    </div>
  );
}
