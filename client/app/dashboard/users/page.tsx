import EmptyState from "@/components/dashboard/EmptyState";
import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Users
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Manage platform users and their permissions.
        </p>
      </div>
      <EmptyState
        title="Users Management"
        description="This dashboard section will be available soon. You will be able to view, create, edit, and manage all platform users."
        icon={Users}
      />
    </div>
  );
}
