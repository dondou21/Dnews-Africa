"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { post, get, clearToken, saveToken, saveUser, getStoredUser } from "@dnews/api-client";
import type { User, LoginResponse } from "@dnews/types";

type RoleName = "Admin" | "Editor" | "Journalist" | "Moderator";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: RoleName[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    setUser(null);
    clearToken();
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const stored = getStoredUser<User>();
    const token = typeof window !== "undefined" ? localStorage.getItem("dnews_token") : null;

    if (!token || !stored) {
      setLoading(false);
      setInitialized(true);
      return;
    }

    get<User>("/auth/me")
      .then((u) => {
        setUser(u);
        saveUser(u);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
        setInitialized(true);
      });
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const isLogin = pathname === "/login";
    const hasToken = typeof window !== "undefined" ? localStorage.getItem("dnews_token") : null;

    if (isLogin && user) {
      router.replace("/dashboard");
    } else if (!isLogin && !hasToken) {
      router.replace("/login");
    }
  }, [initialized, user, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await post<LoginResponse>("/auth/login", { email, password });
      saveToken(res.token);
      saveUser(res.user);
      setUser(res.user);
      router.push("/dashboard");
    },
    [router]
  );

  const hasRole = useCallback(
    (...roles: RoleName[]) => {
      if (!user) return false;
      return roles.includes(user.role.name as RoleName);
    },
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
