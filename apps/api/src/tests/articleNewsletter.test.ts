import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import prisma from "../utils/prisma";
import { articleNewsletterService } from "../services/articleNewsletterService";
import { createTestUser, cleanupTestData } from "./helpers";

let editorToken: string;
let authorId: string;
let categoryId: number;

async function reset() {
  await prisma.articleNewsletterRecipient.deleteMany({});
  await prisma.articleNewsletterDelivery.deleteMany({});
  await prisma.article.deleteMany({ where: { slug: { startsWith: "nl-test-" } } });
  await prisma.newsletterSubscriber.deleteMany({ where: { email: { startsWith: "nl-test-" } } });
}

async function createSubscriber(data: {
  email: string;
  status?: "ACTIVE" | "UNSUBSCRIBED" | "PENDING";
  verified?: boolean;
  unsubscribeToken?: string | null;
  preferences?: Record<string, boolean> | null;
}) {
  return prisma.newsletterSubscriber.create({
    data: {
      email: data.email,
      name: "Test User",
      status: data.status ?? "ACTIVE",
      verified: data.verified ?? true,
      unsubscribeToken: data.unsubscribeToken ?? `token-${data.email}`,
      ...(data.preferences ? { preferences: data.preferences } : {}),
    },
  });
}

async function createArticle(slug: string, status = "PUBLISHED", sendNewsletter = true, catId = categoryId) {
  return prisma.article.create({
    data: {
      title: `Title ${slug}`,
      slug,
      summary: `Summary ${slug}`,
      content: `Content ${slug}`,
      status: status as never,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      sendNewsletter,
      categoryId: catId,
      authorId,
    },
  });
}

async function waitForDelivery(articleId: string, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const delivery = await prisma.articleNewsletterDelivery.findUnique({
      where: { articleId },
    });
    if (delivery) return delivery;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}

beforeAll(async () => {
  const editor = await createTestUser("Editor");
  editorToken = editor.token;
  authorId = editor.user.id;

  const category = await prisma.category.findUnique({ where: { slug: "top-stories" } });
  if (!category) throw new Error("Test category not found");
  categoryId = category.id;
});

afterAll(async () => {
  await cleanupTestData();
});

describe("ArticleNewsletterService.sendArticleNewsletter", () => {
  it("should only send to verified active subscribers and respect preferences", async () => {
    await reset();

    const subActive = await createSubscriber({ email: "nl-test-active@example.com" });
    const subNoToken = await createSubscriber({
      email: "nl-test-notoken@example.com",
      unsubscribeToken: null,
    });
    const subUnverified = await createSubscriber({
      email: "nl-test-unverified@example.com",
      verified: false,
    });
    const subUnsubscribed = await createSubscriber({
      email: "nl-test-unsubscribed@example.com",
      status: "UNSUBSCRIBED",
    });
    const subOptedOut = await createSubscriber({
      email: "nl-test-optout@example.com",
      preferences: { [String(categoryId)]: false },
    });

    const article = await createArticle("nl-test-send-1");

    await articleNewsletterService.sendArticleNewsletter(article.id);

    const delivery = await prisma.articleNewsletterDelivery.findUnique({
      where: { articleId: article.id },
      include: { recipients: true },
    });

    expect(delivery).not.toBeNull();
    expect(delivery!.status).toBe("SENT");
    expect(delivery!.totalRecipients).toBe(2);
    expect(delivery!.totalSent).toBe(2);
    expect(delivery!.totalFailed).toBe(0);

    const recipientIds = delivery!.recipients.map((r) => r.subscriberId);
    expect(recipientIds).toContain(subActive.id);
    expect(recipientIds).toContain(subNoToken.id);
    expect(recipientIds).not.toContain(subUnverified.id);
    expect(recipientIds).not.toContain(subUnsubscribed.id);
    expect(recipientIds).not.toContain(subOptedOut.id);

    const updated = await prisma.newsletterSubscriber.findUnique({
      where: { id: subNoToken.id },
    });
    expect(updated?.unsubscribeToken).toBeTruthy();

    const published = await prisma.article.findUnique({ where: { id: article.id } });
    expect(published?.newsletterSentAt).not.toBeNull();
  });

  it("should not send duplicates on repeated trigger", async () => {
    await reset();

    await createSubscriber({ email: "nl-test-active@example.com" });

    const article = await createArticle("nl-test-dup");

    await articleNewsletterService.sendArticleNewsletter(article.id);
    await articleNewsletterService.sendArticleNewsletter(article.id);

    const deliveries = await prisma.articleNewsletterDelivery.findMany({
      where: { articleId: article.id },
      include: { recipients: true },
    });

    expect(deliveries).toHaveLength(1);
    expect(deliveries[0].status).toBe("SENT");
    expect(deliveries[0].recipients).toHaveLength(1);
  });

  it("should skip articles with newsletter disabled", async () => {
    await reset();

    await createSubscriber({ email: "nl-test-active@example.com" });

    const article = await createArticle("nl-test-disabled", "PUBLISHED", false);

    await articleNewsletterService.sendArticleNewsletter(article.id);

    const delivery = await prisma.articleNewsletterDelivery.findUnique({
      where: { articleId: article.id },
    });
    expect(delivery).toBeNull();
  });

  it("should skip non-published articles", async () => {
    await reset();

    await createSubscriber({ email: "nl-test-active@example.com" });

    const article = await createArticle("nl-test-draft", "DRAFT");

    await articleNewsletterService.sendArticleNewsletter(article.id);

    const delivery = await prisma.articleNewsletterDelivery.findUnique({
      where: { articleId: article.id },
    });
    expect(delivery).toBeNull();
  });

  it("should mark article as sent when no recipients match", async () => {
    await reset();

    await createSubscriber({
      email: "nl-test-optout@example.com",
      preferences: { [String(categoryId)]: false },
    });
    await createSubscriber({
      email: "nl-test-optout2@example.com",
      preferences: { [String(categoryId)]: false },
    });

    const article = await createArticle("nl-test-none");

    await articleNewsletterService.sendArticleNewsletter(article.id);

    const published = await prisma.article.findUnique({ where: { id: article.id } });
    expect(published?.newsletterSentAt).not.toBeNull();

    const delivery = await prisma.articleNewsletterDelivery.findUnique({
      where: { articleId: article.id },
    });
    expect(delivery).toBeNull();
  });
});

describe("Publish path triggers newsletter", () => {
  it("should create a delivery when an article is published via the API", async () => {
    await reset();

    await createSubscriber({ email: "nl-test-active@example.com" });

    const created = await request(app)
      .post("/api/v1/cms/articles")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        title: "Publish Trigger Article",
        slug: "nl-test-publish-trigger",
        summary: "Summary",
        content: "Content",
        categoryId,
        status: "DRAFT",
      });
    expect(created.status).toBe(201);
    const articleId = created.body.data.id;

    const patched = await request(app)
      .patch(`/api/v1/cms/articles/${articleId}`)
      .set("Authorization", `Bearer ${editorToken}`)
      .send({ status: "PUBLISHED" });
    expect(patched.status).toBe(200);

    const delivery = await waitForDelivery(articleId);
    expect(delivery).not.toBeNull();
    expect(delivery!.totalSent).toBe(1);
  });
});
