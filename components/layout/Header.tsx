"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "next-themes";
import ThemeToggle from "@/components/theme/ThemeToggle";


export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { resolvedTheme } = useTheme();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  }

  return (
    <header className="border-b border-dnews-border bg-dnews-card">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-4">
        <div className="flex-1" />
        <div className="text-center">
          <Link href="/">
            {resolvedTheme === "dark" ? (
              <Image
                src="/images/logo-black_and_white.jpeg"
                alt="Dnews Africa"
                width={320}
                height={80}
                priority
                className="mx-auto h-auto w-[200px] object-contain sm:w-[260px] md:w-[320px]"
                sizes="(max-width: 640px) 200px, (max-width: 768px) 260px, 320px"
              />
            ) : (
              <Image
                src="/images/logo-red.jpeg"
                alt="Dnews Africa"
                width={320}
                height={80}
                priority
                className="mx-auto h-auto w-[200px] object-contain sm:w-[260px] md:w-[320px]"
                sizes="(max-width: 640px) 200px, (max-width: 768px) 260px, 320px"
              />
            )}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-2">
          <form onSubmit={handleSubmit} className="hidden md:flex items-center gap-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-32 border border-dnews-border bg-dnews-bg px-2 py-1.5 text-xs text-dnews-dark placeholder-dnews-muted outline-none focus:w-40 focus:border-dnews-accent transition-all"
            />
            <button
              type="submit"
              className="rounded border border-dnews-border px-2 py-1.5 text-xs text-dnews-gray hover:bg-dnews-light-gray"
            >
              Search
            </button>
          </form>
          <ThemeToggle />
          <button
            className="rounded border border-dnews-border px-3 py-1.5 text-sm text-dnews-gray hover:bg-dnews-light-gray"
            aria-label="Menu"
          >
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}
