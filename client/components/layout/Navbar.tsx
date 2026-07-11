"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: NavSubItem[];
}

const navItems: NavItem[] = [
  {
    label: "News",
    href: "/news",
    children: [
      { label: "Latest News", href: "/news" },
      { label: "Breaking News", href: "/news/breaking" },
      { label: "Africa", href: "/africa" },
      { label: "International", href: "/international" },
      { label: "Economy", href: "/economy" },
      { label: "Agriculture", href: "/agriculture" },
    ],
  },
  {
    label: "Business",
    href: "/business",
    children: [
      { label: "Entrepreneurship", href: "/business/entrepreneurship" },
      { label: "Startup", href: "/business/startup" },
      { label: "Innovation", href: "/innovation" },
    ],
  },
  {
    label: "Sports",
    href: "/sports",
    children: [
      { label: "Football", href: "/sports/football" },
      { label: "Basketball", href: "/sports/basketball" },
      { label: "Volleyball", href: "/sports/volleyball" },
      { label: "Handball", href: "/sports/handball" },
      { label: "Motorsports", href: "/sports/motorsports" },
      { label: "Cricket", href: "/sports/cricket" },
      { label: "Combat Sports", href: "/sports/combat-sports" },
      { label: "Tennis", href: "/sports/tennis" },
      { label: "AFCON", href: "/sports/afcon" },
      { label: "World Cup", href: "/sports/world-cup" },
    ],
  },
  {
    label: "Featured Articles",
    href: "/featured",
    children: [
      { label: "Special Reports", href: "/featured/special-reports" },
      { label: "Interviews", href: "/interviews" },
      { label: "Sponsored Articles", href: "/featured/sponsored" },
      { label: "Opinions", href: "/opinion" },
    ],
  },
  {
    label: "Entertainment",
    href: "/entertainment",
    children: [
      { label: "Music", href: "/entertainment/music" },
      { label: "Fashion", href: "/entertainment/fashion" },
      { label: "Culture", href: "/culture" },
      { label: "Arts", href: "/entertainment/arts" },
    ],
  },
  {
    label: "Pictorial",
    href: "/pictorial",
    children: [
      { label: "Photo Stories", href: "/pictorial" },
    ],
  },
  {
    label: "DnewsAfrica TV",
    href: "/tv",
    children: [
      { label: "Videos", href: "/tv" },
      { label: "Podcasts", href: "/tv/podcasts" },
      { label: "Exclusive Interviews", href: "/tv/interviews" },
      { label: "Documentaries", href: "/tv/documentaries" },
    ],
  },
  {
    label: "About Us",
    href: "/about",
    children: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Advertise With Us", href: "/advertise" },
      { label: "Partner With Us", href: "/partners" },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  return (
    <nav className="border-b border-dnews-border bg-dnews-card dark:bg-black">
      <div className="mx-auto max-w-[1180px] px-4">
        <div className="flex items-center justify-between lg:justify-center">
          <ul className="hidden lg:flex items-center divide-x divide-dnews-border dark:divide-white/20 text-sm">
            {navItems.map((item) => (
              <li key={item.label} className="group relative">
                <Link
                  href={item.href ?? "#"}
                  className="inline-flex items-center gap-1 whitespace-nowrap px-3 py-2.5 font-medium uppercase tracking-wide text-dnews-gray transition-colors hover:text-dnews-accent dark:text-white/70 dark:hover:text-white md:px-4"
                >
                  {item.label}
                  {item.children && <ChevronDown size={12} className="transition-transform group-hover:rotate-180" />}
                </Link>
                {item.children && (
                  <div className="invisible absolute left-0 top-full z-50 min-w-[200px] origin-top-right translate-y-1 rounded-sm border border-dnews-border bg-dnews-card py-1 shadow-lg opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 dark:bg-black">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-dnews-gray transition-colors hover:bg-dnews-light-gray hover:text-dnews-accent dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded text-dnews-gray hover:bg-dnews-light-gray lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-dnews-border lg:hidden">
          <div className="mx-auto max-w-[1180px] px-4 py-2">
            {navItems.map((item) => (
              <div key={item.label}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === item.label ? null : item.label)}
                  className="flex w-full items-center justify-between py-2.5 text-sm font-medium uppercase tracking-wide text-dnews-gray dark:text-white/70"
                >
                  <span>{item.label}</span>
                  {item.children && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${openAccordion === item.label ? "rotate-180" : ""}`}
                    />
                  )}
                </button>
                {item.children && openAccordion === item.label && (
                  <div className="ml-4 space-y-1 pb-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1.5 text-sm text-dnews-gray transition-colors hover:text-dnews-accent dark:text-white/60 dark:hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
