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
  Clock,
  MessageCircle,
  Settings,
  X,
  BarChart3,
  Megaphone,
  Newspaper,
  Building2,
  PenTool,
  TrendingUp,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Admin", "Editor", "Journalist", "Moderator"] },
      { href: "/dashboard/articles", label: "Articles", icon: FileText, roles: ["Admin", "Editor", "Journalist"] },
      { href: "/dashboard/editorial", label: "Editorial", icon: PenTool, roles: ["Admin", "Editor", "Journalist"] },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/dashboard/categories", label: "Categories", icon: FolderTree, roles: ["Admin", "Editor"] },
      { href: "/dashboard/subcategories", label: "Subcategories", icon: FolderTree, roles: ["Admin", "Editor"] },
      { href: "/dashboard/tags", label: "Tags", icon: Tags, roles: ["Admin", "Editor"] },
      { href: "/dashboard/media", label: "Media", icon: Image, roles: ["Admin", "Editor", "Journalist"] },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, roles: ["Admin", "Editor", "Journalist"] },
      { href: "/dashboard/analytics/traffic", label: "Traffic", icon: TrendingUp, roles: ["Admin", "Editor"] },
      { href: "/dashboard/analytics/reports", label: "Reports", icon: FileText, roles: ["Admin", "Editor"] },
    ],
  },
  {
    title: "Newsletter",
    items: [
      { href: "/dashboard/newsletter", label: "Subscribers", icon: Mail, roles: ["Admin"] },
      { href: "/dashboard/newsletter/campaigns", label: "Campaigns", icon: Send, roles: ["Admin", "Editor"] },
      { href: "/dashboard/newsletter/deliveries", label: "Deliveries", icon: Clock, roles: ["Admin", "Editor"] },
    ],
  },
  {
    title: "Advertising",
    items: [
      { href: "/dashboard/advertisements", label: "Ad Dashboard", icon: Megaphone, roles: ["Admin"] },
      { href: "/dashboard/advertisements/ads", label: "Advertisements", icon: Newspaper, roles: ["Admin", "Editor", "Moderator"] },
      { href: "/dashboard/advertisements/campaigns", label: "Campaigns", icon: Send, roles: ["Admin"] },
      { href: "/dashboard/advertisements/advertisers", label: "Advertisers", icon: Building2, roles: ["Admin"] },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/dashboard/users", label: "Users", icon: Users, roles: ["Admin"] },
      { href: "/dashboard/roles", label: "Roles", icon: ShieldCheck, roles: ["Admin"] },
      { href: "/dashboard/messages", label: "Messages", icon: MessageCircle, roles: ["Admin", "Editor"] },
      { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["Admin", "Editor", "Journalist", "Moderator"] },
    ],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(navSections.map((s) => s.title))
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-60 flex-col border-r border-dnews-border bg-dnews-sidebar transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 h-16 items-center justify-between border-b border-dnews-border px-4">
          <Link href="/dashboard" onClick={onClose} className="inline-flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo0.png"
              alt="Dnews Africa"
              className="h-auto w-[110px] object-contain"
            />
          </Link>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-dnews-gray hover:bg-dnews-light-gray lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((item) =>
              user && item.roles.includes(user.role.name)
            );
            if (visibleItems.length === 0) return null;

            const isExpanded = expandedSections.has(section.title);

            return (
              <div key={section.title} className="mb-1">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex w-full items-center justify-between px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-dnews-muted hover:text-dnews-gray transition-colors"
                >
                  {section.title}
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isExpanded && (
                  <ul className="space-y-0.5 px-3">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
                              active
                                ? "bg-dnews-accent text-white shadow-sm"
                                : "text-dnews-gray hover:bg-dnews-light-gray hover:text-dnews-dark"
                            }`}
                          >
                            {active && (
                              <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-r bg-white" />
                            )}
                            <Icon
                              size={18}
                              className={active ? "text-white" : "text-dnews-muted group-hover:text-dnews-dark"}
                            />
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-dnews-border p-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-dnews-muted transition-all duration-150 hover:bg-dnews-light-gray hover:text-dnews-accent"
          >
            <ExternalLink size={14} />
            View Site
          </Link>
        </div>
      </aside>
    </>
  );
}
