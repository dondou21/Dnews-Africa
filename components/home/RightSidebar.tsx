import type { Article } from "@/src/data/articles";
import AdSlot from "./AdSlot";
import TrendingWidget from "./TrendingWidget";

export default function RightSidebar({
  trendingArticles,
}: {
  trendingArticles: Article[];
}) {
  return (
    <div>
      <AdSlot size="medium" />

      <TrendingWidget articles={trendingArticles} />

      <div className="mb-6 rounded border border-dnews-border p-4">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
          Newsletter
        </h3>
        <p className="mb-3 text-sm text-dnews-gray">
          Get the latest African news delivered to your inbox.
        </p>
        <form className="space-y-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border border-dnews-border bg-dnews-card px-3 py-2 text-sm text-dnews-dark placeholder-dnews-muted outline-none focus:border-dnews-accent"
          />
          <button
            type="submit"
            className="w-full bg-dnews-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-dnews-accent-light"
          >
            Subscribe
          </button>
        </form>
      </div>

      <div className="mb-6 rounded border border-dnews-border p-4">
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
          Follow Us
        </h3>
        <div className="flex gap-2">
          {["Twitter", "Facebook", "Instagram", "YouTube"].map((platform) => (
            <a
              key={platform}
              href="#"
              className="flex-1 rounded border border-dnews-border px-2 py-1.5 text-center text-xs font-medium text-dnews-gray transition-colors hover:border-dnews-accent hover:text-dnews-accent"
            >
              {platform}
            </a>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded border border-dnews-border p-4">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
          Upcoming Events
        </h3>
        <div className="space-y-2">
          <div className="border-b border-dnews-border pb-2">
            <p className="text-sm font-medium text-dnews-dark">AfriTech Summit 2026</p>
            <p className="text-xs text-dnews-muted">Nairobi · Aug 15-17</p>
          </div>
          <div className="border-b border-dnews-border pb-2">
            <p className="text-sm font-medium text-dnews-dark">AU Media Conference</p>
            <p className="text-xs text-dnews-muted">Addis Ababa · Sep 5-7</p>
          </div>
          <div>
            <p className="text-sm font-medium text-dnews-dark">Africa Cup 2026</p>
            <p className="text-xs text-dnews-muted">Multiple venues · Oct-Dec</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded border border-dnews-border p-4">
        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
          Partner Spotlight
        </h3>
        <p className="text-sm text-dnews-gray">
          Interested in partnering with Dnews Africa? Reach out to our team for
          collaboration and sponsorship opportunities.
        </p>
      </div>

      <AdSlot size="small" label="Sponsor Ad" />
    </div>
  );
}
