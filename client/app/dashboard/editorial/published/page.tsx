"use client";

import RoleGuard from "@/components/dashboard/RoleGuard";
import EditorialList from "@/app/dashboard/editorial/shared-list";

export default function PublishedPage() {
  return (
    <RoleGuard roles={["Admin", "Editor", "Journalist"]}>
      <EditorialList title="Published" description="Published articles." statusFilter="PUBLISHED" emptyTitle="No published articles" emptyDescription="No articles have been published yet." />
    </RoleGuard>
  );
}
