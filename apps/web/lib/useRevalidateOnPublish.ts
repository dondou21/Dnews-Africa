"use client";

import { useEffect, useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface ArticlePublishedEvent {
  type: "article:published";
  payload: {
    articleId: string;
    slug: string;
    title: string;
    categorySlug?: string;
    isFeatured?: boolean;
    publishedAt?: string;
  };
  timestamp: string;
}

type EventCallback = (event: ArticlePublishedEvent) => void;

export function useRevalidateOnPublish(callback: EventCallback): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let mounted = true;

    function connect() {
      if (!mounted) return;

      eventSource = new EventSource(`${API_BASE_URL}/public/events`);

      eventSource.addEventListener("article:published", (e) => {
        try {
          const event: ArticlePublishedEvent = JSON.parse(e.data);
          if (mounted) callbackRef.current(event);
        } catch {
          /* ignore malformed events */
        }
      });

      eventSource.addEventListener("article:updated", (e) => {
        try {
          const event: ArticlePublishedEvent = JSON.parse(e.data);
          if (mounted) callbackRef.current(event);
        } catch {
          /* ignore malformed events */
        }
      });

      eventSource.onerror = () => {
        eventSource?.close();
        if (mounted) {
          reconnectTimeout = setTimeout(connect, 15000);
        }
      };
    }

    connect();

    return () => {
      mounted = false;
      eventSource?.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);
}
