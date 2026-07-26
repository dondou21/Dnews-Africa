import { EventEmitter } from "node:events";

export type ArticleEventType =
  | "article:published"
  | "article:updated"
  | "article:deleted"
  | "article:featured";

interface ArticleEventPayload {
  articleId: string;
  slug: string;
  title: string;
  categorySlug?: string;
  isFeatured?: boolean;
  publishedAt?: string;
}

class EventService extends EventEmitter {
  private sseClients: Set<import("http").ServerResponse> = new Set();

  constructor() {
    super();
    this.setMaxListeners(200);
  }

  emitArticleEvent(type: ArticleEventType, payload: ArticleEventPayload): void {
    const event = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
    this.emit(type, payload);
    for (const res of this.sseClients) {
      try {
        res.write(`event: ${type}\ndata: ${event}\n\n`);
      } catch {
        this.sseClients.delete(res);
      }
    }
  }

  addSseClient(res: import("http").ServerResponse): void {
    this.sseClients.add(res);
    res.on("close", () => {
      this.sseClients.delete(res);
    });
  }

  removeSseClient(res: import("http").ServerResponse): void {
    this.sseClients.delete(res);
  }
}

export const eventService = new EventService();
