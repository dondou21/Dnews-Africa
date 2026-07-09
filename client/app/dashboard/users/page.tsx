"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Modal from "@/components/dashboard/Modal";
import { get, post, patch, del } from "@/lib/api-client";
import type { UserItem, RoleInfo } from "@/types/user";

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | "ALL">("ALL");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRoleId, setFormRoleId] = useState<number | "">("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData] = await Promise.all([
        get<UserItem[]>("/users"),
        get<RoleInfo[]>("/roles"),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setRolesLoading(false);
    } catch {
      setError("Failed to load data.");
      setRolesLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(t);
    }
  }, [success]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const openCreate = () => {
    setEditing(null);
    setFormFirstName("");
    setFormLastName("");
    setFormEmail("");
    setFormPassword("");
    setFormRoleId("");
    setFormIsActive(true);
    setFormOpen(true);
  };

  const openEdit = (user: UserItem) => {
    setEditing(user);
    setFormFirstName(user.firstName);
    setFormLastName(user.lastName);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRoleId(user.roleId);
    setFormIsActive(user.isActive);
    setFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formFirstName || !formLastName || !formEmail || !formRoleId) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!editing && !formPassword) {
      setError("Password is required for new users.");
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        const body: Record<string, unknown> = {
          firstName: formFirstName,
          lastName: formLastName,
          email: formEmail,
          roleId: Number(formRoleId),
          isActive: formIsActive,
        };
        if (formPassword) body.password = formPassword;
        await patch(`/users/${editing.id}`, body);
        setSuccess("User updated successfully.");
      } else {
        await post("/users", {
          firstName: formFirstName,
          lastName: formLastName,
          email: formEmail,
          password: formPassword,
          roleId: Number(formRoleId),
        });
        setSuccess("User created successfully.");
      }
      setFormOpen(false);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await del(`/users/${deleteTarget.id}`);
      setSuccess("User deleted successfully.");
      setDeleteTarget(null);
      fetchData();
    } catch {
      setError("Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.roleId === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns: Column<UserItem>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dnews-accent/10 text-xs font-bold text-dnews-accent">
            {u.firstName.charAt(0)}
            {u.lastName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-dnews-dark">
              {u.firstName} {u.lastName}
            </p>
            <p className="text-xs text-dnews-muted">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <span className="text-sm text-dnews-gray">{u.role.name}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) =>
        u.isActive ? (
          <StatusBadge status="Active" />
        ) : (
          <StatusBadge status="Inactive" />
        ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (u) => (
        <span className="text-xs text-dnews-muted">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (u) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openEdit(u)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent"
            title="Edit user"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => setDeleteTarget(u)}
            className="inline-flex h-7 w-7 items-center justify-center rounded text-dnews-muted transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
            title="Delete user"
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
            Users
          </h2>
          <p className="mt-1 text-sm text-dnews-muted">
            {users.length} user{users.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
        >
          <Plus size={16} />
          New User
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

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRoleFilter("ALL")}
            className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
              roleFilter === "ALL"
                ? "bg-dnews-accent text-white"
                : "border border-dnews-border text-dnews-gray hover:bg-dnews-light-gray"
            }`}
          >
            All
          </button>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-colors ${
                roleFilter === r.id
                  ? "bg-dnews-accent text-white"
                  : "border border-dnews-border text-dnews-gray hover:bg-dnews-light-gray"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search name or email..."
            className="w-56 rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark placeholder-dnews-muted outline-none transition-colors focus:border-dnews-accent"
          />
        </form>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(u) => u.id}
        loading={loading}
        emptyTitle="No users found"
        emptyDescription={
          search || roleFilter !== "ALL"
            ? "Try adjusting your search or filter."
            : "Create your first user to get started."
        }
        emptyAction={
          !search && roleFilter === "ALL" ? (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              <Plus size={16} />
              Create User
            </button>
          ) : undefined
        }
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit User" : "New User"}
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
              form="user-form"
              disabled={submitting}
              className="flex items-center gap-2 rounded-sm bg-dnews-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light disabled:opacity-60"
            >
              {submitting ? "Saving..." : editing ? "Save Changes" : "Create"}
            </button>
          </>
        }
      >
        <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                First Name <span className="text-dnews-red">*</span>
              </label>
              <input
                type="text"
                value={formFirstName}
                onChange={(e) => setFormFirstName(e.target.value)}
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Last Name <span className="text-dnews-red">*</span>
              </label>
              <input
                type="text"
                value={formLastName}
                onChange={(e) => setFormLastName(e.target.value)}
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              Email <span className="text-dnews-red">*</span>
            </label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
              {editing ? "New Password (leave blank to keep current)" : "Password"} <span className="text-dnews-red">*</span>
            </label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              required={!editing}
              minLength={6}
              className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                Role <span className="text-dnews-red">*</span>
              </label>
              <select
                value={formRoleId}
                onChange={(e) => setFormRoleId(e.target.value ? Number(e.target.value) : "")}
                required
                className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
              >
                <option value="">
                  {rolesLoading
                    ? "Loading roles..."
                    : roles.length === 0
                      ? "No roles available"
                      : "Select role"}
                </option>
          {rolesLoading && (
            <span className="text-xs text-dnews-muted">Loading roles...</span>
          )}
          {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
                {!rolesLoading && roles.length === 0 && (
                  <option value="" disabled>No roles found — contact your administrator</option>
                )}
              </select>
            </div>
            {editing && (
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                  Status
                </label>
                <select
                  value={formIsActive ? "active" : "inactive"}
                  onChange={(e) => setFormIsActive(e.target.value === "active")}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            )}
          </div>
        </form>
      </Modal>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete User"
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
            {deleteTarget?.firstName} {deleteTarget?.lastName}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
