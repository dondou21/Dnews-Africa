import EmptyState from "@/components/dashboard/EmptyState";
import { Mail } from "lucide-react";

export default function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Newsletter Subscribers
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          View and manage newsletter subscribers.
        </p>
      </div>
      <EmptyState
        title="Newsletter Subscribers"
        description="This dashboard section will be available soon. You will be able to view subscriber lists and manage newsletter campaigns."
        icon={Mail}
      />
    </div>
  );
}
