import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const envPath = path.resolve(__dirname, "../../.env");
const envLocalPath = path.resolve(__dirname, "../../.env.local");

dotenv.config({ path: envLocalPath });
dotenv.config({ path: envPath });

const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
  ],
});

prisma.$on("query", (e) => {
  console.log(
    `[prisma:query] ${e.duration}ms ${e.query.slice(0, 180)}`
  );
});
prisma.$on("error", (e) => {
  console.error(`[prisma:error] ${e.message}`);
});

export default prisma;
