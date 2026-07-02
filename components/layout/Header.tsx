"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { Search, Menu, X as XIcon } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SearchOverlay from "@/components/layout/SearchOverlay";

export default function Header() {
  const { resolvedTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const logoSrc =
    resolvedTheme === "dark"
      ? "/images/logo-black_and_white.jpeg"
      : "/images/logo-red.jpeg";

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  return (
    <header className="border-b border-dnews-border bg-dnews-card">
      <div className="mx-auto max-w-[1180px] px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="w-[76px] md:w-[88px]" />

          <div className="text-center">
            <Link href="/">
              <Image
                src={logoSrc}
                alt="Dnews Africa"
                width={260}
                height={65}
                priority
                className="mx-auto h-auto w-[170px] object-contain sm:w-[190px] md:w-[220px] lg:w-[260px]"
                sizes="(max-width: 640px) 170px, (max-width: 768px) 220px, 260px"
              />
            </Link>
            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-dnews-muted md:text-[11px]">
              Independent news media across the continent and the world
            </p>
          </div>

          <div className="flex w-[76px] items-center justify-end gap-1.5 md:w-[88px] md:gap-2">
            <button
              onClick={toggleSearch}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:bg-dnews-light-gray"
              aria-label="Open search"
            >
              <Search size={16} />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:bg-dnews-light-gray"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <XIcon size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
