"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeCtx = createContext<ThemeContextValue>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeCtx);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch {}
  return "system";
}

const STORAGE_KEY = "theme";
const SCRIPT_ID = "dnews-theme-init";

const themeScript = `!function(){var k="theme",d="system",a="class",t=["light","dark"];function g(){try{var s=localStorage.getItem(k);if(s)return s}catch(e){}return d}function s(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function h(v){var r=v==="system"?s():v,o=document.documentElement;o.classList.remove.apply(o.classList,t);o.classList.add(r);o.style.colorScheme=r}h(g())}();`;

function injectScript() {
  if (document.getElementById(SCRIPT_ID)) return;
  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.textContent = themeScript;
  document.head.insertBefore(s, document.head.firstChild);
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    injectScript();
    return getStoredTheme();
  });

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const stored = getStoredTheme();
    return stored === "system" ? getSystemTheme() : stored;
  });

  useEffect(() => {
    const stored = getStoredTheme();
    const resolved = stored === "system" ? getSystemTheme() : stored;
    setResolvedTheme(resolved);
    applyTheme(resolved);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (getStoredTheme() === "system") {
        const sys = getSystemTheme();
        setResolvedTheme(sys);
        applyTheme(sys);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
    setThemeState(t);
    const resolved = t === "system" ? getSystemTheme() : t;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  return (
    <ThemeCtx.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}
