import EmptyState from "@/components/dashboard/EmptyState";
import { FolderTree } from "lucide-react";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Categories
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Organize articles by categories.
        </p>
      </div>
      <EmptyState
        title="Categories Management"
        description="This dashboard section will be available soon. You will be able to create, edit, and organize content categories."
        icon={FolderTree}
      />
    </div>
  );
}
