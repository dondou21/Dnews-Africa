"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import { get, post, patch, del } from "@/lib/api-client";
import type { TagInfo } from "@/types/article";

export default function TagsPage() {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TagInfo | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<TagInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<TagInfo[]>("/tags");
      setTags(data);
    } catch {
      setError("Failed to load tags.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormSlug("");
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (tag: TagInfo) => {
    setEditing(tag);
    setFormName(tag.name);
    setFormSlug(tag.slug);
    setFormError("");
    setFormOpen(true);
  };

  const generateSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editing || (!formSlug || formSlug === generateSlug(editing.name))) {
      setFormSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!formName || !formSlug) {
      setFormError("Name and slug are required.");
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        await patch(`/tags/${editing.id}`, { name: formName, slug: formSlug });
        setSuccess("Tag updated successfully.");
      } else {
        await post("/tags", { name: formName, slug: formSlug });
        setSuccess("Tag created successfully.");
      }
      setFormOpen(false);
      fetchTags();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/tags/${deleteTarget.id}`);
      setSuccess("Tag deleted successfully.");
      setDeleteTarget(null);
      fetchTags();
    } catch {
      setError("Failed to delete tag.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const columns: Column<TagInfo>[] = [
    { key: "name", header: "Name", render: (t) => <span className="font-medium">{t.name}</span> },
    { key: "slug", header: "Slug", render: (t) => <code className="text-xs text-dnews-muted">{t.slug}</code> },
    {
      key: "articles",
      header: "Articles",
      className: "text-center",
      render: (t) => (
        <span className="text-sm font-medium">{t._count.articles}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (t) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(t)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(t)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-dnews-dark">Tags</h2>
          <p className="mt-1 text-sm text-dnews-muted">
            {tags.length} tag{tags.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
        >
          <Plus size={16} />
          New Tag
        </button>
      </div>

      {error && (
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-sm border border-green-500/30 bg-green-50 px-4 py-3 dark:bg-green-900/20">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={tags}
        keyExtractor={(t) => String(t.id)}
        loading={loading}
        emptyTitle="No tags yet"
        emptyDescription="Create your first tag to organize articles."
        emptyAction={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
          >
            <Plus size={16} />
            Create Tag
          </button>
        }
      />

      <Modal
        open={formOpen}
        onClose={() => { setFormError(""); setFormOpen(false); }}
        title={editing ? "Edit Tag" : "New Tag"}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-sm border border-dnews-border px-4 py-2 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="tag-form"
              disabled={submitting}
              className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
            >
              {submitting ? "Saving..." : editing ? "Save Changes" : "Create"}
            </button>
          </>
        }
      >
        <form id="tag-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
              <p className="text-xs font-medium text-dnews-red">{formError}</p>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Name <span className="text-dnews-red">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Tag name"
              required
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Slug <span className="text-dnews-red">*</span>
            </label>
            <input
              type="text"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="tag-slug"
              required
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark font-mono placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Tag"
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
            {deleteTarget?.name}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
