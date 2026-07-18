"use client";

import RoleGuard from "@/components/dashboard/RoleGuard";
import EditorialList from "@/app/dashboard/editorial/shared-list";

export default function ArchivedPage() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Journalist"]}>
      <EditorialList title="Archived" description="Archived articles." statusFilter="ARCHIVED" emptyTitle="No archived articles" emptyDescription="No articles have been archived." />
    </RoleGuard>
  );
}
