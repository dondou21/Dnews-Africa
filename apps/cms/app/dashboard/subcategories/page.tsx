"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Edit, Trash2, Search, ToggleLeft, ToggleRight } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import { get, post, patch, del } from "@dnews/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { CategoryWithCount } from "@dnews/types";

export default function SubcategoriesPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <SubcategoriesPageContent />
    </RoleGuard>
  );
}

function SubcategoriesPageContent() {
  const [allSubcategories, setAllSubcategories] = useState<CategoryWithCount[]>([]);
  const [parentCategories, setParentCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formParentId, setFormParentId] = useState<number | "">("");
  const [formDescription, setFormDescription] = useState("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const generateSlug = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<CategoryWithCount[]>("/categories");
      setAllSubcategories(data.filter((c) => c.parentId !== null));
      setParentCategories(data.filter((c) => c.parentId === null));
    } catch {
      setError("Failed to load subcategories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = allSubcategories.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormSlug("");
    setFormParentId("");
    setFormDescription("");
    setFormDisplayOrder(0);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (sub: CategoryWithCount) => {
    setEditing(sub);
    setFormName(sub.name);
    setFormSlug(sub.slug);
    setFormParentId(sub.parentId ?? "");
    setFormDescription(sub.description || "");
    setFormDisplayOrder(sub.displayOrder ?? 0);
    setFormError("");
    setFormOpen(true);
  };

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
    if (formParentId === "") {
      setFormError("Parent category is required.");
      return;
    }
    const existing = allSubcategories.find(
      (s) => s.parentId === formParentId && s.name.toLowerCase() === formName.toLowerCase() && (!editing || s.id !== editing.id)
    );
    if (existing) {
      setFormError("A subcategory with this name already exists under this parent.");
      return;
    }
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      name: formName,
      slug: formSlug,
      description: formDescription || undefined,
      parentId: Number(formParentId),
      displayOrder: formDisplayOrder,
    };
    try {
      if (editing) {
        await patch(`/categories/${editing.id}`, payload);
        setSuccess("Subcategory updated successfully.");
      } else {
        await post("/categories", payload);
        setSuccess("Subcategory created successfully.");
      }
      setFormOpen(false);
      fetchData();
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
      await del(`/categories/${deleteTarget.id}`);
      setSuccess("Subcategory deleted successfully.");
      setDeleteTarget(null);
      fetchData();
    } catch {
      setError("Failed to delete subcategory.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (sub: CategoryWithCount) => {
    try {
      await patch(`/categories/${sub.id}`, { isActive: !sub.isActive });
      fetchData();
    } catch {
      setError("Failed to update status.");
    }
  };

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const columns: Column<CategoryWithCount>[] = [
    { key: "name", header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "slug", header: "Slug", render: (c) => <code className="text-xs text-dnews-muted">{c.slug}</code> },
    {
      key: "parent",
      header: "Parent Category",
      render: (c) => (
        <span className="text-xs font-medium text-dnews-accent">
          {c.parent?.name || "—"}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (c) => (
        <span className="text-xs text-dnews-gray line-clamp-1">
          {c.description || "—"}
        </span>
      ),
    },
    {
      key: "displayOrder",
      header: "Order",
      className: "text-center",
      render: (c) => <span className="text-sm">{c.displayOrder}</span>,
    },
    {
      key: "isActive",
      header: "Status",
      className: "text-center",
      render: (c) => (
        <button
          onClick={() => handleToggleActive(c)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
            c.isActive
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-dnews-border/30 text-dnews-muted hover:bg-dnews-border/50"
          }`}
          title={c.isActive ? "Deactivate" : "Activate"}
        >
          {c.isActive ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
          {c.isActive ? "Active" : "Inactive"}
        </button>
      ),
    },
    {
      key: "articles",
      header: "Articles",
      className: "text-center",
      render: (c) => (
        <span className="text-sm font-medium">{c._count.articles}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(c)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
            title="Edit"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(c)}
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
          <h2 className="font-heading text-xl font-bold text-dnews-dark">
            Subcategories
          </h2>
          <p className="mt-1 text-sm text-dnews-muted">
            {allSubcategories.length} subcategor{allSubcategories.length === 1 ? "y" : "ies"} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
        >
          <Plus size={16} />
          New Subcategory
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

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search subcategories..."
          className="w-full rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
        />
      </div>

      <DataTable
        columns={columns}
        data={paged}
        keyExtractor={(c) => String(c.id)}
        loading={loading}
        emptyTitle="No subcategories yet"
        emptyDescription="Subcategories are created when a category has a parent category assigned."
        emptyAction={
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
          >
            <Plus size={16} />
            Create Subcategory
          </button>
        }
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dnews-muted">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-sm border border-dnews-border px-3 py-1.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-sm border border-dnews-border px-3 py-1.5 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => { setFormError(""); setFormOpen(false); }}
        title={editing ? "Edit Subcategory" : "New Subcategory"}
        size="md"
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
              form="subcategory-form"
              disabled={submitting}
              className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
            >
              {submitting ? "Saving..." : editing ? "Save Changes" : "Create"}
            </button>
          </>
        }
      >
        <form id="subcategory-form" onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Subcategory name"
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
              placeholder="subcategory-slug"
              required
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark font-mono placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Parent Category <span className="text-dnews-red">*</span>
            </label>
            <select
              value={formParentId}
              onChange={(e) => setFormParentId(e.target.value !== "" ? Number(e.target.value) : "")}
              required
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
            >
              <option value="">— Select parent category —</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Display Order
            </label>
            <input
              type="number"
              min={0}
              value={formDisplayOrder}
              onChange={(e) => setFormDisplayOrder(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Subcategory"
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
