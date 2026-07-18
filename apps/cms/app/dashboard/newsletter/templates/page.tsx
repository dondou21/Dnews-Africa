"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2, Copy, Star } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import LoadingState from "@/components/dashboard/LoadingState";
import EmptyState from "@/components/dashboard/EmptyState";
import RoleGuard from "@/components/dashboard/RoleGuard";
import { get, post, patch, del } from "@dnews/api-client";
import type { NewsletterTemplate } from "@dnews/types";

export default function TemplatesPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <TemplatesContent />
    </RoleGuard>
  );
}

function TemplatesContent() {
  const [templates, setTemplates] = useState<NewsletterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<NewsletterTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<NewsletterTemplate | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await get<NewsletterTemplate[]>("/newsletter/templates");
      setTemplates(data);
    } catch {
      setError("Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(""), 3000); return () => clearTimeout(t); }
  }, [success]);

  const handleDuplicate = async (id: string) => {
    try {
      const result = await post<NewsletterTemplate>(`/newsletter/templates/${id}/duplicate`);
      setTemplates((prev) => [...prev, result]);
      setSuccess("Template duplicated.");
    } catch {
      setError("Failed to duplicate template.");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await patch(`/newsletter/templates/${id}`, { isDefault: true });
      setSuccess("Default template updated.");
      fetchTemplates();
    } catch {
      setError("Failed to set default template.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/newsletter/templates/${deleteTarget.id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setSuccess("Template deleted.");
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete template.");
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<NewsletterTemplate>[] = [
    {
      key: "name",
      header: "Name",
      render: (t) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-dnews-dark">{t.name}</span>
          {t.isDefault && (
            <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] font-medium text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Star size={10} /> Default
            </span>
          )}
        </div>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (t) => <span className="text-sm text-dnews-muted">{t.subject}</span>,
    },
    {
      key: "createdBy",
      header: "Created By",
      render: (t) => (
        <span className="text-xs text-dnews-muted">
          {t.createdBy.firstName} {t.createdBy.lastName}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (t) => (
        <span className="whitespace-nowrap text-xs text-dnews-muted">
          {new Date(t.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => setPreviewTarget(t)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent" title="Preview"><Eye size={14} /></button>
          <Link href={`/dashboard/newsletter/templates/${t.id}/edit`} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent" title="Edit"><Edit size={14} /></Link>
          <button onClick={() => handleDuplicate(t.id)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-blue-600" title="Duplicate"><Copy size={14} /></button>
          {!t.isDefault && <button onClick={() => handleSetDefault(t.id)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-yellow-600" title="Set as default"><Star size={14} /></button>}
          {!t.isDefault && <button onClick={() => setDeleteTarget(t)} className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red" title="Delete"><Trash2 size={14} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">Newsletter Templates</h2>
          <p className="mt-1 text-sm text-dnews-muted">Create and manage email templates.</p>
        </div>
        <Link href="/dashboard/newsletter/templates/new" className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light">
          <Plus size={14} /> New Template
        </Link>
      </div>

      {error && <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3"><p className="text-xs font-medium text-dnews-red">{error}</p></div>}
      {success && <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20"><p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p></div>}

      <DataTable columns={columns} data={templates} keyExtractor={(t) => t.id} loading={loading}
        emptyTitle="No templates found"
        emptyDescription="Create your first email template to get started."
        emptyAction={<Link href="/dashboard/newsletter/templates/new" className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white">New Template</Link>}
      />

      <Modal open={!!previewTarget} onClose={() => setPreviewTarget(null)} title={`Preview: ${previewTarget?.name}`} size="lg">
        {previewTarget && (
          <div className="space-y-4">
            <div className="rounded-sm border border-dnews-border bg-dnews-bg p-4">
              <div className="prose prose-sm max-w-none text-dnews-dark" dangerouslySetInnerHTML={{ __html: previewTarget.content }} />
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Template" size="sm"
        footer={<>
          <button onClick={() => setDeleteTarget(null)} className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray">Cancel</button>
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-2 rounded-sm bg-dnews-red px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">{deleting ? "Deleting..." : "Delete"}</button>
        </>}
      >
        <p className="text-sm text-dnews-gray">Are you sure you want to delete <span className="font-medium text-dnews-dark">{deleteTarget?.name}</span>?</p>
      </Modal>
    </div>
  );
}
