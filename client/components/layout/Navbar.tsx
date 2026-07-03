import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "News", href: "/news" },
  { label: "Business", href: "/business" },
  { label: "Sports", href: "/sports" },
  { label: "Featured", href: "/featured" },
  { label: "Culture", href: "/culture" },
  { label: "Pictorial", href: "/pictorial" },
  { label: "DnewsAfrica TV", href: "/tv" },
  { label: "About", href: "/about" },
  { label: "Advertise", href: "/advertise" },
];

export default function Navbar() {
  return (
    <nav className="border-b border-dnews-border bg-dnews-card">
      <div className="mx-auto max-w-[1180px] overflow-x-auto px-4">
        <ul className="flex min-w-max items-center justify-center divide-x divide-dnews-border text-sm">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="inline-block whitespace-nowrap px-3 py-2.5 font-medium uppercase tracking-wide text-dnews-gray transition-colors hover:text-dnews-accent md:px-4"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
