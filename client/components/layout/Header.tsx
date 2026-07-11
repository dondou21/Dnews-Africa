"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Search } from "lucide-react";
import { useTheme } from "next-themes";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SearchOverlay from "@/components/layout/SearchOverlay";
import SponsorBanner from "@/components/layout/SponsorBanner";

export default function Header() {
  const { theme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  return (
    <header className="border-b border-dnews-border bg-dnews-card dark:bg-black">
      <SponsorBanner />
      <div className="mx-auto max-w-[1180px] px-4 py-1 md:py-1.5">
        <div className="flex items-center justify-center">
          <Link href="/">
            <Image
              src={theme === "dark" ? "/images/logo1.png" : "/images/logo0.png"}
              alt="Dnews Africa"
              width={200}
              height={50}
              priority
              className="h-auto w-[120px] object-contain sm:w-[150px] md:w-[160px]"
              sizes="(max-width: 640px) 120px, (max-width: 768px) 160px, 180px"
            />
          </Link>
        </div>

        <div className="mt-1 flex items-center justify-center gap-2 md:mt-1.5">
          <p className="text-center text-[9px] uppercase tracking-[0.15em] text-dnews-muted dark:text-white/60 md:text-[10px]">
            Independent news media across the continent and the world
          </p>
          <div className="hidden items-center gap-2 md:flex">
            <button
              onClick={toggleSearch}
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:bg-dnews-light-gray dark:border-white/30 dark:text-white/60 dark:hover:bg-white/10"
              aria-label="Open search"
            >
              <Search size={16} />
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-1 flex items-center justify-center gap-2 md:hidden">
          <button
            onClick={toggleSearch}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:bg-dnews-light-gray dark:border-white/30 dark:text-white/60 dark:hover:bg-white/10"
            aria-label="Open search"
          >
            <Search size={16} />
          </button>
          <ThemeToggle />
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
