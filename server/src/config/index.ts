import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const config = {
  port: parseInt(process.env.PORT || "4000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  jwtSecret: process.env.JWT_SECRET || "default-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  isProduction: process.env.NODE_ENV === "production",
  enableApiDocs: process.env.ENABLE_API_DOCS !== "false",
};
