import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise & Partner – Dnews Africa",
  description:
    "Partner with Dnews Africa. Explore advertising, sponsorship, and media partnership opportunities.",
};

const opportunities = [
  {
    title: "Ad Placement",
    description:
      "Reach our engaged Pan-African audience through strategic ad placements across our website, including banner ads, native advertising, and sponsored sections.",
  },
  {
    title: "Partner Spotlight",
    description:
      "Get featured in our Partner Spotlight series, highlighting organizations and brands that are making an impact across Africa.",
  },
  {
    title: "Sponsored Articles",
    description:
      "Collaborate with our editorial team to produce sponsored content that aligns with your brand while providing value to our readers.",
  },
  {
    title: "Event & Media Partnership",
    description:
      "Partner with Dnews Africa for event coverage, media sponsorships, and co-branded content initiatives that amplify your reach.",
  },
];

export default function AdvertisePage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-dnews-dark md:text-4xl">
          Advertise & Partner With Us
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">
          Grow your brand with Dnews Africa
        </p>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <p className="leading-relaxed text-dnews-gray">
            Dnews Africa offers unique opportunities for brands and
            organizations to connect with a highly engaged Pan-African
            audience. Whether you are looking to advertise, sponsor content, or
            explore media partnerships, we have the platform to help you reach
            your goals.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-heading text-2xl font-semibold text-dnews-dark">
            Opportunities
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {opportunities.map((item) => (
              <div
                key={item.title}
                className="rounded border border-dnews-border bg-dnews-card p-5"
              >
                <h3 className="font-heading text-lg font-semibold text-dnews-dark">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded border border-dnews-border bg-dnews-card p-6">
          <h2 className="font-heading text-xl font-semibold text-dnews-dark">
            Ready to Partner?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
            Contact us to discuss how we can work together. Reach out to our
            partnerships team:
          </p>
          <a
            href="mailto:dnewsafrica23@gmail.com"
            className="mt-3 inline-block text-dnews-accent underline underline-offset-2 hover:text-dnews-accent-light"
          >
            dnewsafrica23@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
}
