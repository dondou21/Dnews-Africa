import prisma from "../utils/prisma";
import { invalidateArticlesCache } from "../repositories/articleRepository";
import { articleNewsletterService } from "./articleNewsletterService";
import { eventService } from "./eventService";

let isPolling = false;
const MAX_TIMEOUT_MS = 2_147_000_000;
const scheduledTimers = new Map<string, ReturnType<typeof setTimeout>>();
let isStarted = false;

function clearScheduledTimer(articleId: string): void {
  const timer = scheduledTimers.get(articleId);
  if (timer) clearTimeout(timer);
  scheduledTimers.delete(articleId);
}

function scheduleTimer(articleId: string, scheduledAt: Date): void {
  clearScheduledTimer(articleId);

  const delay = scheduledAt.getTime() - Date.now();
  const timer = setTimeout(async () => {
    scheduledTimers.delete(articleId);
    if (delay > MAX_TIMEOUT_MS) {
      scheduleTimer(articleId, scheduledAt);
      return;
    }
    await publishDueArticles(true).catch((err) => {
      console.error(`[scheduler] Failed to publish scheduled article ${articleId}:`, err);
    });

    const remaining = await prisma.article.findUnique({
      where: { id: articleId },
      select: { status: true, scheduledAt: true },
    }).catch(() => null);
    if (remaining?.status === "SCHEDULED" && remaining.scheduledAt) {
      scheduleTimer(articleId, remaining.scheduledAt);
    }
  }, Math.max(0, Math.min(delay, MAX_TIMEOUT_MS)));

  scheduledTimers.set(articleId, timer);
}

export function registerScheduledArticle(articleId: string, scheduledAt: Date): void {
  if (scheduledAt.getTime() <= Date.now()) {
    void publishDueArticles(true);
    return;
  }
  scheduleTimer(articleId, scheduledAt);
}

export function cancelScheduledArticle(articleId: string): void {
  clearScheduledTimer(articleId);
}

async function hydrateScheduledArticles(): Promise<void> {
  const articles = await prisma.article.findMany({
    where: { status: "SCHEDULED", scheduledAt: { not: null } },
    select: { id: true, scheduledAt: true },
  });

  if (!isStarted) return;
  for (const article of articles) {
    if (!isStarted) return;
    if (article.scheduledAt) scheduleTimer(article.id, article.scheduledAt);
  }
  console.log(`[scheduler] Registered ${articles.length} scheduled article timer(s)`);
}

async function getSystemUser(): Promise<{ id: string }> {
  const admin = await prisma.user.findFirst({
    where: { role: { name: "Admin" } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (admin) return admin;
  const anyUser = await prisma.user.findFirst({ select: { id: true } });
  if (anyUser) return anyUser;
  throw new Error("Cannot find any user for scheduler audit logs");
}

export async function publishDueArticles(_force = false): Promise<void> {
  if (isPolling) return;
  isPolling = true;

  try {
    const dueArticles = await prisma.article.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: new Date() },
      },
      select: { id: true, title: true, slug: true, isFeatured: true, categoryId: true, scheduledAt: true },
    });

    if (dueArticles.length > 0) {
      console.log(`[scheduler] Found ${dueArticles.length} due article(s)`);
      const sysUser = await getSystemUser();

      for (const article of dueArticles) {
        try {
          const publishedAt = new Date();
          let published = false;
          await prisma.$transaction(async (tx) => {
            const updated = await tx.article.updateMany({
              where: { id: article.id, status: "SCHEDULED" },
              data: { status: "PUBLISHED", publishedAt },
            });
            if (updated.count === 0) return;
            published = true;

            await tx.articleAuditLog.create({
              data: {
                articleId: article.id,
                userId: sysUser.id,
                action: "PUBLISHED",
                fromStatus: "SCHEDULED",
                toStatus: "PUBLISHED",
                description: "Automatically published by scheduler at scheduled time",
              },
            });
          });

          if (!published) continue;

          console.log(`[scheduler] Published article "${article.title}" (${article.slug})`);
          invalidateArticlesCache();
          console.log(`[scheduler] Triggering newsletter for article ${article.id}`);
          articleNewsletterService.sendArticleNewsletter(article.id).catch((err) => {
            console.error(`[scheduler] Failed to send newsletter for article ${article.id}:`, err);
          });
          const catSlug = article.categoryId
            ? (await prisma.category.findUnique({ where: { id: article.categoryId }, select: { slug: true } }))?.slug
            : undefined;

          eventService.emitArticleEvent("article:published", {
            articleId: article.id,
            slug: article.slug,
            title: article.title,
            categorySlug: catSlug,
            isFeatured: article.isFeatured,
            publishedAt: publishedAt.toISOString(),
          });
        } catch (err) {
          console.error(`[scheduler] Failed to publish article ${article.id}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("[scheduler] Error checking due articles:", err);
  } finally {
    isPolling = false;
  }
}

export const schedulerService = {
  start(): void {
    if (isStarted) return;
    isStarted = true;
    hydrateScheduledArticles().catch((err) => {
      console.error("[scheduler] Failed to register scheduled articles:", err);
    });
  },

  stop(): void {
    for (const articleId of scheduledTimers.keys()) clearScheduledTimer(articleId);
    isPolling = false;
    isStarted = false;
    console.log("[scheduler] Stopped");
  },
};
