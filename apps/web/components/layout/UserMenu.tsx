"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FileText, LayoutDashboard, Settings, LogOut, ChevronDown } from "lucide-react";
import type { User as UserType } from "@dnews/types";

const DASHBOARD_ROLES = ["Admin", "Editor", "Chief Editor", "Journalist", "Moderator"];

function getInitials(user: UserType): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

export default function UserMenu({ user, onLogout }: { user: UserType; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const fullName = `${user.firstName} ${user.lastName}`;
  const canAccessDashboard = DASHBOARD_ROLES.includes(user.role.name);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded border border-dnews-border px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-dnews-gray transition-colors hover:bg-dnews-light-gray dark:border-white/30 dark:text-white/60 dark:hover:bg-white/10"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-5 w-5 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-dnews-accent text-[9px] font-bold text-white">
            {getInitials(user)}
          </span>
        )}
        <span className="hidden sm:inline max-w-[80px] truncate">{user.firstName}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 rounded border border-dnews-border bg-dnews-card py-1 shadow-lg dark:bg-neutral-900 z-50">
          <div className="border-b border-dnews-border px-3 py-2">
            <p className="text-xs font-semibold text-dnews-dark dark:text-white">{fullName}</p>
            <p className="text-[10px] text-dnews-muted">{user.role.name}</p>
          </div>

          {canAccessDashboard && (
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-dnews-dark transition-colors hover:bg-dnews-light-gray dark:text-white/80 dark:hover:bg-white/5"
            >
              <Settings size={14} />
              Settings
            </Link>
          )}

          {user.role.name === "Journalist" && (
            <Link
              href="/dashboard/articles"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-dnews-dark transition-colors hover:bg-dnews-light-gray dark:text-white/80 dark:hover:bg-white/5"
            >
              <FileText size={14} />
              My Articles
            </Link>
          )}

          {canAccessDashboard && (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-dnews-dark transition-colors hover:bg-dnews-light-gray dark:text-white/80 dark:hover:bg-white/5"
            >
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          )}

          <div className="border-t border-dnews-border" />

          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-dnews-light-gray dark:text-red-400 dark:hover:bg-white/5"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
