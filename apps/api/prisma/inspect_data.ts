import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const arts = await prisma.article.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      isFeatured: true,
      isTrending: true,
      categoryId: true,
      authorId: true,
      publishedAt: true,
    },
  });
  console.log(JSON.stringify(arts, null, 2));

  const cats = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true, isActive: true },
    orderBy: { id: "asc" },
  });
  console.log("CATEGORIES:", JSON.stringify(cats, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
