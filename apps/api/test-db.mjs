import dotenv from "dotenv";
dotenv.config({ path: ".env" });
const { PrismaClient } = await import("@prisma/client");
const p = new PrismaClient();
try {
  await p.$connect();
  console.log("CONNECTED");
  const r = await p.$queryRaw`SELECT 1 as ok`;
  console.log("QUERY OK:", r);
} catch (e) {
  console.error("FAILED:", e.message);
  if (e.code) console.error("CODE:", e.code);
  if (e.meta) console.error("META:", JSON.stringify(e.meta));
} finally {
  await p.$disconnect();
}
