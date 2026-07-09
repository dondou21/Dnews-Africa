import EmptyState from "@/components/dashboard/EmptyState";
import { MessageSquare } from "lucide-react";

export default function CommentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Comments Moderation
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Review, approve, and manage reader comments.
        </p>
      </div>
      <EmptyState
        title="Comments Moderation"
        description="This dashboard section will be available soon. You will be able to moderate all reader comments from a single interface."
        icon={MessageSquare}
      />
    </div>
  );
}
