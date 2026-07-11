"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Copy, CheckCircle, Eye, Trash2, AlertCircle } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Modal";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get, post, del, put } from "@/lib/api-client";
import type { HomePageLayout, LayoutListResponse } from "@/types/layout";

export default function LayoutsPage() {
  return (<RoleGuard roles={["Admin", "Editor"]}><LayoutsPageContent /></RoleGuard>);
}

function LayoutsPageContent() {
  const [layouts, setLayouts] = useState<HomePageLayout[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<HomePageLayout | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);

  const fetchLayouts = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (search) params.set("search", search);
      const res = await get<LayoutListResponse>(`/layouts?${params}`);
      setLayouts(res.layouts);
      setPagination(res.pagination);
    } catch {
      setError("Failed to load layouts.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchLayouts(); }, [fetchLayouts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/layouts/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchLayouts();
    } catch {
      setError("Failed to delete layout.");
    } finally {
      setDeleting(false);
    }
  };

  const handlePublish = async (id: string) => {
    setPublishing(id);
    try {
      await post(`/layouts/${id}/publish`, {});
      fetchLayouts();
    } catch {
      setError("Failed to publish layout.");
    } finally {
      setPublishing(null);
    }
  };

  const handleDuplicate = async (layout: HomePageLayout) => {
    try {
      await post(`/layouts/${layout.id}/duplicate`, {
        name: `${layout.name} (Copy)`,
        slug: `${layout.slug}-copy`,
      });
      fetchLayouts();
    } catch {
      setError("Failed to duplicate layout.");
    }
  };

  const columns: Column<HomePageLayout>[] = [
    {
      key: "name",
      header: "Name",
      render: (l) => (
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/layouts/${l.id}`} className="text-sm font-medium text-dnews-dark hover:text-dnews-accent transition-colors line-clamp-1">
            {l.name}
          </Link>
          {l.isDefault && <span className="shrink-0 rounded bg-dnews-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-dnews-accent">Default</span>}
        </div>
      ),
    },
    { key: "slug", header: "Slug", render: (l) => <span className="text-xs text-dnews-muted">{l.slug}</span> },
    { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
    { key: "version", header: "Version", render: (l) => <span className="text-xs text-dnews-gray">v{l.version}</span> },
    { key: "sections", header: "Sections", render: (l) => <span className="text-xs text-dnews-gray">{l._count?.sections ?? l.sections?.length ?? 0}</span> },
    { key: "updatedAt", header: "Updated", render: (l) => <span className="text-xs text-dnews-gray">{new Date(l.updatedAt).toLocaleDateString()}</span> },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (l) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/dashboard/layouts/${l.id}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent" title="Edit">
            <Eye size={14} />
          </Link>
          <button onClick={() => handleDuplicate(l)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent" title="Duplicate">
            <Copy size={14} />
          </button>
          {l.status !== "PUBLISHED" && (
            <button onClick={() => handlePublish(l.id)} disabled={publishing === l.id}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-green-600 disabled:opacity-50" title="Publish">
              <CheckCircle size={14} />
            </button>
          )}
          {!l.isDefault && (
            <button onClick={() => setDeleteTarget(l)}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red" title="Delete">
              <Trash2 size={14} />
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
          <h2 className="font-heading text-xl font-bold text-dnews-dark">Homepage Layouts</h2>
          <p className="mt-1 text-sm text-dnews-muted">{pagination.total > 0 ? `${pagination.total} layout${pagination.total !== 1 ? "s" : ""} total` : "Design and manage homepage layouts."}</p>
        </div>
        <Link href="/dashboard/layouts/new"
          className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light">
          <Plus size={16} />
          New Layout
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
          <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search layouts..."
            className="w-full rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent" />
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <AlertCircle size={14} className="text-dnews-red" />
          <p className="text-xs text-dnews-red">{error}</p>
        </div>
      )}

      <DataTable columns={columns} data={layouts} keyExtractor={(l) => l.id} loading={loading}
        emptyTitle="No layouts found"
        emptyDescription={search ? "Try a different search." : "Create your first homepage layout to get started."}
        emptyAction={!search ? (
          <Link href="/dashboard/layouts/new"
            className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light">
            <Plus size={16} />
            Create Layout
          </Link>
        ) : undefined}
      />

      {pagination.totalPages > 1 && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Layout" size="sm"
        footer={
          <>
            <button onClick={() => setDeleteTarget(null)}
              className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray">Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-2 rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-red/80 disabled:opacity-60">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        }>
        <p className="text-sm text-dnews-gray">
          Are you sure you want to delete <span className="font-medium text-dnews-dark">{deleteTarget?.name}</span>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
