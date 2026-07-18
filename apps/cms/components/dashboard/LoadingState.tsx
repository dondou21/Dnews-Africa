interface LoadingStateProps {
  rows?: number;
  variant?: "card" | "table" | "list";
}

function Skeleton({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-dnews-border/50 ${className}`}
    />
  );
}

function CardSkeleton() {
  return (
    <div className="rounded-sm border border-dnews-border bg-dnews-card p-5">
      <Skeleton className="mb-2 h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows: number }) {
  return (
    <div className="rounded-sm border border-dnews-border bg-dnews-card">
      <div className="border-b border-dnews-border p-4">
        <Skeleton className="h-4 w-full" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="border-b border-dnews-border p-4 last:border-b-0"
        >
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ rows = 5 }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="mb-1 h-4 w-2/3" />
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
