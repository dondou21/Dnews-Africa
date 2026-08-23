"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "dnews_read_articles";
const MAX_TRACKED = 200;

/**
 * Lightweight, anonymous-friendly read-state tracking.
 *
 * There is no requirement to log in to track reads, so we use a browser-local
 * store keyed by article id. This is intentionally separate from the server's
 * analytics `ArticleView` tracking (which is visitor/session based) and is only
 * used to keep the homepage hero from repeatedly showing consumed articles.
 */
export function useReadArticles() {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setReadIds(new Set(parsed.filter((x) => typeof x === "string")));
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (!id || prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        const arr = Array.from(next).slice(-MAX_TRACKED);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      } catch {
        // ignore storage failures
      }
      return next;
    });
  }, []);

  return { readIds, markRead };
}
