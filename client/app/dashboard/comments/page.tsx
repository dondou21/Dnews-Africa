"use client";

import { MessageSquare } from "lucide-react";

export default function CommentsPage() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <div className="text-center">
        <MessageSquare
          size={48}
          className="mx-auto text-dnews-border"
        />
        <h3 className="mt-4 font-heading text-lg font-bold text-dnews-dark">
          Comments Disabled
        </h3>
        <p className="mt-2 max-w-md text-sm text-dnews-muted">
          Comments are currently not available for this platform. This section
          will be enabled when the feature is supported.
        </p>
      </div>
    </div>
  );
}
