export default function SponsorBanner() {
  return (
    <div className="border-b border-dnews-border bg-dnews-light-gray dark:bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-1">
        <p className="mb-0.5 text-center text-[9px] uppercase tracking-[0.15em] text-dnews-muted dark:text-gray-500">
          Sponsored by
        </p>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 rounded border border-dnews-border bg-dnews-card px-4 py-1 dark:border-gray-300 dark:bg-gray-100">
            <div className="flex size-6 items-center justify-center rounded bg-dnews-border text-dnews-muted dark:bg-gray-300 dark:text-gray-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-dnews-gray dark:text-gray-700">Future Sponsor</span>
              <span className="text-[9px] leading-none text-dnews-muted dark:text-gray-500">Your brand here</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
