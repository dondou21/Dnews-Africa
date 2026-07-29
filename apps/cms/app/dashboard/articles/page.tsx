"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Search, ExternalLink, Edit, Trash2, Send, Eye, Clock } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/dashboard/Pagination";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { get, del, post } from "@dnews/api-client";
import { useAuth } from "@/contexts/AuthContext";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { Article, ArticlesResponse, Category } from "@dnews/types";

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
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    get<Category[]>("/categories").then(setCategories).catch(() => {});
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (status !== "ALL") params.set("status", status);
      if (categoryId) params.set("categoryId", String(categoryId));

      const res = await get<ArticlesResponse>(`/articles/admin/all?${params}`);
      setArticles(res.articles);
      setPagination(res.pagination);
    } catch {
      setError("Failed to load articles. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, categoryId]);

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

  const handleCategoryFilter = (value: string) => {
    const id = value ? Number(value) : undefined;
    setCategoryId(id);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set("categoryId", String(id));
    } else {
      params.delete("categoryId");
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
      <PageHeader
        title="Articles"
        description={
          pagination.total > 0
            ? `${pagination.total} article${pagination.total !== 1 ? "s" : ""} total`
            : "Manage all articles on Dnews Africa."
        }
        action={
          <Link href="/dashboard/articles/new">
            <Button icon={<Plus size={16} />}>New Article</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => handleStatusFilter(f.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                status === f.value
                  ? "bg-dnews-accent text-white shadow-sm"
                  : "border border-dnews-border text-dnews-gray hover:bg-dnews-light-gray hover:text-dnews-dark"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={categoryId ?? ""}
          onChange={(e) => handleCategoryFilter(e.target.value)}
          className="rounded-lg border border-dnews-border bg-dnews-bg px-3 py-2 text-xs font-medium text-dnews-gray outline-none transition-colors focus:border-dnews-accent"
        >
          <option value="">All Categories</option>
          {categories
            .filter((c) => c.parentId == null)
            .map((parent) => {
              const children = categories.filter((c) => c.parentId === parent.id);
              if (children.length === 0) {
                return (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                );
              }
              return (
                <optgroup key={parent.id} label={parent.name}>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {"\u2514\u2500 "}{child.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
        </select>

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
              className="w-56 rounded-lg border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent focus:ring-2 focus:ring-dnews-accent/10"
            />
          </div>
        </form>
      </div>

      {error && <Alert variant="error" message={error} onDismiss={() => setError("")} />}

      <DataTable
        columns={columns}
        data={articles}
        keyExtractor={(a) => a.id}
        loading={loading}
        emptyTitle="No articles found"
        emptyDescription={
          search || status !== "ALL" || categoryId
            ? "Try adjusting your search or filter."
            : "Get started by creating your first article."
        }
        emptyAction={
          !search && status === "ALL" && !categoryId ? (
            <Link href="/dashboard/articles/new">
              <Button icon={<Plus size={16} />}>Create Article</Button>
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
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
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
