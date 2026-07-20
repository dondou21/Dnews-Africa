import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const result: any = await prisma.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'articles' ORDER BY ordinal_position`
  );
  console.log("=== articles columns ===");
  for (const row of result) {
    console.log(`${row.column_name} (${row.data_type})`);
  }

  const mediaCols: any = await prisma.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'media' ORDER BY ordinal_position`
  );
  console.log("\n=== media columns ===");
  for (const row of mediaCols) {
    console.log(`${row.column_name} (${row.data_type})`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
