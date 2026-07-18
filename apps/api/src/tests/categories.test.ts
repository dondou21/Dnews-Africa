import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("GET /api/v1/public/categories", () => {
  it("should return list of categories", async () => {
    const res = await request(app).get("/api/v1/public/categories");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it("should include sport category", async () => {
    const res = await request(app).get("/api/v1/public/categories");
    const sports = res.body.data.find((c: any) => c.slug === "sports");
    expect(sports).toBeDefined();
    expect(sports.name).toBe("Sports");
  });
});

describe("GET /api/v1/public/categories/:slug", () => {
  it("should return category by slug", async () => {
    const res = await request(app).get("/api/v1/public/categories/sports");
    expect(res.status).toBe(200);
    expect(res.body.data.slug).toBe("sports");
  });

  it("should return 404 for unknown slug", async () => {
    const res = await request(app).get("/api/v1/public/categories/nonexistent");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/public/categories/:slug/articles", () => {
  it("should return articles for a category", async () => {
    const res = await request(app).get("/api/v1/public/categories/sports/articles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
