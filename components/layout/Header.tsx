"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SearchOverlay from "@/components/layout/SearchOverlay";

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  return (
    <header className="border-b border-dnews-border bg-dnews-card">
      <div className="mx-auto max-w-[1180px] px-4 py-3 md:py-4">
        <div className="flex items-stretch justify-between">
          <div className="w-[76px] shrink-0 md:w-[88px]" />

          <div className="flex flex-col items-center">
            <div
              className="flex items-center justify-center rounded-sm bg-dnews-red
                w-[90vw] max-w-[380px] min-h-[130px]
                sm:w-[90vw] sm:max-w-[500px] sm:min-h-[160px]
                md:max-w-[700px] md:min-h-[200px]
                lg:max-w-[900px] lg:min-h-[250px]"
            >
              <Link href="/">
                <Image
                  src="/images/logo-red.jpeg"
                  alt="Dnews Africa"
                  width={350}
                  height={88}
                  priority
                  className="mx-auto h-auto w-[180px] object-contain sm:w-[220px] md:w-[280px] lg:w-[340px]"
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 280px, 340px"
                />
              </Link>
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.2em] text-dnews-muted md:mt-4 md:text-[11px]">
              Independent news media across the continent and the world
            </p>
          </div>

          <div className="flex w-[76px] shrink-0 flex-col justify-end pb-0 pl-3 md:w-[88px] md:pb-0.5 md:pl-4">
            <div className="flex items-center justify-end gap-2 md:gap-3">
              <button
                onClick={toggleSearch}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:bg-dnews-light-gray"
                aria-label="Open search"
              >
                <Search size={16} />
              </button>
              <ThemeToggle />
              <a
                href="#newsletter"
                className="inline-flex items-center justify-center rounded bg-dnews-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light md:px-4 md:text-sm"
              >
                Subscribe
              </a>
            </div>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
