import { describe, it, expect, afterAll, beforeAll } from "vitest";
import request from "supertest";
import app from "../app";
import { createTestUser, cleanupTestData } from "./helpers";

let articleId: string;
let adminToken: string;

beforeAll(async () => {
  const admin = await createTestUser("Admin");
  adminToken = admin.token;

  const article = await request(app)
    .post("/api/v1/cms/articles")
    .set("Authorization", `Bearer ${adminToken}`)
    .send({
      title: "Commentable Article",
      slug: "commentable-article",
      summary: "Article for comment testing",
      content: "Content for testing comments",
      categoryId: 1,
      status: "PUBLISHED",
    });
  articleId = article.body.data.id;
});

afterAll(async () => {
  await cleanupTestData();
});

describe("POST /api/v1/public/articles/:id/comments", () => {
  it("should submit a comment on a published article", async () => {
    const res = await request(app)
      .post(`/api/v1/public/articles/${articleId}/comments`)
      .send({
        name: "Jane Doe",
        email: "jane@example.com",
        content: "Great article!",
      });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.content).toBe("Great article!");
    expect(res.body.data.status).toBe("PENDING");
  });

  it("should reject comment on non-existent article", async () => {
    const res = await request(app)
      .post("/api/v1/public/articles/00000000-0000-0000-0000-000000000000/comments")
      .send({
        name: "Jane Doe",
        email: "jane@example.com",
        content: "Great article!",
      });
    expect(res.status).toBe(404);
  });

  it("should reject empty content", async () => {
    const res = await request(app)
      .post(`/api/v1/public/articles/${articleId}/comments`)
      .send({
        name: "Jane Doe",
        email: "jane@example.com",
        content: "",
      });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/public/articles/:id/comments", () => {
  it("should return only approved comments publicly", async () => {
    const res = await request(app).get(`/api/v1/public/articles/${articleId}/comments`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    for (const comment of res.body.data) {
      expect(comment.status).toBe("APPROVED");
    }
  });
});

describe("Moderation: GET /api/v1/public/comments/pending", () => {
  it("should reject without token", async () => {
    const res = await request(app).get("/api/v1/public/comments/pending");
    expect(res.status).toBe(401);
  });

  it("should return pending comments for admin", async () => {
    const res = await request(app)
      .get("/api/v1/public/comments/pending")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("Moderation: PATCH /api/v1/public/comments/:id", () => {
  let commentId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post(`/api/v1/public/articles/${articleId}/comments`)
      .send({
        name: "Moderator",
        email: "mod@example.com",
        content: "Approve me",
      });
    commentId = res.body.data.id;
  });

  it("should approve a comment", async () => {
    const res = await request(app)
      .patch(`/api/v1/public/comments/${commentId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "APPROVED" });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
  });
});

describe("Moderation: DELETE /api/v1/public/comments/:id", () => {
  let commentId: string;

  beforeAll(async () => {
    const res = await request(app)
      .post(`/api/v1/public/articles/${articleId}/comments`)
      .send({
        name: "Delete Me",
        email: "delete@example.com",
        content: "Delete this comment",
      });
    commentId = res.body.data.id;
  });

  it("should delete as admin", async () => {
    const res = await request(app)
      .delete(`/api/v1/public/comments/${commentId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  it("should reject delete without token", async () => {
    const res = await request(app).delete(`/api/v1/public/comments/${commentId}`);
    expect(res.status).toBe(401);
  });
});
