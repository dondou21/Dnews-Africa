import prisma from "../utils/prisma";
import { cache } from "../utils/cache";
import { articleNewsletterService } from "./articleNewsletterService";
import { eventService } from "./eventService";

let isPolling = false;
let lastCheckTime = 0;
const CHECK_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown for opportunistic check

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

export async function publishDueArticles(force = false): Promise<void> {
  const now = Date.now();
  if (!force && now - lastCheckTime < CHECK_COOLDOWN_MS) {
    return;
  }
  if (isPolling) return;
  isPolling = true;
  lastCheckTime = now;

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
          const current = await prisma.article.findUnique({
            where: { id: article.id },
            select: { status: true },
          });
          if (current?.status !== "SCHEDULED") continue;

          await prisma.$transaction(async (tx) => {
            await tx.article.update({
              where: { id: article.id },
              data: { status: "PUBLISHED", publishedAt: new Date() },
            });

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

          console.log(`[scheduler] Published article "${article.title}" (${article.slug})`);
          cache.clearPrefix("articles:");
          cache.del("dashboard:stats");
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
            publishedAt: article.scheduledAt?.toISOString(),
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
    console.log("[scheduler] Background polling disabled to prevent unnecessary Neon compute consumption when idle.");
  },

  stop(): void {
    isPolling = false;
    console.log("[scheduler] Stopped");
  },
};
