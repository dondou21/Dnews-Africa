"use client";

import { useEffect, useState } from "react";
import DataTable, { type Column } from "@/components/dashboard/DataTable";
import { get } from "@/lib/api-client";
import RoleGuard from "@/components/dashboard/RoleGuard";
import type { RoleInfo } from "@/types/user";

export default function RolesPage() {
  return (
    <RoleGuard roles={["Admin"]}>
      <RolesPageContent />
    </RoleGuard>
  );
}

function RolesPageContent() {
  const [roles, setRoles] = useState<RoleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRoles = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await get<RoleInfo[]>("/roles");
      setRoles(data);
    } catch {
      setError("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const columns: Column<RoleInfo>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => <span className="font-medium text-dnews-dark">{r.name}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (r) => (
        <span className="text-sm text-dnews-gray">
          {r.description || "—"}
        </span>
      ),
    },
    {
      key: "users",
      header: "Users",
      className: "text-center",
      render: (r) => (
        <span className="text-sm font-medium text-dnews-dark">
          {r._count?.users ?? 0}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Roles
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          {roles.length} role{roles.length !== 1 ? "s" : ""} defined
        </p>
      </div>

      {error && (
        <div className="rounded-sm border border-dnews-red/30 bg-dnews-red/5 px-4 py-3">
          <p className="text-xs font-medium text-dnews-red">{error}</p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={roles}
        keyExtractor={(r) => String(r.id)}
        loading={loading}
        emptyTitle="No roles defined"
        emptyDescription="Roles control user permissions on the platform."
      />
    </div>
  );
}
