import EmptyState from "@/components/dashboard/EmptyState";
import { Tags } from "lucide-react";

export default function TagsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">Tags</h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Manage article tags for better content discovery.
        </p>
      </div>
      <EmptyState
        title="Tags Management"
        description="This dashboard section will be available soon. You will be able to create and manage tags used across articles."
        icon={Tags}
      />
    </div>
  );
}
