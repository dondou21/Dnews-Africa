import Link from "next/link";
import { FaYoutube, FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import NewsletterSubscribe from "@/components/newsletter/NewsletterSubscribe";

const socialLinks = [
  { name: "YouTube", href: "#", icon: FaYoutube },
  { name: "Instagram", href: "#", icon: FaInstagram },
  { name: "Facebook", href: "#", icon: FaFacebookF },
  { name: "X (Twitter)", href: "#", icon: FaXTwitter },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-dnews-border bg-dnews-card">
      <div className="mx-auto max-w-[1180px] px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-brand-red">
              Dnews Africa
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-dnews-muted">
              Independent news media across the continent and the world.
            </p>
            <div className="mt-4 flex items-center gap-2">
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
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-red">
              Newsletter
            </h4>
            <NewsletterSubscribe
              title=""
              description="Get the latest African news delivered to your inbox."
              source="FOOTER"
              buttonText="Subscribe"
            />
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-red">
              Sections
            </h4>
            <ul className="space-y-2 text-sm text-dnews-muted">
              <li>
                <Link
                  href="/africa"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Africa
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="transition-colors hover:text-dnews-accent"
                >
                  News
                </Link>
              </li>
              <li>
                <Link
                  href="/business"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Business
                </Link>
              </li>
              <li>
                <Link
                  href="/sports"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Sport
                </Link>
              </li>
              <li>
                <Link
                  href="/culture"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Culture
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-red">
              More
            </h4>
            <ul className="space-y-2 text-sm text-dnews-muted">
              <li>
                <Link
                  href="/innovation"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Innovation
                </Link>
              </li>
              <li>
                <Link
                  href="/youth"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Youth
                </Link>
              </li>
              <li>
                <Link
                  href="/travel"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Travel
                </Link>
              </li>
              <li>
                <Link
                  href="/lifestyle"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link
                  href="/tv"
                  className="transition-colors hover:text-dnews-accent"
                >
                  DnewsAfrica TV
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-red">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-dnews-muted">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-dnews-accent"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/advertise"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Advertise & Partner
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-dnews-border pt-6 text-center text-xs text-dnews-muted">
          &copy; {new Date().getFullYear()} Dnews Africa. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
