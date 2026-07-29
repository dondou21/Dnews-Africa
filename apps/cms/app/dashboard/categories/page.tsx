"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Edit, Trash2, ChevronRight } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import Modal from "@/components/dashboard/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { get, post, patch, del } from "@dnews/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { CategoryWithCount } from "@dnews/types";

export default function CategoriesPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <CategoriesPageContent />
    </RoleGuard>
  );
}

function CategoriesPageContent() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formParentId, setFormParentId] = useState<number | "">("");
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const parentCategories = categories.filter((c) => c.parentId === null && (!editing || c.id !== editing.id));

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<CategoryWithCount[]>("/categories");
      setCategories(data);
    } catch {
      setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormSlug("");
    setFormDescription("");
    setFormParentId("");
    setFormDisplayOrder(0);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (cat: CategoryWithCount) => {
    setEditing(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormDescription(cat.description || "");
    setFormParentId(cat.parentId ?? "");
    setFormDisplayOrder(cat.displayOrder ?? 0);
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
    const payload: Record<string, unknown> = {
      name: formName,
      slug: formSlug,
      description: formDescription || undefined,
      parentId: formParentId !== "" ? Number(formParentId) : null,
      displayOrder: formDisplayOrder,
    };
    try {
      if (editing) {
        await patch(`/categories/${editing.id}`, payload);
        setSuccess("Category updated successfully.");
      } else {
        await post("/categories", payload);
        setSuccess("Category created successfully.");
      }
      setFormOpen(false);
      fetchCategories();
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
      setSuccess("Category deleted successfully.");
      setDeleteTarget(null);
      fetchCategories();
    } catch {
      setError("Failed to delete category.");
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

  const columns: Column<CategoryWithCount>[] = [
    {
      key: "name",
      header: "Name",
      render: (c) => (
        <div className="flex items-center gap-2">
          {c.parentId && <ChevronRight size={14} className="shrink-0 text-dnews-muted" />}
          <span className="font-medium">{c.name}</span>
        </div>
      ),
    },
    { key: "slug", header: "Slug", render: (c) => <code className="text-xs text-dnews-muted">{c.slug}</code> },
    {
      key: "parent",
      header: "Parent",
      render: (c) => (
        <span className="text-xs text-dnews-gray">
          {c.parent ? c.parent.name : "—"}
        </span>
      ),
    },
    {
      key: "children",
      header: "Subcategories",
      className: "text-center",
      render: (c) => (
        <span className="text-sm font-medium">{c._count.children}</span>
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
      <PageHeader
        title="Categories"
        description={`${categories.length} categor${categories.length === 1 ? "y" : "ies"} total`}
        action={
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            New Category
          </Button>
        }
      />

      {error && <Alert variant="error" message={error} onDismiss={() => setError("")} />}
      {success && <Alert variant="success" message={success} onDismiss={() => setSuccess("")} />}

      <DataTable
        columns={columns}
        data={categories}
        keyExtractor={(c) => String(c.id)}
        loading={loading}
        emptyTitle="No categories yet"
        emptyDescription="Create your first category to organize articles."
        emptyAction={
          <Button onClick={openCreate} icon={<Plus size={16} />}>
            Create Category
          </Button>
        }
      />

      <Modal
        open={formOpen}
        onClose={() => { setFormError(""); setFormOpen(false); }}
        title={editing ? "Edit Category" : "New Category"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="category-form"
              loading={submitting}
            >
              {submitting ? "Saving..." : editing ? "Save Changes" : "Create"}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && <Alert variant="error" message={formError} />}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Name <span className="text-dnews-red">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Category name"
              required
              className="w-full rounded-lg border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent focus:ring-2 focus:ring-dnews-accent/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Slug <span className="text-dnews-red">*</span>
            </label>
            <input
              type="text"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="category-slug"
              required
              className="w-full rounded-lg border border-dnews-border bg-dnews-bg px-3 py-2 text-sm font-mono text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent focus:ring-2 focus:ring-dnews-accent/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Parent Category
            </label>
            <select
              value={formParentId}
              onChange={(e) => setFormParentId(e.target.value !== "" ? Number(e.target.value) : "")}
              className="w-full rounded-lg border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent focus:ring-2 focus:ring-dnews-accent/10"
            >
              <option value="">— None (Top-level category) —</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Display Order
            </label>
            <input
              type="number"
              min={0}
              value={formDisplayOrder}
              onChange={(e) => setFormDisplayOrder(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              className="w-full rounded-lg border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent focus:ring-2 focus:ring-dnews-accent/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Description
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full rounded-lg border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent focus:ring-2 focus:ring-dnews-accent/10"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Category"
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
            {deleteTarget?.name}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
