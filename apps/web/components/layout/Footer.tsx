import Link from "next/link";
import { FaYoutube, FaInstagram, FaXTwitter, FaFacebookF } from "react-icons/fa6";
import NewsletterSubscribe from "@/components/newsletter/NewsletterSubscribe";
import { socialLinks } from "@/lib/siteConfig";

const iconMap: Record<string, typeof FaYoutube> = {
  YouTube: FaYoutube,
  Instagram: FaInstagram,
  "X (Twitter)": FaXTwitter,
  Facebook: FaFacebookF,
};

const footerSections = [
  {
    title: "Sections",
    links: [
      { href: "/news", label: "News" },
      { href: "/business", label: "Business" },
      { href: "/sports", label: "Sports" },
      { href: "/featured", label: "Featured Articles" },
      { href: "/culture", label: "Culture" },
    ],
  },
  {
    title: "More",
    links: [
      { href: "/pictorial", label: "Pictorial" },
      { href: "/tv", label: "DnewsAfrica TV" },
      { href: "/innovation", label: "Innovation" },
      { href: "/opinion", label: "Opinions" },
      { href: "/interviews", label: "Interviews" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/advertise", label: "Advertise With Us" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-dnews-border bg-dnews-card">
      <div className="mx-auto max-w-[1180px] px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h3 className="font-heading text-xl font-bold text-brand-red">
              Dnews Africa
            </h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-dnews-muted">
              Independent news media across the continent and the world.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socialLinks().map((link) => {
                const Icon = iconMap[link.name] ?? FaYoutube;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-dnews-border text-dnews-gray transition-all duration-200 hover:border-dnews-red hover:bg-dnews-red/5 hover:text-dnews-red"
                    aria-label={link.name}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
            <div className="mt-6">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-dnews-muted">
                Newsletter
              </h4>
              <NewsletterSubscribe
                title=""
                description="Get the latest African news delivered to your inbox."
                source="FOOTER"
                buttonText="Subscribe"
              />
            </div>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-dnews-muted">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-dnews-gray transition-colors duration-200 hover:text-dnews-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-dnews-border pt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-dnews-muted">
            &copy; {new Date().getFullYear()} Dnews Africa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
