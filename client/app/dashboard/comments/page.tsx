"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Check, X, Trash2 } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Modal from "@/components/dashboard/Modal";
import { get, patch, del } from "@/lib/api-client";
import type { CommentItem, CommentStatus } from "@/types/comment";

type FilterValue = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const filters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

function getAuthorName(c: CommentItem): string {
  if (c.author) return `${c.author.firstName} ${c.author.lastName}`;
  if (c.guestName) return c.guestName;
  return "Anonymous";
}

function getAuthorEmail(c: CommentItem): string | null {
  if (c.guestEmail) return c.guestEmail;
  return null;
}

function getCommentPreview(content: string, max = 100): string {
  if (content.length <= max) return content;
  return content.slice(0, max) + "...";
}

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<CommentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const path = filter === "PENDING" ? "/comments/pending" : "/comments";
      const data = await get<CommentItem[]>(path);
      let filtered = data;
      if (filter === "APPROVED") {
        filtered = data.filter((c) => c.status === "APPROVED");
      } else if (filter === "REJECTED") {
        filtered = data.filter((c) => c.status === "REJECTED");
      }
      setComments(filtered);
    } catch {
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const updateStatus = async (id: string, status: CommentStatus) => {
    setActionLoading(id);
    setError("");
    try {
      await patch(`/comments/${id}`, { status });
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } as CommentItem : c))
      );
      setSuccess(
        status === "APPROVED"
          ? "Comment approved."
          : status === "REJECTED"
            ? "Comment rejected."
            : "Comment status updated."
      );
    } catch {
      setError("Failed to update comment status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/comments/${deleteTarget.id}`);
      setComments((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setSuccess("Comment deleted successfully.");
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete comment.");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<CommentItem>[] = [
    {
      key: "author",
      header: "Author",
      render: (c) => (
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-dnews-dark">
            {getAuthorName(c)}
          </p>
          <p className="text-xs text-dnews-muted">
            {getAuthorEmail(c) || (
              <span className="rounded bg-dnews-light-gray px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-dnews-gray">
                Registered
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      key: "article",
      header: "Article",
      render: (c) => (
        <Link
          href={`/articles/${c.article.slug}`}
          target="_blank"
          className="group flex items-center gap-1 text-sm text-dnews-accent transition-colors hover:text-dnews-accent-light"
        >
          <span className="line-clamp-1 max-w-[200px]">{c.article.title}</span>
          <ExternalLink
            size={12}
            className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          />
        </Link>
      ),
    },
    {
      key: "content",
      header: "Comment",
      render: (c) => (
        <p className="max-w-xs text-sm text-dnews-gray">
          {getCommentPreview(c.content)}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (c) => (
        <span className="whitespace-nowrap text-xs text-dnews-muted">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (c) => {
        const busy = actionLoading === c.id;
        return (
          <div className="flex items-center justify-end gap-1">
            {c.status !== "APPROVED" && (
              <button
                onClick={() => updateStatus(c.id, "APPROVED")}
                disabled={busy}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-green-100 hover:text-green-700 disabled:opacity-40"
                title="Approve"
              >
                <Check size={14} />
              </button>
            )}
            {c.status !== "REJECTED" && (
              <button
                onClick={() => updateStatus(c.id, "REJECTED")}
                disabled={busy}
                className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-red-100 hover:text-dnews-red disabled:opacity-40"
                title="Reject"
              >
                <X size={14} />
              </button>
            )}
            <button
              onClick={() => setDeleteTarget(c)}
              className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  const counts = {
    ALL: comments.length,
    PENDING: comments.filter((c) => c.status === "PENDING").length,
    APPROVED: comments.filter((c) => c.status === "APPROVED").length,
    REJECTED: comments.filter((c) => c.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Comments Moderation
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Review and moderate reader comments.
        </p>
      </div>

      {error && (
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">
            {success}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-dnews-accent text-white"
                : "border border-dnews-border text-dnews-gray hover:bg-dnews-light-gray"
            }`}
          >
            {f.label}
            {counts[f.value] > 0 && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                  filter === f.value
                    ? "bg-white/20 text-white"
                    : "bg-dnews-light-gray text-dnews-gray"
                }`}
              >
                {counts[f.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={comments}
        keyExtractor={(c) => c.id}
        loading={loading}
        emptyTitle="No comments found"
        emptyDescription={
          filter === "PENDING"
            ? "All caught up! No pending comments to moderate."
            : "No comments have been submitted yet."
        }
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Comment"
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
          Are you sure you want to delete this comment? This action cannot be
          undone.
        </p>
      </Modal>
    </div>
  );
}
