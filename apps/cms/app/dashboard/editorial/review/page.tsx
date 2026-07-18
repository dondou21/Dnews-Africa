"use client";

import RoleGuard from "@/components/dashboard/RoleGuard";
import EditorialList from "@/app/dashboard/editorial/shared-list";

export default function ReviewPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <EditorialList title="Pending Reviews" description="Articles awaiting editorial review." statusFilter="IN_REVIEW" emptyTitle="No pending reviews" emptyDescription="All articles have been reviewed." />
    </RoleGuard>
  );
}
