import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");
const envLocalPath = path.resolve(__dirname, "../../.env.local");

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

const configuredCorsOrigin = (process.env.CORS_ORIGIN || "http://localhost:5000,http://localhost:5001")
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
  if (process.env.NODE_ENV === "production") {
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

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin,
  jwtSecret: process.env.JWT_SECRET || "default-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  isProduction: process.env.NODE_ENV === "production",
  enableApiDocs: process.env.ENABLE_API_DOCS !== "false",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5000",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@dnewsafrica.com",
  emailEnabled: process.env.EMAIL_ENABLED !== "false",
  emailProvider: process.env.EMAIL_PROVIDER || "resend",
  emailTransport: process.env.RESEND_API_KEY && process.env.EMAIL_ENABLED !== "false" ? "resend" : "capture",
  emailCaptureDir: process.env.EMAIL_CAPTURE_DIR || path.resolve(__dirname, "../../.email-captures"),
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`,
  mediaBaseUrl: process.env.MEDIA_BASE_URL || `http://localhost:${process.env.PORT || 4000}/uploads`,
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads"),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
};
