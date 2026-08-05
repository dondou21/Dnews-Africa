import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Send, Newspaper } from "lucide-react";

export const metadata: Metadata = {
  title: "Campaigns – Dnews Africa",
  description:
    "Explore Dnews Africa campaigns including newsletters, sponsored initiatives, and public awareness drives.",
};

const campaigns = [
  {
    title: "Newsletter Campaigns",
    description:
      "Join our newsletter campaigns to receive curated Pan-African news, breaking updates, and special editions straight to your inbox.",
    href: "/subscriptions",
    icon: Send,
  },
  {
    title: "Sponsored Campaigns",
    description:
      "Discover partner-driven campaigns and sponsored initiatives that highlight brands and organizations making an impact across the continent.",
    href: "/featured/sponsored",
    icon: Newspaper,
  },
  {
    title: "Public Awareness Drives",
    description:
      "Follow our public awareness campaigns covering health, education, climate, and social impact across Africa.",
    href: "/news",
    icon: Megaphone,
  },
];

export default function CampaignsPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-dnews-accent md:text-4xl">
          Campaigns
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">
          Discover Dnews Africa campaigns and initiatives
        </p>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <p className="leading-relaxed text-dnews-gray">
            Dnews Africa runs a range of campaigns — from editorial and
            newsletter drives to sponsored and public awareness initiatives.
            Browse the campaigns below or manage your subscriptions to tailor
            what you receive.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-heading text-2xl font-semibold text-dnews-accent">
            Our Campaigns
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {campaigns.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded border border-dnews-border bg-dnews-card p-5 transition-colors hover:border-dnews-accent"
                >
                  <Icon
                    size={20}
                    className="text-dnews-accent transition-transform group-hover:scale-110"
                  />
                  <h3 className="mt-3 font-heading text-lg font-semibold text-dnews-accent group-hover:text-dnews-accent-light">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
                    {item.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="rounded border border-dnews-border bg-dnews-card p-6">
          <h2 className="font-heading text-xl font-semibold text-dnews-accent">
            Manage Your Subscriptions
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
            Take control of the content you receive from Dnews Africa — update
            your newsletter preferences or subscribe to our campaigns.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/subscriptions"
              className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              View Subscriptions
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
