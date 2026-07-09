"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Trash2, Search, Download } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Modal from "@/components/dashboard/Modal";
import { get, del } from "@/lib/api-client";
import type { NewsletterSubscriber } from "@/types/newsletter";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<NewsletterSubscriber[]>("/newsletter/subscribers");
      setSubscribers(data);
    } catch {
      setError("Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const filtered = useMemo(() => {
    if (!search.trim()) return subscribers;
    const q = search.toLowerCase();
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/newsletter/subscribers/${deleteTarget.id}`);
      setSubscribers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setSuccess("Subscriber removed successfully.");
      setDeleteTarget(null);
    } catch {
      setError("Failed to remove subscriber.");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const headers = ["Email", "Name", "Status", "Subscribed Date"];
    const rows = filtered.map((s) => [
      s.email,
      s.name || "",
      s.isActive ? "Active" : "Unsubscribed",
      new Date(s.subscribedAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<NewsletterSubscriber>[] = [
    {
      key: "email",
      header: "Email",
      render: (s) => (
        <div>
          <p className="text-sm font-medium text-dnews-dark">{s.email}</p>
          {s.name && (
            <p className="text-xs text-dnews-muted">{s.name}</p>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Status",
      render: (s) => (
        <StatusBadge
          status={s.isActive ? "active" : "inactive"}
        />
      ),
    },
    {
      key: "subscribedAt",
      header: "Subscribed Date",
      render: (s) => (
        <span className="whitespace-nowrap text-xs text-dnews-muted">
          {new Date(s.subscribedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (s) => (
        <button
          onClick={() => setDeleteTarget(s)}
          className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
          title="Remove subscriber"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            Newsletter Subscribers
          </h2>
          <p className="mt-1 text-sm text-dnews-muted">
            View and manage your newsletter subscriber list.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-sm border border-dnews-border px-3 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray disabled:opacity-50"
        >
          <Download size={14} />
          Export CSV
        </button>
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

      <div className="relative max-w-xs">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="w-full rounded-sm border border-dnews-border bg-white py-2 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent dark:bg-dnews-dark-gray dark:text-white"
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(s) => s.id}
        loading={loading}
        emptyTitle="No subscribers found"
        emptyDescription={
          search
            ? "No subscribers match your search."
            : "No newsletter subscribers yet."
        }
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Remove Subscriber"
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
              {deleting ? "Removing..." : "Remove"}
            </button>
          </>
        }
      >
        <p className="text-sm text-dnews-gray">
          Are you sure you want to remove{" "}
          <span className="font-medium text-dnews-dark">
            {deleteTarget?.email}
          </span>
          ? They will need to resubscribe to join again.
        </p>
      </Modal>
    </div>
  );
}
