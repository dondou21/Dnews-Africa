export default function SponsorBanner() {
  return (
    <div className="border-b border-dnews-border bg-dnews-light-gray">
      <div className="mx-auto max-w-[1180px] px-4 py-2 md:py-3">
        <p className="mb-1 text-center text-[10px] uppercase tracking-[0.15em] text-dnews-muted">
          Sponsored by
        </p>
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2 rounded border border-dnews-border bg-dnews-card px-5 py-2">
            <div className="flex size-8 items-center justify-center rounded bg-dnews-border text-dnews-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="m21 15-5-5L5 21" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-dnews-gray">Future Sponsor</span>
              <span className="text-[10px] leading-none text-dnews-muted">Your brand here</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
