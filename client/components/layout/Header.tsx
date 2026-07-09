"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SearchOverlay from "@/components/layout/SearchOverlay";
import SponsorBanner from "@/components/layout/SponsorBanner";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  return (
    <header className="border-b border-dnews-border bg-dnews-card dark:bg-white">
      <SponsorBanner />
      <div className="mx-auto max-w-[1180px] px-4 py-2 md:py-3">
        <div className="flex items-center justify-center">
          <Link href="/">
            <Image
              src="/images/logo0.png"
              alt="Dnews Africa"
              width={280}
              height={70}
              priority
              className="h-auto w-[160px] object-contain sm:w-[200px] md:w-[240px]"
              sizes="(max-width: 640px) 160px, (max-width: 768px) 240px, 260px"
            />
          </Link>
        </div>

        <div className="mt-2 flex items-center justify-center gap-3 md:mt-3">
          <p className="text-center text-[10px] uppercase tracking-[0.2em] text-dnews-muted md:text-[11px]">
            Independent news media across the continent and the world
          </p>
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={toggleSearch}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:bg-dnews-light-gray"
              aria-label="Open search"
            >
              <Search size={18} />
            </button>
            <ThemeToggle />
            <a
              href="#newsletter"
              className="inline-flex h-8 items-center justify-center rounded bg-dnews-accent px-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            >
              Subscribe
            </a>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center gap-3 md:hidden">
          <button
            onClick={toggleSearch}
            className="inline-flex h-8 w-8 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:bg-dnews-light-gray"
            aria-label="Open search"
          >
            <Search size={18} />
          </button>
          <ThemeToggle />
          <a
            href="#newsletter"
            className="inline-flex h-8 items-center justify-center rounded bg-dnews-accent px-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
          >
            Subscribe
          </a>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
