import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tables = [
    "Role",
    "User",
    "Category",
    "Article",
    "Tag",
    "Media",
    "NewsletterSubscriber",
    "Comment",
  ] as const;

  for (const table of tables) {
    const count = await (prisma as any)[table].count();
    console.log(`${table}: ${count}`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
