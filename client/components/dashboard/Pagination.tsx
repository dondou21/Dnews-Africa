interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-8 items-center justify-center rounded-sm border border-dnews-border px-3 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => {
          if (totalPages <= 7) return true;
          if (p === 1 || p === totalPages) return true;
          if (Math.abs(p - page) <= 1) return true;
          return false;
        })
        .map((p, idx, arr) => {
          const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1 text-xs text-dnews-muted">...</span>
              )}
              <button
                onClick={() => onPageChange(p)}
                className={`inline-flex h-8 min-w-[32px] items-center justify-center rounded-sm px-2 text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-dnews-accent text-white"
                    : "border border-dnews-border text-dnews-gray hover:bg-dnews-light-gray"
                }`}
              >
                {p}
              </button>
            </span>
          );
        })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex h-8 items-center justify-center rounded-sm border border-dnews-border px-3 text-xs font-medium text-dnews-gray transition-colors hover:bg-dnews-light-gray disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
