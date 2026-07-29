interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

const statusStyles: Record<string, string> = {
  published: "bg-dnews-green/10 text-dnews-green ring-1 ring-inset ring-dnews-green/20",
  draft: "bg-dnews-gray/10 text-dnews-gray ring-1 ring-inset ring-dnews-gray/20",
  pending: "bg-dnews-amber/10 text-dnews-amber ring-1 ring-inset ring-dnews-amber/20",
  pending_review: "bg-dnews-amber/10 text-dnews-amber ring-1 ring-inset ring-dnews-amber/20",
  in_review: "bg-dnews-amber/10 text-dnews-amber ring-1 ring-inset ring-dnews-amber/20",
  needs_revision: "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400 ring-1 ring-inset ring-orange-500/20",
  approved: "bg-dnews-blue/10 text-dnews-blue ring-1 ring-inset ring-dnews-blue/20",
  scheduled: "bg-dnews-purple/10 text-dnews-purple ring-1 ring-inset ring-dnews-purple/20",
  rejected: "bg-dnews-red/10 text-dnews-red ring-1 ring-inset ring-dnews-red/20",
  archived: "bg-dnews-gray/10 text-dnews-muted ring-1 ring-inset ring-dnews-border",
  idea: "bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-400 ring-1 ring-inset ring-slate-500/20",
  active: "bg-dnews-green/10 text-dnews-green ring-1 ring-inset ring-dnews-green/20",
  inactive: "bg-dnews-gray/10 text-dnews-muted ring-1 ring-inset ring-dnews-border",
  read: "bg-dnews-blue/10 text-dnews-blue ring-1 ring-inset ring-dnews-blue/20",
  unread: "bg-dnews-amber/10 text-dnews-amber ring-1 ring-inset ring-dnews-amber/20",
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  const style =
    statusStyles[key] ||
    "bg-dnews-gray/10 text-dnews-gray ring-1 ring-inset ring-dnews-gray/20";

  const display = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium leading-none ${
        size === "sm" ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm"
      } ${style}`}
    >
      {display}
    </span>
  );
}
