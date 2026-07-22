import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((s) => s.trim()),
  jwtSecret: process.env.JWT_SECRET || "default-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  isProduction: process.env.NODE_ENV === "production",
  enableApiDocs: process.env.ENABLE_API_DOCS !== "false",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "noreply@dnewsafrica.com",
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT || 4000}`,
  mediaBaseUrl: process.env.MEDIA_BASE_URL || `http://localhost:${process.env.PORT || 4000}/uploads`,
  uploadDir: process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads"),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
};
