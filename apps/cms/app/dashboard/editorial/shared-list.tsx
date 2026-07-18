"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Search, Eye } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/dashboard/Pagination";
import { get } from "@dnews/api-client";
import type { Article } from "@dnews/types";

interface ArticlesResponse {
  articles: Article[];
  pagination: { page: number; limit: number; total: number; totalPages: number; };
}

interface SharedListProps {
  title: string;
  description: string;
  statusFilter: string;
  emptyTitle?: string;
  emptyDescription?: string;
  roles?: string[];
}

export default function EditorialList({ title, description, statusFilter, emptyTitle, emptyDescription }: SharedListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const fetchArticles = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20", status: statusFilter });
      if (search) params.set("search", search);
      const res = await get<ArticlesResponse>(`/editorial/articles?${params}`);
      setArticles(res.articles);
      setPagination(res.pagination);
    } catch { setError("Failed to load articles."); } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const columns: Column<Article>[] = [
    { key: "title", header: "Title", render: (a) => (
      <div className="flex items-center gap-2">
        <span className="line-clamp-1 text-sm font-medium text-dnews-dark">{a.title}</span>
      </div>
    )},
    { key: "author", header: "Author", render: (a) => (
      <span className="text-xs text-dnews-muted">{a.author.firstName} {a.author.lastName}</span>
    )},
    { key: "category", header: "Category", render: (a) => (
      <span className="text-xs text-dnews-gray">{a.category.name}</span>
    )},
    { key: "assignedEditor", header: "Editor", render: (a) => (
      <span className="text-xs text-dnews-muted">{a.assignedEditor ? `${a.assignedEditor.firstName} ${a.assignedEditor.lastName}` : "—"}</span>
    )},
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { key: "updatedAt", header: "Updated", render: (a) => (
      <span className="text-xs text-dnews-gray">{new Date(a.updatedAt).toLocaleDateString()}</span>
    )},
    { key: "actions", header: "", className: "text-right", render: (a) => (
      <Link href={`/dashboard/articles/${a.id}`} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted hover:bg-dnews-light-gray hover:text-dnews-accent" title="View"><Eye size={14} /></Link>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="font-heading text-xl font-bold text-dnews-dark">{title}</h2><p className="mt-1 text-sm text-dnews-muted">{pagination.total > 0 ? `${pagination.total} article${pagination.total !== 1 ? "s" : ""}` : description}</p></div>
      </div>
      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      <div className="flex items-center justify-end">
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search articles..." className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
          </div>
        </form>
      </div>
      <DataTable columns={columns} data={articles} keyExtractor={(a) => a.id} loading={loading} emptyTitle={emptyTitle ?? "No articles"} emptyDescription={emptyDescription ?? "No articles match this filter."} />
      {pagination.totalPages > 1 && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
}
