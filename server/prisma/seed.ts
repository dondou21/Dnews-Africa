import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "Admin", description: "Full system access" },
    { name: "Editor", description: "Can publish and manage content" },
    { name: "Journalist", description: "Can create and edit own articles" },
    { name: "Moderator", description: "Can moderate comments and content" },
  ];

  const createdRoles: Record<string, number> = {};

  for (const role of roles) {
    const result = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    createdRoles[role.name] = result.id;
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

  const testUsers = [
    { firstName: "Admin", lastName: "User", email: "admin@dnewsafrica.com", password: "Admin@12345", role: "Admin" },
    { firstName: "Editor", lastName: "User", email: "editor@dnewsafrica.com", password: "Editor@12345", role: "Editor" },
    { firstName: "Journalist", lastName: "User", email: "journalist@dnewsafrica.com", password: "Journalist@12345", role: "Journalist" },
    { firstName: "Moderator", lastName: "User", email: "moderator@dnewsafrica.com", password: "Moderator@12345", role: "Moderator" },
  ];

  for (const u of testUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 12);
      await prisma.user.create({
        data: {
          email: u.email,
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
          roleId: createdRoles[u.role],
          isActive: true,
        },
      });
    }
  }

  console.log("\n=== Dnews Africa Development Credentials ===\n");
  console.log("  Admin      | admin@dnewsafrica.com    | Admin@12345");
  console.log("  Editor     | editor@dnewsafrica.com   | Editor@12345");
  console.log("  Journalist | journalist@dnewsafrica.com| Journalist@12345");
  console.log("  Moderator  | moderator@dnewsafrica.com | Moderator@12345");
  console.log("\n==========================================\n");
  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
