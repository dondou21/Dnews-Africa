import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../app";
import { cleanupTestData } from "./helpers";

afterAll(async () => {
  await cleanupTestData();
});

describe("POST /api/auth/register", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "test-register@example.com",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.email).toBe("test-register@example.com");
    expect(res.body.data).not.toHaveProperty("passwordHash");
  });

  it("should reject duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "John",
      lastName: "Doe",
      email: "test-register@example.com",
      password: "password123",
    });
    expect(res.status).toBe(409);
  });

  it("should reject missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "John",
    });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("should login and return JWT", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test-register@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe("test-register@example.com");
  });

  it("should reject invalid password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test-register@example.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "test-register@example.com",
      password: "password123",
    });
    token = res.body.data.token;
  });

  it("should return current user with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.email).toBe("test-register@example.com");
  });

  it("should reject request without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});
