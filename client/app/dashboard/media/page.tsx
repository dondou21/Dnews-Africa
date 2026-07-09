import EmptyState from "@/components/dashboard/EmptyState";
import { Image } from "lucide-react";

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-dnews-dark">
          Media Library
        </h2>
        <p className="mt-1 text-sm text-dnews-muted">
          Upload and manage images, videos, and documents.
        </p>
      </div>
      <EmptyState
        title="Media Library"
        description="This dashboard section will be available soon. You will be able to upload, browse, and manage all media assets."
        icon={Image}
      />
    </div>
  );
}
