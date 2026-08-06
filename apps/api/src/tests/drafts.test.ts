import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import prisma from "../utils/prisma";
import { cleanupTestData, createTestUser } from "./helpers";

describe("CMS draft auto-save endpoints", () => {
  let token: string;

  beforeAll(async () => {
    const { token: t } = await createTestUser("Journalist");
    token = t;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  it("should reject unauthenticated access", async () => {
    const res = await request(app).get("/api/v1/cms/drafts/new-article");
    expect(res.status).toBe(401);
  });

  it("should return null when no draft exists", async () => {
    const res = await request(app)
      .get("/api/v1/cms/drafts/missing-key")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toBeNull();
  });

  it("should upsert a draft and read it back", async () => {
    const put = await request(app)
      .put("/api/v1/cms/drafts/new-article")
      .set("Authorization", `Bearer ${token}`)
      .send({
        data: { title: "My draft title", summary: "partial", content: "{}" },
        articleId: null,
      });
    expect(put.status).toBe(200);
    expect(put.body.status).toBe("success");
    expect(put.body.data.data.title).toBe("My draft title");

    const get = await request(app)
      .get("/api/v1/cms/drafts/new-article")
      .set("Authorization", `Bearer ${token}`);
    expect(get.status).toBe(200);
    expect(get.body.data.data.title).toBe("My draft title");
    expect(get.body.data.data.summary).toBe("partial");
  });

  it("should update the same draft (idempotent upsert)", async () => {
    const put = await request(app)
      .put("/api/v1/cms/drafts/new-article")
      .set("Authorization", `Bearer ${token}`)
      .send({ data: { title: "Updated title", content: "{}" } });
    expect(put.status).toBe(200);

    const get = await request(app)
      .get("/api/v1/cms/drafts/new-article")
      .set("Authorization", `Bearer ${token}`);
    expect(get.body.data.data.title).toBe("Updated title");
  });

  it("should delete the draft", async () => {
    const del = await request(app)
      .delete("/api/v1/cms/drafts/new-article")
      .set("Authorization", `Bearer ${token}`);
    expect(del.status).toBe(200);

    const get = await request(app)
      .get("/api/v1/cms/drafts/new-article")
      .set("Authorization", `Bearer ${token}`);
    expect(get.body.data).toBeNull();
  });

  it("should keep drafts scoped per user", async () => {
    const { token: otherToken } = await createTestUser("Journalist");

    await request(app)
      .put("/api/v1/cms/drafts/editorial")
      .set("Authorization", `Bearer ${token}`)
      .send({ data: { title: "User A draft" } });

    const other = await request(app)
      .get("/api/v1/cms/drafts/editorial")
      .set("Authorization", `Bearer ${otherToken}`);
    expect(other.body.data).toBeNull();
  });

  it("should reject invalid formKey", async () => {
    const res = await request(app)
      .put("/api/v1/cms/drafts/%00%00%00%00")
      .set("Authorization", `Bearer ${token}`)
      .send({ data: {} });
    expect(res.status).toBe(400);
  });
});

describe("Draft cleanup cascade", () => {
  it("should remove drafts when the owning user is deleted", async () => {
    const { user, token } = await createTestUser("Journalist");

    await request(app)
      .put("/api/v1/cms/drafts/cascade-test")
      .set("Authorization", `Bearer ${token}`)
      .send({ data: { title: "temp" } });

    await prisma.user.delete({ where: { id: user.id } });

    const count = await prisma.draft.count({
      where: { userId: user.id, formKey: "cascade-test" },
    });
    expect(count).toBe(0);
  });
});
