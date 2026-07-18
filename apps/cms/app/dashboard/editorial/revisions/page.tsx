"use client";

import { useEffect, useState } from "react";
import { GitBranch, Search } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Pagination from "@/components/dashboard/Pagination";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get } from "@dnews/api-client";
import type { Article } from "@dnews/types";

export default function RevisionsPage() {
  return (<RoleGuard roles={["Admin", "Editor", "Journalist"]}><RevisionsContent /></RoleGuard>);
}

function RevisionsContent() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20", status: "ALL", sort: "latest" });
    if (search) params.set("search", search);
    get<{ articles: Article[]; pagination: any }>(`/editorial/articles?${params}`)
      .then((res) => { setArticles(res.articles); setPagination(res.pagination); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  const columns: Column<Article>[] = [
    { key: "title", header: "Article", render: (a) => (
      <div>
        <span className="line-clamp-1 text-sm font-medium text-dnews-dark">{a.title}</span>
        <span className="text-xs text-dnews-muted">v{mockVersion(a)}</span>
      </div>
    )},
    { key: "status", header: "Status", render: (a) => (
      <span className="text-xs text-dnews-gray">{a.status.replace(/_/g, " ")}</span>
    )},
    { key: "updatedAt", header: "Last Updated", render: (a) => (
      <span className="text-xs text-dnews-gray">{new Date(a.updatedAt).toLocaleString()}</span>
    )},
    { key: "actions", header: "", className: "text-right", render: (a) => (
      <a href={`/dashboard/articles/${a.id}`} className="inline-flex items-center gap-1 rounded-sm bg-dnews-accent/10 px-3 py-1 text-xs font-medium text-dnews-accent hover:bg-dnews-accent/20">
        <GitBranch size={12} /> View Revisions
      </a>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="font-heading text-xl font-bold text-dnews-dark">Revision History</h2><p className="mt-1 text-sm text-dnews-muted">Browse all article revisions.</p></div>
      </div>
      <div className="flex items-center justify-end">
        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search..." className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark outline-none focus:border-dnews-accent" />
          </div>
        </form>
      </div>
      <DataTable columns={columns} data={articles} keyExtractor={(a) => a.id} loading={loading} emptyTitle="No articles" emptyDescription="Articles with revisions will appear here." />
      {pagination.totalPages > 1 && <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />}
    </div>
  );
}

function mockVersion(a: Article) {
  const h = a.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Math.max(1, (h % 10) + 1);
}
