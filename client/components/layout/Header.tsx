"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useSyncExternalStore, useState } from "react";
import { Search, Bell, LayoutDashboard, LogIn } from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SearchOverlay from "@/components/layout/SearchOverlay";

export default function Header() {
  const { theme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const authenticated = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      return () => window.removeEventListener("storage", onStoreChange);
    },
    () => (typeof window !== "undefined" ? !!localStorage.getItem("dnews_token") : false),
    () => false,
  );

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => !prev);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  const userButton = authenticated ? (
    <Link
      href="/dashboard"
      className="inline-flex items-center gap-1.5 rounded-sm border border-dnews-border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-dnews-gray transition-colors hover:bg-dnews-light-gray dark:border-white/30 dark:text-white/60 dark:hover:bg-white/10"
      aria-label="Go to dashboard"
    >
      <LayoutDashboard size={13} />
      <span className="hidden sm:inline">Dashboard</span>
    </Link>
  ) : (
    <Link
      href="/dashboard/login"
      className="inline-flex items-center gap-1.5 rounded-sm border border-dnews-border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-dnews-gray transition-colors hover:bg-dnews-light-gray dark:border-white/30 dark:text-white/60 dark:hover:bg-white/10"
      aria-label="Sign in"
    >
      <LogIn size={13} />
      <span className="hidden sm:inline">Sign In</span>
    </Link>
  );

  return (
    <header className="border-b border-dnews-border bg-dnews-card dark:bg-black">
      <div className="mx-auto max-w-[1180px] px-4 py-1 md:py-1.5">
        <div className="flex items-center justify-center">
          <Link href="/">
            <Image
              src={theme === "dark" ? "/images/logo1.png" : "/images/logo0.png"}
              alt="Dnews Africa"
              width={280}
              height={70}
              priority
              className="h-auto w-[180px] object-contain sm:w-[220px] md:w-[260px]"
              sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 260px"
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
            <Link
              href="/#newsletter"
              className="inline-flex items-center gap-1.5 rounded-sm bg-dnews-accent px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
              aria-label="Subscribe to newsletter"
            >
              <Bell size={13} />
              Subscribe
            </Link>
            {userButton}
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
          <Link
            href="/#newsletter"
            className="inline-flex items-center gap-1 rounded-sm bg-dnews-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
            aria-label="Subscribe to newsletter"
          >
            <Bell size={12} />
            Subscribe
          </Link>
          {userButton}
        </div>
      </div>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
