"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  Image,
  Users,
  ShieldCheck,
  Mail,
  Send,
  MessageCircle,
  MessageSquare,
  Settings,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  roles: string[];
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: ["Admin", "Editor", "Journalist", "Moderator"] },
  { href: "/dashboard/articles", label: "Articles", icon: FileText, roles: ["Admin", "Editor", "Journalist"] },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree, roles: ["Admin", "Editor"] },
  { href: "/dashboard/tags", label: "Tags", icon: Tags, roles: ["Admin", "Editor"] },
  { href: "/dashboard/comments", label: "Comments", icon: MessageSquare, roles: ["Admin", "Editor", "Moderator"] },
  { href: "/dashboard/media", label: "Media", icon: Image, roles: ["Admin", "Editor", "Journalist"] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["Admin"] },
  { href: "/dashboard/roles", label: "Roles", icon: ShieldCheck, roles: ["Admin"] },
  { href: "/dashboard/newsletter", label: "Subscribers", icon: Mail, roles: ["Admin"] },
  { href: "/dashboard/newsletter/campaigns", label: "Campaigns", icon: Send, roles: ["Admin", "Editor"] },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle, roles: ["Admin", "Editor"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["Admin", "Editor", "Journalist", "Moderator"] },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme } = useTheme();

  const navItems = allNavItems.filter((item) => {
    if (!user) return false;
    return item.roles.includes(user.role.name);
  });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-dnews-border bg-dnews-card transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-dnews-border px-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="dark:bg-black dark:px-3 dark:py-1 dark:rounded-sm inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={theme === "dark" ? "/images/logo1.png" : "/images/logo0.png"}
              alt="Dnews Africa"
              className="h-auto w-[120px] object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded text-dnews-gray hover:bg-dnews-light-gray lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-dnews-accent text-white"
                        : "text-dnews-gray hover:bg-dnews-light-gray hover:text-dnews-accent"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-dnews-border p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-dnews-muted transition-colors hover:text-dnews-accent"
          >
            &larr; Back to site
          </Link>
        </div>
      </aside>
    </>
  );
}
