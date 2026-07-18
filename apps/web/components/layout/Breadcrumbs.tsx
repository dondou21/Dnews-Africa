"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  news: "News",
  business: "Business",
  sports: "Sports",
  culture: "Culture",
  innovation: "Innovation",
  travel: "Travel",
  youth: "Youth",
  lifestyle: "Lifestyle",
  interviews: "Interviews",
  opinion: "Opinion & Analysis",
  featured: "Featured Articles",
  africa: "Africa",
  tv: "DnewsAfrica TV",
  pictorial: "Pictorial",
  about: "About Us",
  contact: "Contact",
  privacy: "Privacy Policy",
  advertise: "Advertise With Us",
  search: "Search",
  economy: "Economy",
  agriculture: "Agriculture",
  entertainment: "Entertainment",
};

function buildSegments(pathname: string): { label: string; href: string; isLast: boolean }[] {
  const parts = pathname.split("/").filter(Boolean);
  const segments: { label: string; href: string; isLast: boolean }[] = [];

  const total = parts.length;

  for (let i = 0; i < total; i++) {
    const part = parts[i];
    const href = "/" + parts.slice(0, i + 1).join("/");
    const isLast = i === total - 1;

    if (part === "articles" && i < total - 1) {
      continue;
    }

    let label: string;
    if (i === total - 1 && parts[0] === "articles" && total === 2) {
      label = part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    } else {
      label = routeLabels[part] || part.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    }

    segments.push({ label, href, isLast });
  }

  return segments;
}

export default function Breadcrumbs({ articleTitle, categoryName }: { articleTitle?: string; categoryName?: string }) {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = buildSegments(pathname);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-[1180px] px-4 pt-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-dnews-muted">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 transition-colors hover:text-dnews-accent"
            aria-label="Home"
          >
            <Home size={13} />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </li>
        {segments.map((seg, idx) => (
          <li key={seg.href} className="flex items-center gap-1">
            <ChevronRight size={12} className="shrink-0" />
            {seg.isLast ? (
              <span className="max-w-[200px] truncate text-dnews-dark sm:max-w-[300px]">
                {seg.label}
              </span>
            ) : (
              <Link
                href={seg.href}
                className="transition-colors hover:text-dnews-accent"
              >
                {seg.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
