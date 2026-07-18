"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ShieldX } from "lucide-react";

interface RoleGuardProps {
  roles: string[];
  children: React.ReactNode;
}

export default function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user) return null;

  if (!roles.includes(user.role.name)) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <ShieldX size={48} className="mx-auto text-dnews-border" />
          <h3 className="mt-4 font-heading text-lg font-bold text-dnews-dark">
            Access Denied
          </h3>
          <p className="mt-2 max-w-md text-sm text-dnews-muted">
            You do not have permission to access this page. Please contact your
            administrator if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
