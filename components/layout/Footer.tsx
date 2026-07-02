import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-dnews-border bg-dnews-card">
      <div className="mx-auto max-w-[1180px] px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-heading text-lg font-semibold text-dnews-dark">
              Dnews Africa
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-dnews-muted">
              Independent news media across the continent and the world.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-dnews-gray">
              Sections
            </h4>
            <ul className="space-y-2 text-sm text-dnews-muted">
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
                  Sports
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
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-dnews-gray">
              More
            </h4>
            <ul className="space-y-2 text-sm text-dnews-muted">
              <li>
                <Link
                  href="/featured"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Featured
                </Link>
              </li>
              <li>
                <Link
                  href="/pictorial"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Pictorial
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
              <li>
                <Link
                  href="/search"
                  className="transition-colors hover:text-dnews-accent"
                >
                  Search
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-dnews-gray">
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
