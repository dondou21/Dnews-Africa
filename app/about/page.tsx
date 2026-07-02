import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us – Dnews Africa",
  description:
    "Dnews Africa is a Pan-African digital media platform covering sports, business, innovation, culture, youth stories, and more.",
};

const coverageAreas = [
  {
    title: "Sports",
    description:
      "In-depth coverage of African sports, from football to athletics, celebrating the continent's athletic excellence.",
  },
  {
    title: "Business",
    description:
      "Business news, finance, innovation, and economic developments shaping Africa's markets and industries.",
  },
  {
    title: "Innovation",
    description:
      "Technology and innovation stories highlighting African ingenuity, startups, and digital transformation.",
  },
  {
    title: "Culture",
    description:
      "African culture, arts, music, film, and lifestyle content that showcases the continent's rich heritage.",
  },
  {
    title: "Youth Stories",
    description:
      "Stories that amplify the voices of young Africans driving change across the continent.",
  },
  {
    title: "Interviews",
    description:
      "Exclusive conversations with thought leaders, entrepreneurs, and changemakers from across Africa.",
  },
  {
    title: "Multimedia Storytelling",
    description:
      "Engaging visual and audio content including photo essays, video features, and interactive stories.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-10">
        <h1 className="font-heading text-3xl font-bold text-brand-red md:text-4xl">
          About Dnews Africa
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">
          Independent news media across the continent and the world
        </p>
      </div>

      <div className="max-w-3xl">
        <section className="mb-10">
          <h2 className="font-heading text-2xl font-semibold text-brand-red">
            Our Mission
          </h2>
          <p className="mt-3 leading-relaxed text-dnews-gray">
            Dnews Africa is a Pan-African digital media platform committed to
            independent, impactful storytelling. We cover the stories that
            matter most to the continent — from the pitch to the boardroom, from
            the village to the global stage. Our mission is to inform, inspire,
            and connect audiences across Africa and the diaspora with
            journalism that is bold, fair, and deeply rooted in the African
            experience.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-heading text-2xl font-semibold text-brand-red">
            What We Cover
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {coverageAreas.map((area) => (
              <div
                key={area.title}
                className="rounded border border-dnews-border bg-dnews-card p-4"
              >
                <h3 className="font-heading text-lg font-semibold text-brand-red">
                  {area.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-dnews-gray">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-heading text-2xl font-semibold text-brand-red">
            Our Positioning
          </h2>
          <p className="mt-3 leading-relaxed text-dnews-gray">
            Dnews Africa is positioned as a premier Pan-African digital media
            platform, delivering high-quality journalism and multimedia content
            to a growing global audience. We offer a sponsor-ready environment
            for brands and organizations looking to connect with engaged,
            influential audiences across the continent and beyond.
          </p>
        </section>
      </div>
    </div>
  );
}
