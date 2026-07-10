import Link from "next/link";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Africa", href: "/africa" },
  { label: "News", href: "/news" },
  { label: "Business", href: "/business" },
  { label: "Features", href: "/featured" },
  { label: "Sport", href: "/sports" },
  { label: "Culture", href: "/culture" },
  { label: "DnewsAfrica TV", href: "/tv" },
];

export default function Navbar() {
  return (
    <nav className="border-b border-dnews-border bg-dnews-card dark:bg-black">
      <div className="mx-auto max-w-[1180px] overflow-x-auto px-4">
        <ul className="flex min-w-max items-center justify-center divide-x divide-dnews-border dark:divide-white/20 text-sm">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="inline-block whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide text-dnews-gray transition-colors hover:text-dnews-accent dark:text-white/70 dark:hover:text-white md:px-4"
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
