import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import fs from "fs";
import request from "supertest";
import app from "../app";
import prisma from "../utils/prisma";
import { config } from "../config";
import { createTestUser, cleanupTestData } from "./helpers";
import { articleNewsletterService } from "../services/articleNewsletterService";
import { emailService } from "../services/emailService";
import { publishDueArticles } from "../services/schedulerService";

let adminToken: string;
let editorToken: string;
let authorId: string;
let categoryId: number;

const CAPTURE_DIR = config.emailCaptureDir;

async function waitFor(condition: () => Promise<boolean>, timeoutMs = 4000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await condition()) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

async function waitForDelivery(articleId: string, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const delivery = await prisma.articleNewsletterDelivery.findUnique({
      where: { articleId },
    });
    if (delivery && delivery.status !== "PENDING" && delivery.status !== "SENDING") {
      return delivery;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return null;
}

async function reset() {
  await prisma.articleNewsletterRecipient.deleteMany({});
  await prisma.articleNewsletterDelivery.deleteMany({});
  await prisma.article.deleteMany({ where: { slug: { startsWith: "enl-test-" } } });
  await prisma.newsletterSubscriber.deleteMany({ where: { email: { startsWith: "enl-test-" } } });
}

function clearCaptureDir() {
  if (!fs.existsSync(CAPTURE_DIR)) return;
  for (const file of fs.readdirSync(CAPTURE_DIR)) {
    fs.unlinkSync(`${CAPTURE_DIR}/${file}`);
  }
}

beforeAll(async () => {
  const admin = await createTestUser("Admin");
  adminToken = admin.token;
  authorId = admin.user.id;
  const editor = await createTestUser("Editor");
  editorToken = editor.token;

  const category = await prisma.category.findUnique({ where: { slug: "top-stories" } });
  if (!category) throw new Error("Test category not found");
  categoryId = category.id;

  clearCaptureDir();
});

afterAll(async () => {
  clearCaptureDir();
  await cleanupTestData();
});

describe("Welcome email", () => {
  it("sends a welcome email to a new subscriber created via the public API", async () => {
    await reset();
    const email = "enl-test-welcome@example.com";

    const res = await request(app)
      .post("/api/v1/newsletter/subscribe")
      .send({ email, name: "New Reader" });
    expect(res.status).toBe(201);

    const sub = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    expect(sub).not.toBeNull();
    expect(sub!.status).toBe("ACTIVE");
    expect(sub!.verified).toBe(true);
    expect(sub!.unsubscribeToken).toBeTruthy();

    const sent = await waitFor(async () => {
      const s = await prisma.newsletterSubscriber.findUnique({ where: { email } });
      return s?.lastEmailSentAt !== null;
    });
    expect(sent).toBe(true);

    const captures = fs.existsSync(CAPTURE_DIR) ? fs.readdirSync(CAPTURE_DIR) : [];
    const hasWelcome = captures.some((f) => f.includes("enl-test-welcome@example.com"));
    expect(hasWelcome).toBe(true);
  });

  it("sends a welcome email to an admin-created subscriber", async () => {
    await reset();
    const email = "enl-test-admin@example.com";

    const res = await request(app)
      .post("/api/v1/cms/newsletter/subscribers")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email, name: "Admin Created" });
    expect(res.status).toBe(201);

    const sent = await waitFor(async () => {
      const s = await prisma.newsletterSubscriber.findUnique({ where: { email } });
      return s?.lastEmailSentAt !== null;
    });
    expect(sent).toBe(true);

    const captures = fs.existsSync(CAPTURE_DIR) ? fs.readdirSync(CAPTURE_DIR) : [];
    const hasWelcome = captures.some((f) => f.includes("enl-test-admin@example.com"));
    expect(hasWelcome).toBe(true);
  });

  it("rejects duplicate admin-created subscriber", async () => {
    await reset();
    const email = "enl-test-dup@example.com";
    await prisma.newsletterSubscriber.create({
      data: { email, status: "ACTIVE", verified: true, unsubscribeToken: "tok-1" },
    });

    const res = await request(app)
      .post("/api/v1/cms/newsletter/subscribers")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ email });
    expect(res.status).toBe(409);
  });
});

describe("Manual publish notification", () => {
  it("creates a delivery and sends to subscribers when an article is published", async () => {
    await reset();
    await prisma.newsletterSubscriber.create({
      data: { email: "enl-test-pub@example.com", status: "ACTIVE", verified: true, unsubscribeToken: "tok-pub" },
    });

    const created = await request(app)
      .post("/api/v1/cms/articles")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Publish Notification Article",
        slug: "enl-test-publish-notify",
        summary: "Summary",
        content: "Content",
        categoryId,
        status: "DRAFT",
      });
    expect(created.status).toBe(201);
    const articleId = created.body.data.id;

    const patched = await request(app)
      .patch(`/api/v1/cms/articles/${articleId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "PUBLISHED" });
    expect(patched.status).toBe(200);

    const delivery = await waitForDelivery(articleId);
    expect(delivery).not.toBeNull();
    expect(delivery!.totalSent).toBe(1);
    expect(delivery!.totalFailed).toBe(0);
  });
});

describe("Scheduled publish notification", () => {
  it("publishes a due article and triggers the same newsletter pipeline", async () => {
    await reset();
    await prisma.newsletterSubscriber.create({
      data: { email: "enl-test-sched@example.com", status: "ACTIVE", verified: true, unsubscribeToken: "tok-sched" },
    });

    const article = await prisma.article.create({
      data: {
        title: "Scheduled Article",
        slug: "enl-test-scheduled",
        summary: "Summary",
        content: "Content",
        status: "SCHEDULED",
        scheduledAt: new Date(Date.now() - 60_000),
        sendNewsletter: true,
        categoryId,
        authorId,
      },
    });

    await publishDueArticles();

    const updated = await prisma.article.findUnique({ where: { id: article.id } });
    expect(updated?.status).toBe("PUBLISHED");

    const delivery = await waitForDelivery(article.id);
    expect(delivery).not.toBeNull();
    expect(delivery!.totalSent).toBe(1);
    expect(delivery!.totalFailed).toBe(0);
  });
});

describe("Send Test Newsletter", () => {
  it("sends a test newsletter to all active verified subscribers with counts", async () => {
    await reset();
    for (const email of ["enl-test-1@example.com", "enl-test-2@example.com", "enl-test-3@example.com"]) {
      await prisma.newsletterSubscriber.create({
        data: { email, status: "ACTIVE", verified: true, unsubscribeToken: `tok-${email}` },
      });
    }
    await prisma.newsletterSubscriber.create({
      data: { email: "enl-test-unverified@example.com", status: "ACTIVE", verified: false, unsubscribeToken: "tok-unv" },
    });
    await prisma.newsletterSubscriber.create({
      data: { email: "enl-test-unsub@example.com", status: "UNSUBSCRIBED", verified: true, unsubscribeToken: "tok-unsub" },
    });

    const res = await request(app)
      .post("/api/v1/cms/newsletter/test-send")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");

    const data = res.body.data;
    expect(data.totalRecipients).toBe(3);
    expect(data.sent).toBe(3);
    expect(data.failed).toBe(0);
    expect(data.results).toHaveLength(3);
    expect(data.results.every((r: { status: string }) => r.status === "sent")).toBe(true);

    const captures = fs.existsSync(CAPTURE_DIR) ? fs.readdirSync(CAPTURE_DIR) : [];
    for (const email of ["enl-test-1@example.com", "enl-test-2@example.com", "enl-test-3@example.com"]) {
      expect(captures.some((f) => f.includes(email))).toBe(true);
    }
  });

  it("is restricted to administrators", async () => {
    const res = await request(app)
      .post("/api/v1/cms/newsletter/test-send")
      .set("Authorization", `Bearer ${editorToken}`);
    expect(res.status).toBe(403);
  });

  it("requires authentication", async () => {
    const res = await request(app).post("/api/v1/cms/newsletter/test-send");
    expect(res.status).toBe(401);
  });
});

describe("Delivery failure handling", () => {
  it("marks a failed recipient as FAILED and logs the error", async () => {
    await reset();
    const okEmail = "enl-test-ok@example.com";
    const failEmail = "enl-test-fail@example.com";
    const failSub = await prisma.newsletterSubscriber.create({
      data: { email: failEmail, status: "ACTIVE", verified: true, unsubscribeToken: "tok-fail" },
    });
    await prisma.newsletterSubscriber.create({
      data: { email: okEmail, status: "ACTIVE", verified: true, unsubscribeToken: "tok-ok" },
    });

    const article = await prisma.article.create({
      data: {
        title: "Failure Article",
        slug: "enl-test-failure",
        summary: "Summary",
        content: "Content",
        status: "PUBLISHED",
        publishedAt: new Date(),
        sendNewsletter: true,
        categoryId,
        authorId,
      },
    });

    const spy = vi
      .spyOn(emailService, "sendArticleEmail")
      .mockImplementation(async (email) => {
        if (email === failEmail) {
          throw new Error("Resend API error (rate_limit_exceeded, status 429): Too many requests");
        }
        return { transport: "capture" as const, capturePath: "capture" };
      });

    await articleNewsletterService.sendArticleNewsletter(article.id);
    spy.mockRestore();

    const delivery = await prisma.articleNewsletterDelivery.findUnique({
      where: { articleId: article.id },
      include: { recipients: true },
    });

    expect(delivery).not.toBeNull();
    expect(delivery!.status).toBe("PARTIAL");
    expect(delivery!.totalSent).toBe(1);
    expect(delivery!.totalFailed).toBe(1);

    const failedRecipient = delivery!.recipients.find((r) => r.subscriberId === failSub.id);
    expect(failedRecipient).toBeDefined();
    expect(failedRecipient!.status).toBe("FAILED");
    expect(failedRecipient!.errorMessage).toContain("rate_limit_exceeded");
    expect(failedRecipient!.errorMessage).toContain("429");
  });
});
