interface LoadingStateProps {
  rows?: number;
  variant?: "card" | "table" | "list";
}

function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-dnews-border/40 ${className}`}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border border-dnews-border bg-dnews-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-dnews-border bg-dnews-card">
      <div className="border-b border-dnews-border bg-dnews-light-gray px-4 py-3">
        <div className="flex gap-8">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-b border-dnews-border px-4 py-3.5 last:border-b-0"
        >
          <div className="flex items-center gap-8">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-dnews-border bg-dnews-card p-4"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LoadingState({
  rows = 5,
  variant = "card",
}: LoadingStateProps) {
  if (variant === "table") return <TableSkeleton rows={rows} />;
  if (variant === "list") return <ListSkeleton rows={rows} />;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: rows }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
