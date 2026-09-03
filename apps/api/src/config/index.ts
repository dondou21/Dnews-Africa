import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import { z } from "zod";

const envPath = path.resolve(__dirname, "../../.env");
const envLocalPath = path.resolve(__dirname, "../../.env.local");

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = process.env.JWT_SECRET || (nodeEnv === "development" || nodeEnv === "test"
  ? crypto.randomBytes(32).toString("hex")
  : "");

export function normalizeDatabaseUrl(value: string | undefined, name = "DATABASE_URL"): string | undefined {
  if (!value) return undefined;
  const url = value.trim().replace(/^postgres:\/\//i, "postgresql://");
  if (!url.toLowerCase().startsWith("postgresql://")) {
    throw new Error(`${name} must use the postgresql:// scheme (check the Railway variable; do not include a psql command).`);
  }
  return url;
}

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
  CORS_ORIGIN: z.string().default("http://localhost:5000,http://localhost:5001"),
  DATABASE_URL: z.string().min(1).optional(),
}).superRefine((env, ctx) => {
  if (env.NODE_ENV === "production" && (!env.JWT_SECRET || env.JWT_SECRET.length < 32)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["JWT_SECRET"], message: "JWT_SECRET must be at least 32 characters in production" });
  }
  if (env.NODE_ENV === "production" && !env.DATABASE_URL) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["DATABASE_URL"], message: "DATABASE_URL is required in production" });
  }
});

const env = envSchema.parse({ ...process.env, DATABASE_URL: databaseUrl, JWT_SECRET: process.env.JWT_SECRET || jwtSecret });

const configuredCorsOrigin = env.CORS_ORIGIN
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function corsOrigin(
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void
): void {
  if (!origin || configuredCorsOrigin.includes(origin)) {
    callback(null, true);
    return;
  }
  if (env.NODE_ENV === "production") {
    callback(null, false);
    return;
  }
  try {
    const url = new URL(origin);
    const allowed = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    callback(null, allowed);
  } catch {
    callback(null, false);
  }
}

// API package root regardless of process CWD (dev via tsx, compiled dist, Docker).
const apiRootDir = path.resolve(__dirname, "../../");

function resolveUploadDir(value: string | undefined): string {
  if (!value) return path.join(apiRootDir, "uploads");
  return path.isAbsolute(value) ? value : path.resolve(apiRootDir, value);
}

export const config = {
  port: env.PORT,
  nodeEnv,
  corsOrigin,
  jwtSecret: env.JWT_SECRET || jwtSecret,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  databaseUrl: env.DATABASE_URL,
  isProduction: env.NODE_ENV === "production",
  clientUrl: process.env.CLIENT_URL || process.env.SITE_URL || "http://localhost:5000",
  siteUrl: process.env.SITE_URL || process.env.CLIENT_URL || "https://dnewsafrica.com",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@dnewsafrica.com",
  emailEnabled: process.env.EMAIL_ENABLED !== "false",
  emailProvider: process.env.EMAIL_PROVIDER || "resend",
  emailTransport: process.env.RESEND_API_KEY && process.env.EMAIL_ENABLED !== "false" ? "resend" : "capture",
  emailCaptureDir: process.env.EMAIL_CAPTURE_DIR || path.resolve(__dirname, "../../.email-captures"),
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`,
  mediaBaseUrl: process.env.MEDIA_BASE_URL || `http://localhost:${process.env.PORT || 4000}/uploads`,
  uploadDir: resolveUploadDir(process.env.UPLOAD_DIR),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
};
