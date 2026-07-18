import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app";

describe("GET /api/v1/public/health", () => {
  it("should return ok status", async () => {
    const res = await request(app).get("/api/v1/public/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});
