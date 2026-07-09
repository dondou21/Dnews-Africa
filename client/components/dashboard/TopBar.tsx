"use client";

import { Menu, Search } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface TopBarProps {
  onMenuClick: () => void;
  title?: string;
}

export default function TopBar({ onMenuClick, title = "Dashboard" }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-dnews-border bg-dnews-card px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded text-dnews-gray hover:bg-dnews-light-gray lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1">
        <h1 className="font-heading text-lg font-bold text-dnews-dark">{title}</h1>
      </div>

      <button
        className="inline-flex h-9 w-9 items-center justify-center rounded text-dnews-gray hover:bg-dnews-light-gray"
        aria-label="Search"
      >
        <Search size={18} />
      </button>

      <ThemeToggle />

      <div className="flex items-center gap-3 border-l border-dnews-border pl-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dnews-accent text-xs font-bold text-white">
          DA
        </div>
        <div className="hidden text-sm md:block">
          <p className="font-medium text-dnews-dark">Admin User</p>
          <p className="text-xs text-dnews-muted">Administrator</p>
        </div>
      </div>
    </header>
  );
}
