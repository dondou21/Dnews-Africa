import EmptyState from "@/components/dashboard/EmptyState";
import { FileText } from "lucide-react";

export default function ArticlesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Articles
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Manage all articles on Dnews Africa.
        </p>
      </div>
      <EmptyState
        title="Articles Management"
        description="This dashboard section will be available soon. You will be able to create, edit, publish, and manage all articles from here."
        icon={FileText}
      />
    </div>
  );
}
