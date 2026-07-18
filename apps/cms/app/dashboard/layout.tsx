"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import LoadingState from "@/components/dashboard/LoadingState";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  const isLoginPage = pathname === "/dashboard/login" || pathname === "/login";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dnews-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-dnews-accent border-t-transparent" />
          <p className="text-sm text-dnews-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col lg:ml-60">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-dnews-bg p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
