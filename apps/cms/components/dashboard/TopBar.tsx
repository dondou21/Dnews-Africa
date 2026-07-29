"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, Search, LogOut, User as UserIcon, Settings, ChevronDown } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

interface TopBarProps {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : "DA";

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Admin User";

  const roleName = user?.role.name ?? "Administrator";

  const dashboardTitle = user ? `${user.role.name} Dashboard` : "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-dnews-border bg-dnews-card/95 backdrop-blur-sm px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-dnews-gray hover:bg-dnews-light-gray transition-colors lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="font-heading text-lg font-bold text-dnews-dark truncate">{dashboardTitle}</h1>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-dnews-gray hover:bg-dnews-light-gray transition-colors"
          aria-label="Search"
        >
          <Search size={18} />
        </button>

        <ThemeToggle />
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-3 rounded-lg border border-dnews-border pl-3 pr-2 py-1.5 transition-colors hover:bg-dnews-light-gray"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-dnews-accent text-xs font-bold text-white">
            {initials}
          </div>
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium leading-tight text-dnews-dark">{displayName}</p>
            <p className="text-xs leading-tight text-dnews-muted">{roleName}</p>
          </div>
          <ChevronDown size={14} className={`text-dnews-muted transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-dnews-border bg-dnews-card py-1 shadow-lg">
            <div className="border-b border-dnews-border px-4 py-3">
              <p className="text-sm font-medium text-dnews-dark">{displayName}</p>
              <p className="text-xs text-dnews-muted">{user?.email}</p>
            </div>
            <Link
              href="/dashboard/settings"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-dnews-gray transition-colors hover:bg-dnews-light-gray hover:text-dnews-dark"
            >
              <Settings size={16} />
              Settings
            </Link>
            <button
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-dnews-gray transition-colors hover:bg-dnews-light-gray hover:text-dnews-red"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
