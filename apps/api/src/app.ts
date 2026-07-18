import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler } from "./middlewares/errorHandler";
import { notFound } from "./middlewares/notFound";
import { globalLimiter } from "./middlewares/rateLimit";
import apiV1Router from "./routes/v1";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan(config.isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use("/uploads", express.static(config.uploadDir, {
  maxAge: config.isProduction ? "1d" : "0",
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg") || filePath.endsWith(".png") || filePath.endsWith(".webp")) {
      res.setHeader("Cache-Control", config.isProduction ? "public, max-age=86400" : "public, max-age=0, must-revalidate");
    }
  },
}));

app.use("/api/v1", globalLimiter, apiV1Router);

app.use(notFound);
app.use(errorHandler);

export default app;
