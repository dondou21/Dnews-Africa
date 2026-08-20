import { describe, it, expect, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import prisma from "../utils/prisma";
import { config } from "../config";
import { createTestUser, cleanupTestData } from "./helpers";
import { getMediaPublicUrl } from "../services/mediaService";

let adminToken: string;
let adminId: string;

afterAll(async () => {
  await cleanupTestData();
});

describe("Media setup", () => {
  it("should create test users", async () => {
    const admin = await createTestUser("Admin");
    adminToken = admin.token;
    adminId = admin.user.id;
    expect(adminToken).toBeDefined();
  });
});

describe("getMediaPublicUrl", () => {
  it("returns absolute API upload URL for a relative filename", () => {
    const url = getMediaPublicUrl("/uploads/pic.jpg");
    expect(url).toBe(`${config.apiUrl}/uploads/pic.jpg`);
    expect(url).not.toContain("res.cloudinary.com");
  });

  it("handles a bare filename and an uploads-prefixed path", () => {
    expect(getMediaPublicUrl("pic.jpg")).toBe(`${config.apiUrl}/uploads/pic.jpg`);
    expect(getMediaPublicUrl("uploads/pic.jpg")).toBe(`${config.apiUrl}/uploads/pic.jpg`);
  });

  it("returns http(s) URLs unchanged", () => {
    const url = "https://res.cloudinary.com/dnews-africa/image/upload/v1/articles/cloud.jpg";
    expect(getMediaPublicUrl(url)).toBe(url);
  });
});

describe("GET /api/v1/cms/media", () => {
  it("rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/v1/cms/media");
    expect(res.status).toBe(401);
  });

  it("returns media with normalized absolute URLs", async () => {
    await prisma.media.createMany({
      data: [
        {
          url: "/uploads/local-thumb.jpg",
          type: "IMAGE",
          storageProvider: "local",
          uploadedById: adminId,
        },
        {
          url: "https://res.cloudinary.com/dnews-africa/image/upload/v1/articles/cloud.jpg",
          type: "IMAGE",
          storageProvider: "cloudinary",
          publicId: "articles/cloud",
          uploadedById: adminId,
        },
      ],
    });

    const res = await request(app)
      .get("/api/v1/cms/media")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toBeDefined();

    const local = res.body.data.find((m: { url: string }) => m.url.includes("local-thumb"));
    expect(local).toBeDefined();
    expect(local.url).toBe(`${config.apiUrl}/uploads/local-thumb.jpg`);
    expect(local.storageProvider).toBe("local");

    const cloud = res.body.data.find((m: { url: string }) => m.url.includes("res.cloudinary.com"));
    expect(cloud).toBeDefined();
    expect(cloud.url).toBe("https://res.cloudinary.com/dnews-africa/image/upload/v1/articles/cloud.jpg");
  });
});

describe("GET /api/v1/cms/media/:id", () => {
  it("returns a single media item with a normalized URL", async () => {
    const media = await prisma.media.create({
      data: {
        url: "/uploads/single.jpg",
        type: "IMAGE",
        storageProvider: "local",
        uploadedById: adminId,
      },
    });

    const res = await request(app)
      .get(`/api/v1/cms/media/${media.id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.url).toBe(`${config.apiUrl}/uploads/single.jpg`);
  });

  it("returns 404 for a missing media id", async () => {
    const res = await request(app)
      .get("/api/v1/cms/media/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });
});
