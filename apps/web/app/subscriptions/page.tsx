import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck, Bell } from "lucide-react";

export const metadata: Metadata = {
  title: "Subscriptions – Dnews Africa",
  description:
    "Manage your Dnews Africa subscriptions, newsletter preferences, and alerts.",
};

const subscriptionOptions = [
  {
    title: "Newsletter Subscriptions",
    description:
      "Subscribe to our daily and weekly newsletters for curated Pan-African news and in-depth reporting.",
    href: "/#newsletter",
    icon: Mail,
  },
  {
    title: "Preferences & Alerts",
    description:
      "Manage the categories and alerts you receive by updating your newsletter preferences.",
    href: "/newsletter/preferences",
    icon: Bell,
  },
  {
    title: "Privacy & Control",
    description:
      "Your data is handled with care. Unsubscribe or adjust your settings at any time from your preferences page.",
    href: "/privacy",
    icon: ShieldCheck,
  },
];

export default function SubscriptionsPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-dnews-accent md:text-4xl">
          Subscriptions
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">
          Manage what you receive from Dnews Africa
        </p>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <p className="leading-relaxed text-dnews-gray">
            Stay connected with Dnews Africa. Choose how you want to receive
            our coverage — from daily newsletters to alerts and special
            campaign updates — and adjust your preferences at any time.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-heading text-2xl font-semibold text-dnews-accent">
            Subscription Options
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {subscriptionOptions.map((item) => {
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
            Manage Your Preferences
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
            If you already receive our newsletter, you can update the types of
            content you get using your personal preferences link.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/newsletter/preferences"
              className="inline-flex items-center gap-2 rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              Update Preferences
            </Link>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 rounded-sm border border-dnews-border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            >
              Explore Campaigns
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
