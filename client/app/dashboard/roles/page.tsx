import EmptyState from "@/components/dashboard/EmptyState";
import { ShieldCheck } from "lucide-react";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Roles
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Define roles and permissions for platform users.
        </p>
      </div>
      <EmptyState
        title="Roles Management"
        description="This dashboard section will be available soon. You will be able to manage user roles and their access permissions."
        icon={ShieldCheck}
      />
    </div>
  );
}
