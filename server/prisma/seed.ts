import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "Admin", description: "Full system access" },
    { name: "Editor", description: "Can publish and manage content" },
    { name: "Journalist", description: "Can create and edit own articles" },
    { name: "Moderator", description: "Can moderate comments and content" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  const categories = [
    { name: "Top Stories", slug: "top-stories", description: "Leading news stories and headlines" },
    { name: "Sports", slug: "sports", description: "African sports coverage including AFCON and athletics" },
    { name: "Business", slug: "business", description: "Business news, finance, and economic developments" },
    { name: "Innovation", slug: "innovation", description: "Technology and innovation across Africa" },
    { name: "Youth", slug: "youth", description: "Stories amplifying young African voices" },
    { name: "Culture", slug: "culture", description: "Arts, music, film, and cultural movements" },
    { name: "Travel", slug: "travel", description: "Travel destinations and experiences" },
    { name: "Lifestyle", slug: "lifestyle", description: "Fashion, food, wellness, and lifestyle trends" },
    { name: "Interviews", slug: "interviews", description: "Exclusive conversations with changemakers" },
    { name: "Opinion & Analysis", slug: "opinion-analysis", description: "Commentary and in-depth analysis" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
  }
}

main()
  .then(() => {
    console.log("Seed completed successfully");
  })
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
