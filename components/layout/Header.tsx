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
      <div className="mx-auto max-w-[1180px] px-4 py-3 md:py-5">
        <div className="flex items-stretch">
          <div className="flex-1" />

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

            <div className="mt-4 flex flex-col items-center gap-2 md:mt-5 md:flex-row md:gap-0">
              <p className="text-center text-[10px] uppercase tracking-[0.2em] text-dnews-muted md:text-[11px]">
                Independent news media across the continent and the world
              </p>
              <div className="hidden md:block md:w-12 lg:w-14" />
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleSearch}
                  className="inline-flex h-10 w-10 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:bg-dnews-light-gray"
                  aria-label="Open search"
                >
                  <Search size={20} />
                </button>
                <ThemeToggle />
                <a
                  href="#newsletter"
                  className="ml-2 inline-flex h-10 items-center justify-center rounded bg-dnews-accent px-4 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light md:ml-3 md:px-5 md:text-sm"
                >
                  Subscribe
                </a>
              </div>
            </div>
          </div>

          <div className="flex-1" />
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
