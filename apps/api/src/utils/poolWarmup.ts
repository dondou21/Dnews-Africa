import prisma from "./prisma";

export async function warmUpPool(connections = 8): Promise<void> {
  try {
    await prisma.$connect();
    await Promise.all(
      Array.from({ length: connections }, () => prisma.$queryRaw`SELECT 1`)
    );
  } catch (err) {
    console.error("[warmup] Failed to warm up database pool:", err);
  }
}
