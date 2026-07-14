"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, ExternalLink, Edit, Trash2, Send, Eye, Clock } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Modal";
import { get, del, post } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { Article, ArticlesResponse } from "@/types/article";

const statusFilters = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Idea", value: "IDEA" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Needs Revision", value: "NEEDS_REVISION" },
  { label: "Approved", value: "APPROVED" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function ArticlesPage() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Journalist"]}>
      <ArticlesPageContent />
    </RoleGuard>
  );
}

function ArticlesPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isJournalist = user?.role.name === "Journalist";
  const isSelfOnly = user?.role.name === "Journalist" || user?.role.name === "Editor";
  const [now, setNow] = useState(Date.now());
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "ALL");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);

      const res = await get<ArticlesResponse>(`/articles/admin/all?${params}`);
      setArticles(res.articles);
      setPagination(res.pagination);
    } catch {
      setError("Failed to load articles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatus(value);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("status");
    } else {
      params.set("status", value);
    }
    router.replace(`/dashboard/articles?${params.toString()}`, { scroll: false });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/articles/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchArticles();
    } catch {
      setError("Failed to delete article.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitForReview = async (article: Article) => {
    try {
      await post(`/editorial/articles/${article.id}/submit`, {});
      fetchArticles();
    } catch {
      setError("Failed to submit article for review.");
    }
  };

  const columns: Column<Article>[] = [
    {
      key: "title",
      header: "Title",
      render: (a) => (
        <span className="line-clamp-1 font-medium">{a.title}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (a) => (
        <span className="text-xs text-dnews-gray">{a.category.name}</span>
      ),
    },
    ...(isSelfOnly ? [] : [
      {
        key: "author",
        header: "Author",
        render: (a: Article) => (
          <span className="text-xs text-dnews-gray">
            {a.author.firstName} {a.author.lastName}
          </span>
        ),
      },
    ] as Column<Article>[]),
    {
      key: "status",
      header: "Status",
      render: (a) => <StatusBadge status={a.status} />,
    },
    ...(isSelfOnly ? [] : [
      {
        key: "featured",
        header: "Featured",
        className: "text-center",
        render: (a: Article) => (
          <span
            className={`text-xs font-medium ${a.isFeatured ? "text-dnews-accent" : "text-dnews-muted"}`}
          >
            {a.isFeatured ? "Yes" : "No"}
          </span>
        ),
      },
    ] as Column<Article>[]),
    {
      key: "publishedAt",
      header: "Published / Scheduled",
      render: (a) => {
        if (a.scheduledAt) {
          const remaining = new Date(a.scheduledAt).getTime() - now;
          const hours = Math.floor(remaining / 3600000);
          const minutes = Math.floor((remaining % 3600000) / 60000);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-dnews-gray">
                {new Date(a.scheduledAt).toLocaleDateString()}
              </span>
              {remaining > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-purple-600">
                  <Clock size={10} />
                  {hours > 0 ? `${hours}h ` : ""}{minutes}m
                </span>
              )}
            </div>
          );
        }
        return (
          <span className="text-xs text-dnews-gray">
            {a.publishedAt
              ? new Date(a.publishedAt).toLocaleDateString()
              : "—"}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (a) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/dashboard/articles/${a.id}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
            title="View details"
          >
            <Eye size={14} />
          </Link>
          {a.status === "PUBLISHED" && (
            <Link
              href={`/articles/${a.slug}`}
              target="_blank"
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
              title="View public article"
            >
              <ExternalLink size={14} />
            </Link>
          )}
          {(!isJournalist || a.status === "DRAFT" || a.status === "IDEA") && (
            <Link
              href={`/dashboard/articles/${a.id}/edit`}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
              title="Edit article"
            >
              <Edit size={14} />
            </Link>
          )}
          {(isJournalist && (a.status === "DRAFT" || a.status === "IDEA")) && (
            <button
              onClick={() => handleSubmitForReview(a)}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
              title="Submit for review"
            >
              <Send size={14} />
            </button>
          )}
          {(!isJournalist || a.status === "DRAFT" || a.status === "IDEA") && (
            <button
              onClick={() => setDeleteTarget(a)}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
              title="Delete article"
            >
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
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            Articles
          </h2>
          <p className="mt-1 text-sm text-dnews-muted">
            {pagination.total > 0
              ? `${pagination.total} article${pagination.total !== 1 ? "s" : ""} total`
              : "Manage all articles on Dnews Africa."}
          </p>
        </div>
        <Link
          href="/dashboard/articles/new"
          className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
        >
          <Plus size={16} />
          New Article
        </Link>
      </div>

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
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
        </form>
      </div>

      {error && (
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={articles}
        keyExtractor={(a) => a.id}
        loading={loading}
        emptyTitle="No articles found"
        emptyDescription={
          search || status !== "ALL"
            ? "Try adjusting your search or filter."
            : "Get started by creating your first article."
        }
        emptyAction={
          !search && status === "ALL" ? (
            <Link
              href="/dashboard/articles/new"
              className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              <Plus size={16} />
              Create Article
            </Link>
          ) : undefined
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
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Article"
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
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        <p className="text-sm text-dnews-gray">
          Are you sure you want to delete{" "}
          <span className="font-medium text-dnews-dark">
            {deleteTarget?.title}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
