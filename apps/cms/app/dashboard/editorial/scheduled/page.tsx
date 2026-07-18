"use client";

import RoleGuard from "@/components/dashboard/RoleGuard";
import EditorialList from "@/app/dashboard/editorial/shared-list";

export default function ScheduledPage() {
  return (
    <RoleGuard roles={["Admin", "Editor"]}>
      <EditorialList title="Scheduled" description="Articles scheduled for publication." statusFilter="SCHEDULED" emptyTitle="No scheduled articles" emptyDescription="No articles are scheduled for publication." />
    </RoleGuard>
  );
}
