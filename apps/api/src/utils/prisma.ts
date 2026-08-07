import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const envPath = path.resolve(__dirname, "../../.env");
const envLocalPath = path.resolve(__dirname, "../../.env.local");

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

const isProduction = process.env.NODE_ENV === "production";

const prisma = new PrismaClient({
  log: isProduction ? ["warn", "error"] : ["query", "warn", "error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

export default prisma;
