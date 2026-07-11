interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  pending_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_review: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  needs_revision: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  scheduled: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  archived: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  idea: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  read: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  unread: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "_");
  const style =
    statusStyles[key] ||
    "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

  const display = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${style}`}
    >
      {display}
    </span>
  );
}
