"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { Plus, Search, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Modal";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get, post, patch, del } from "@dnews/api-client";
import type { Redirect, RedirectsResponse } from "@dnews/types";

export default function RedirectsPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><RedirectsContent /></RoleGuard>);
}

function RedirectsContent() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [statusCode, setStatusCode] = useState<"301" | "302">("301");
  const [note, setNote] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Redirect | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRedirects = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await get<RedirectsResponse>(`/redirects?${params}`);
      setRedirects(res.redirects);
      setPagination(res.pagination);
    } catch { setError("Failed to load redirects."); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchRedirects(); }, [fetchRedirects]);
  useEffect(() => { if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); } }, [success]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError("");
    if (!fromPath || !toPath) { setError("Both paths are required."); return; }
    setSubmitting(true);
    try {
      await post("/redirects", { fromPath, toPath, statusCode, note: note || undefined });
      setSuccess("Redirect created.");
      setShowForm(false); setFromPath(""); setToPath(""); setNote(""); fetchRedirects();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed."); } finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleting(true);
    try { await del(`/redirects/${deleteTarget.id}`); setRedirects((prev) => prev.filter((r) => r.id !== deleteTarget.id)); setSuccess("Redirect deleted."); setDeleteTarget(null); }
    catch { setError("Failed to delete."); } finally { setDeleting(false); }
  };

  const toggleActive = async (r: Redirect) => {
    try { await patch(`/redirects/${r.id}`, { active: !r.active }); fetchRedirects(); } catch { setError("Failed to toggle."); }
  };

  const columns: Column<Redirect>[] = [
    { key: "fromPath", header: "From", render: (r) => <code className="text-xs text-dnews-dark">{r.fromPath}</code> },
    { key: "toPath", header: "To", render: (r) => <code className="text-xs text-dnews-accent">{r.toPath}</code> },
    { key: "statusCode", header: "Type", render: (r) => <span className="text-xs font-medium text-dnews-gray">{r.statusCode}</span> },
    { key: "active", header: "Active", render: (r) => (
      <button onClick={() => toggleActive(r)} className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium ${r.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
        {r.active ? "Active" : "Inactive"}
      </button>
    )},
    { key: "note", header: "Note", render: (r) => <span className="text-xs text-dnews-muted">{r.note || "—"}</span> },
    { key: "actions", header: "", className: "text-right", render: (r) => (
      <div className="flex items-center justify-end gap-1">
        <a href={r.fromPath} target="_blank" className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray" title="Test"><ExternalLink size={14} /></a>
        <button onClick={() => setDeleteTarget(r)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-red" title="Delete"><Trash2 size={14} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="font-heading text-xl font-bold text-dnews-dark">Redirects</h2><p className="mt-1 text-sm text-dnews-muted">{pagination.total > 0 ? `${pagination.total} redirect${pagination.total !== 1 ? "s" : ""}` : "Manage URL redirects."}</p></div>
        <button onClick={() => { setShowForm(true); }} className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white"><Plus size={14} /> New Redirect</button>
      </div>
      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      {success && <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20"><p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p></div>}
      <div className="flex items-center justify-between">
        <div />
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search paths..." className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
          </div>
        </form>
      </div>
      <DataTable columns={columns} data={redirects} keyExtractor={(r) => r.id} loading={loading} emptyTitle="No redirects" emptyDescription="Create your first redirect." />
      {pagination.totalPages > 1 && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}

      <Modal open={showForm} onClose={() => { setShowForm(false); }} title="New Redirect" size="md"
        footer={<><button onClick={() => setShowForm(false)} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button><button onClick={handleSubmit} disabled={submitting} className="rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{submitting ? "Saving..." : "Create"}</button></>}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">From Path</label><input type="text" value={fromPath} onChange={(e) => setFromPath(e.target.value)} placeholder="/old-article-slug" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">To Path</label><input type="text" value={toPath} onChange={(e) => setToPath(e.target.value)} placeholder="/new-article-slug" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="sc" value="301" checked={statusCode === "301"} onChange={() => setStatusCode("301")} className="accent-dnews-accent" /><span className="text-sm text-dnews-dark">301 (Permanent)</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="sc" value="302" checked={statusCode === "302"} onChange={() => setStatusCode("302")} className="accent-dnews-accent" /><span className="text-sm text-dnews-dark">302 (Temporary)</span></label>
          </div>
          <div><label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Note</label><input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" /></div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Redirect" size="sm"
        footer={<><button onClick={() => setDeleteTarget(null)} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button><button onClick={handleDelete} disabled={deleting} className="rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{deleting ? "Deleting..." : "Delete"}</button></>}>
        <p className="text-sm text-dnews-gray">Delete redirect from <code className="text-dnews-dark">{deleteTarget?.fromPath}</code> to <code className="text-dnews-dark">{deleteTarget?.toPath}</code>?</p>
      </Modal>
    </div>
  );
}
