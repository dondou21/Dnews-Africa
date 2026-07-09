import EmptyState from "@/components/dashboard/EmptyState";
import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Contact Messages
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Read and manage messages from your contact form.
        </p>
      </div>
      <EmptyState
        title="Contact Messages"
        description="This dashboard section will be available soon. You will be able to read, reply to, and manage all contact form submissions."
        icon={MessageCircle}
      />
    </div>
  );
}
