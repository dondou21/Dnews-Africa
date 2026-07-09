import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { createTestUser, cleanupTestData } from "./helpers";

let editorToken: string;
let journalistToken: string;
let publishedArticleId: string;
let draftArticleId: string;

afterAll(async () => {
  await cleanupTestData();
});

describe("Article setup", () => {
  it("should create test users", async () => {
    const editor = await createTestUser("Editor");
    const journalist = await createTestUser("Journalist");
    editorToken = editor.token;
    journalistToken = journalist.token;
    expect(editorToken).toBeDefined();
    expect(journalistToken).toBeDefined();
  });
});

describe("POST /api/articles", () => {
  it("should reject creation without token", async () => {
    const res = await request(app).post("/api/articles").send({
      title: "Test Article",
      slug: "test-article",
      summary: "Summary",
      content: "Content",
      categoryId: 1,
    });
    expect(res.status).toBe(401);
  });

  it("should create article with valid role", async () => {
    const res = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        title: "Published Article",
        slug: "published-article",
        summary: "A published article",
        content: "Full content here",
        categoryId: 1,
        status: "PUBLISHED",
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.title).toBe("Published Article");
    publishedArticleId = res.body.data.id;
  });

  it("should create article in draft status", async () => {
    const res = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        title: "Draft Article",
        slug: "draft-article",
        summary: "A draft article",
        content: "Not published yet",
        categoryId: 1,
        status: "DRAFT",
      });
    expect(res.status).toBe(201);
    draftArticleId = res.body.data.id;
  });
});

describe("GET /api/articles", () => {
  it("should return only published articles", async () => {
    const res = await request(app).get("/api/articles");
    expect(res.status).toBe(200);
    expect(res.body.data.articles).toBeDefined();
    for (const article of res.body.data.articles) {
      expect(article.status).toBe("PUBLISHED");
    }
  });
});

describe("GET /api/articles/featured", () => {
  it("should return featured articles", async () => {
    const res = await request(app).get("/api/articles/featured");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("GET /api/articles/latest", () => {
  it("should return latest articles", async () => {
    const res = await request(app).get("/api/articles/latest");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("GET /api/articles/:slug", () => {
  it("should return article by slug", async () => {
    const res = await request(app).get("/api/articles/published-article");
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("published-article");
  });

  it("should return 404 for draft article slug", async () => {
    const res = await request(app).get("/api/articles/draft-article");
    expect(res.status).toBe(404);
  });
});
