"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Settings,
  X,
  BarChart3,
  Megaphone,
  Newspaper,
  Building2,
  PenTool,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  roles: string[];
}

const allNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Editor", "Journalist", "Moderator"] },
  { href: "/dashboard/articles", label: "Articles", icon: FileText, roles: ["Admin", "Editor", "Journalist"] },
  { href: "/dashboard/editorial", label: "Editorial", icon: PenTool, roles: ["Admin", "Editor", "Journalist"] },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, roles: ["Admin", "Editor", "Journalist"] },
  { href: "/dashboard/analytics/traffic", label: "Traffic Sources", icon: TrendingUp, roles: ["Admin", "Editor"] },
  { href: "/dashboard/analytics/reports", label: "Reports", icon: FileText, roles: ["Admin", "Editor"] },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree, roles: ["Admin", "Editor"] },
  { href: "/dashboard/tags", label: "Tags", icon: Tags, roles: ["Admin", "Editor"] },
  { href: "/dashboard/media", label: "Media", icon: Image, roles: ["Admin", "Editor", "Journalist"] },
  { href: "/dashboard/users", label: "Users", icon: Users, roles: ["Admin"] },
  { href: "/dashboard/roles", label: "Roles", icon: ShieldCheck, roles: ["Admin"] },
  { href: "/dashboard/newsletter", label: "Subscribers", icon: Mail, roles: ["Admin"] },
  { href: "/dashboard/newsletter/campaigns", label: "Campaigns", icon: Send, roles: ["Admin", "Editor"] },
  { href: "/dashboard/advertisements", label: "Ad Dashboard", icon: Megaphone, roles: ["Admin"] },
  { href: "/dashboard/advertisements/ads", label: "Advertisements", icon: Newspaper, roles: ["Admin", "Editor", "Moderator"] },
  { href: "/dashboard/advertisements/campaigns", label: "Ad Campaigns", icon: Send, roles: ["Admin"] },
  { href: "/dashboard/advertisements/advertisers", label: "Advertisers", icon: Building2, roles: ["Admin"] },

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
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-dnews-border bg-dnews-card transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 h-16 items-center justify-between border-b border-dnews-border px-4">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="dark:bg-black dark:px-3 dark:py-1 dark:rounded-sm inline-block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo0.png"
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

        <nav className="flex-1 overflow-y-auto py-4 min-h-0">
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

        <div className="shrink-0 border-t border-dnews-border p-4">
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
