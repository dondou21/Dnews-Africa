import { FaYoutube, FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import AdSlot from "./AdSlot";
import TrendingWidget from "./TrendingWidget";
import NewsletterSubscribe from "@/components/newsletter/NewsletterSubscribe";

interface TrendingArticle {
  id: string;
  title: string;
  slug: string;
}

const socialLinks = [
  { name: "YouTube", href: "#", icon: FaYoutube },
  { name: "Instagram", href: "#", icon: FaInstagram },
  { name: "Facebook", href: "#", icon: FaFacebookF },
  { name: "X (Twitter)", href: "#", icon: FaXTwitter },
];

export default function RightSidebar({
  trendingArticles,
}: {
  trendingArticles: TrendingArticle[];
}) {
  return (
    <div>
      <AdSlot variant="sidebar" />

      <TrendingWidget articles={trendingArticles} />

      <div id="newsletter" className="mb-6 rounded-sm border border-dnews-border bg-dnews-card p-4">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
          Newsletter
        </h3>
        <NewsletterSubscribe
          title=""
          description="Get the latest African news delivered to your inbox."
          source="HOME_PAGE"
          buttonText="Subscribe"
        />
      </div>

      <div className="mb-6 rounded-sm border border-dnews-border bg-dnews-card p-4">
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
          Follow Us
        </h3>
        <div className="flex flex-wrap gap-2">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:border-dnews-red hover:text-dnews-red"
                aria-label={link.name}
              >
                <Icon size={16} />
              </a>
            );
          })}
        </div>
      </div>

      <div className="mb-6 rounded-sm border border-dnews-border bg-dnews-card p-4">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
          Upcoming Events
        </h3>
        <div className="space-y-3">
          <div className="border-b border-dnews-border pb-3">
            <p className="text-sm font-medium text-dnews-dark">AfriTech Summit 2026</p>
            <p className="mt-0.5 text-xs text-dnews-muted">Nairobi · Aug 15-17</p>
          </div>
          <div className="border-b border-dnews-border pb-3">
            <p className="text-sm font-medium text-dnews-dark">AU Media Conference</p>
            <p className="mt-0.5 text-xs text-dnews-muted">Addis Ababa · Sep 5-7</p>
          </div>
          <div>
            <p className="text-sm font-medium text-dnews-dark">Africa Cup 2026</p>
            <p className="mt-0.5 text-xs text-dnews-muted">Multiple venues · Oct-Dec</p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-sm border border-dnews-border bg-dnews-card p-4">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
          Partner Spotlight
        </h3>
        <p className="text-sm leading-relaxed text-dnews-gray">
          Interested in partnering with Dnews Africa? Reach out to our team for
          collaboration and sponsorship opportunities.
        </p>
      </div>

      <AdSlot variant="small" />
    </div>
  );
}
