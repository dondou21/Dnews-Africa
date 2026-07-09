import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  action?: React.ReactNode;
}

export default function EmptyState({
  title = "No data yet",
  description = "This section is empty. Content will appear here once it is available.",
  icon: Icon,
  action,
}: EmptyStateProps) {
  const IconComponent = Icon || Inbox;

  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-dnews-border bg-dnews-card px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-dnews-light-gray p-4">
        <IconComponent size={40} className="text-dnews-muted" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-dnews-dark">
        {title}
      </h3>
      <p className="mt-2 max-w-md text-sm text-dnews-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
