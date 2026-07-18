"use client";

import RoleGuard from "@/components/dashboard/RoleGuard";
import EditorialList from "@/app/dashboard/editorial/shared-list";

export default function DraftsPage() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Journalist"]}>
      <EditorialList title="My Drafts" description="Articles in draft status." statusFilter="DRAFT" emptyTitle="No drafts" emptyDescription="You have no draft articles." />
    </RoleGuard>
  );
}
