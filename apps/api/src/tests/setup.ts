import { beforeAll, afterAll } from "vitest";
import prisma from "../utils/prisma";

const dbUrl = process.env.DATABASE_URL || "";
if (!dbUrl.includes("_test")) {
  throw new Error(
    `DATABASE_URL must point to a test database (containing "_test"). Got: ${dbUrl}`
  );
}

const roles = [
  { name: "Admin", description: "Full system access" },
  { name: "Editor", description: "Can publish and manage content" },
  { name: "Journalist", description: "Can create and edit own articles" },
  { name: "Moderator", description: "Can moderate comments and content" },
];

const categories = [
  { name: "Top Stories", slug: "top-stories", description: "Leading news stories and headlines" },
  { name: "Sports", slug: "sports", description: "African sports coverage" },
  { name: "Business", slug: "business", description: "Business news and finance" },
];

beforeAll(async () => {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
  }

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
