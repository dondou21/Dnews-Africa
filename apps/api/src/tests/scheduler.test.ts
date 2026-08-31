import { describe, it, expect, beforeEach, afterEach } from "vitest";
import prisma from "../utils/prisma";
import { schedulerService, publishDueArticles } from "../services/schedulerService";
import { createTestUser, cleanupTestData } from "./helpers";

describe("Scheduler Service", () => {
  let categoryId: number;
  let authorId: string;

  beforeEach(async () => {
    await cleanupTestData();
    const adminRole = await prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: { name: "Admin", description: "Administrator" },
    });
    const adminUser = await createTestUser("Admin");
    authorId = adminUser.user.id;

    const cat = await prisma.category.upsert({
      where: { slug: "sched-test-cat" },
      update: {},
      create: { name: "Sched Test", slug: "sched-test-cat" },
    });
    categoryId = cat.id;
  });

  afterEach(async () => {
    schedulerService.stop();
    await cleanupTestData();
  });

  it("is idempotent when start() is called multiple times and cleans up on stop()", () => {
    expect(() => {
      schedulerService.start();
      schedulerService.start(); // Should not create duplicate intervals
      schedulerService.stop();
      schedulerService.stop(); // Safe to call multiple times
    }).not.toThrow();
  });

  it("publishes due or overdue scheduled articles", async () => {
    const article = await prisma.article.create({
      data: {
        title: "Overdue Article",
        slug: "overdue-article",
        summary: "Summary",
        content: "Content",
        status: "SCHEDULED",
        scheduledAt: new Date(Date.now() - 120_000), // 2 mins ago
        categoryId,
        authorId,
        sendNewsletter: false,
      },
    });

    await publishDueArticles();

    const updated = await prisma.article.findUnique({ where: { id: article.id } });
    expect(updated?.status).toBe("PUBLISHED");
    expect(updated?.publishedAt).not.toBeNull();
  });

  it("does not publish future scheduled articles", async () => {
    const article = await prisma.article.create({
      data: {
        title: "Future Article",
        slug: "future-article",
        summary: "Summary",
        content: "Content",
        status: "SCHEDULED",
        scheduledAt: new Date(Date.now() + 3_600_000), // 1 hour in the future
        categoryId,
        authorId,
        sendNewsletter: false,
      },
    });

    await publishDueArticles();

    const updated = await prisma.article.findUnique({ where: { id: article.id } });
    expect(updated?.status).toBe("SCHEDULED");
    expect(updated?.publishedAt).toBeNull();
  });

  it("ignores drafts and already published articles", async () => {
    const draft = await prisma.article.create({
      data: {
        title: "Draft Article",
        slug: "draft-article",
        summary: "Summary",
        content: "Content",
        status: "DRAFT",
        categoryId,
        authorId,
        sendNewsletter: false,
      },
    });

    await publishDueArticles();

    const updated = await prisma.article.findUnique({ where: { id: draft.id } });
    expect(updated?.status).toBe("DRAFT");
  });
});
