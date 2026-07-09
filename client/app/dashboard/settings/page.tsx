import EmptyState from "@/components/dashboard/EmptyState";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Settings
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Manage your profile and platform preferences.
        </p>
      </div>
      <EmptyState
        title="Settings"
        description="This dashboard section will be available soon. You will be able to update your profile, change your password, and configure platform settings."
        icon={Settings}
      />
    </div>
  );
}
