import { PrismaClient } from "@prisma/client";
import { hash } from "@node-rs/bcrypt";

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

  const categories: { name: string; slug: string; description: string; children?: { name: string; slug: string; description: string }[] }[] = [
    {
      name: "Top Stories", slug: "top-stories", description: "Leading news stories and headlines",
    },
    {
      name: "Sports", slug: "sports", description: "African sports coverage including AFCON and athletics",
      children: [
        { name: "Football", slug: "football", description: "Football (soccer) coverage across Africa" },
        { name: "Basketball", slug: "basketball", description: "Basketball news, NBA Africa, and local leagues" },
        { name: "Athletics", slug: "athletics", description: "Track and field, marathons, and olympic sports" },
        { name: "Tennis", slug: "tennis", description: "Tennis tournaments and African players" },
        { name: "Rugby", slug: "rugby", description: "Rugby union and sevens coverage" },
      ],
    },
    {
      name: "Business", slug: "business", description: "Business news, finance, and economic developments",
      children: [
        { name: "Markets", slug: "markets", description: "Stock markets, commodities, and trading" },
        { name: "Startups", slug: "startups", description: "African startup ecosystem and venture capital" },
        { name: "Banking & Finance", slug: "banking-finance", description: "Banking, fintech, and financial services" },
        { name: "Energy", slug: "energy", description: "Oil, gas, renewables, and energy policy" },
        { name: "Agriculture", slug: "agriculture", description: "Farming, agribusiness, and food security" },
      ],
    },
    {
      name: "Innovation", slug: "innovation", description: "Technology and innovation across Africa",
      children: [
        { name: "Tech", slug: "tech", description: "Technology news and product launches" },
        { name: "AI & Data", slug: "ai-data", description: "Artificial intelligence, machine learning, and data science" },
        { name: "Space", slug: "space", description: "Space exploration and satellite technology" },
        { name: "Green Tech", slug: "green-tech", description: "Clean technology and sustainable innovation" },
      ],
    },
    {
      name: "Youth", slug: "youth", description: "Stories amplifying young African voices",
      children: [
        { name: "Education", slug: "education", description: "Education policy, schools, and learning" },
        { name: "Careers", slug: "careers", description: "Career development, jobs, and entrepreneurship" },
        { name: "Social Impact", slug: "social-impact", description: "Youth-led social change and activism" },
      ],
    },
    {
      name: "Culture", slug: "culture", description: "Arts, music, film, and cultural movements",
      children: [
        { name: "Music", slug: "music", description: "African music, artists, and the music industry" },
        { name: "Film & TV", slug: "film-tv", description: "Nollywood, streaming, and television" },
        { name: "Arts", slug: "arts", description: "Visual arts, theatre, and creative expression" },
        { name: "Books & Lit", slug: "books-lit", description: "Literature, publishing, and literary events" },
      ],
    },
    {
      name: "Travel", slug: "travel", description: "Travel destinations and experiences",
      children: [
        { name: "Destinations", slug: "destinations", description: "Travel destinations and guides" },
        { name: "Aviation", slug: "aviation", description: "Air travel, airlines, and aviation industry" },
      ],
    },
    {
      name: "Lifestyle", slug: "lifestyle", description: "Fashion, food, wellness, and lifestyle trends",
      children: [
        { name: "Fashion", slug: "fashion", description: "African fashion, designers, and style" },
        { name: "Food", slug: "food", description: "African cuisine, food culture, and dining" },
        { name: "Health & Wellness", slug: "health-wellness", description: "Health, fitness, and mental wellness" },
      ],
    },
    { name: "Interviews", slug: "interviews", description: "Exclusive conversations with changemakers" },
    { name: "Opinion & Analysis", slug: "opinion-analysis", description: "Commentary and in-depth analysis" },
  ];

  const createdCategories: Record<string, number> = {};

  for (const category of categories) {
    const { children, ...parentData } = category;
    const result = await prisma.category.upsert({
      where: { slug: parentData.slug },
      update: { name: parentData.name, description: parentData.description },
      create: parentData,
    });
    createdCategories[parentData.slug] = result.id;

    if (children) {
      for (const child of children) {
        const childResult = await prisma.category.upsert({
          where: { slug: child.slug },
          update: { name: child.name, description: child.description, parentId: result.id },
          create: { ...child, parentId: result.id },
        });
        createdCategories[child.slug] = childResult.id;
      }
    }
  }

  const seedUserPasswords: Record<string, string> = {
    Admin: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
    Editor: process.env.SEED_EDITOR_PASSWORD || "Editor@12345",
    Journalist: process.env.SEED_JOURNALIST_PASSWORD || "Journalist@12345",
    Moderator: process.env.SEED_MODERATOR_PASSWORD || "Moderator@12345",
  };

  const testUsers = [
    { firstName: "Admin", lastName: "User", email: "admin@dnewsafrica.com", password: seedUserPasswords.Admin, role: "Admin" },
    { firstName: "Editor", lastName: "User", email: "editor@dnewsafrica.com", password: seedUserPasswords.Editor, role: "Editor" },
    { firstName: "Journalist", lastName: "User", email: "journalist@dnewsafrica.com", password: seedUserPasswords.Journalist, role: "Journalist" },
    { firstName: "Moderator", lastName: "User", email: "moderator@dnewsafrica.com", password: seedUserPasswords.Moderator, role: "Moderator" },
  ];

  const createdUserIds: Record<string, string> = {};

  for (const u of testUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const passwordHash = await hash(u.password, 12);
      const user = await prisma.user.create({
        data: {
          email: u.email,
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
          roleId: createdRoles[u.role],
          isActive: true,
        },
      });
      createdUserIds[u.role] = user.id;
    } else {
      createdUserIds[u.role] = existing.id;
    }
  }

  const sponsors = [
    { name: "EcoBank Africa", logoUrl: "https://placehold.co/140x44/e8eaf0/1e3a5f?text=Ecobank", websiteUrl: "https://www.ecobank.com", altText: "Ecobank Africa", displayOrder: 1 },
    { name: "MTN Group", logoUrl: "https://placehold.co/140x44/e8eaf0/1e3a5f?text=MTN", websiteUrl: "https://www.mtn.com", altText: "MTN Group", displayOrder: 2 },
    { name: "Afreximbank", logoUrl: "https://placehold.co/140x44/e8eaf0/1e3a5f?text=Afreximbank", websiteUrl: "https://www.afreximbank.com", altText: "Afreximbank", displayOrder: 3 },
    { name: "Dangote Group", logoUrl: "https://placehold.co/140x44/e8eaf0/1e3a5f?text=Dangote", websiteUrl: "https://www.dangote.com", altText: "Dangote Group", displayOrder: 4 },
    { name: "Safaricom", logoUrl: "https://placehold.co/140x44/e8eaf0/1e3a5f?text=Safaricom", websiteUrl: "https://www.safaricom.co.ke", altText: "Safaricom", displayOrder: 5 },
  ];

  for (const sponsor of sponsors) {
    await prisma.sponsor.upsert({
      where: { id: `seed-${sponsor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` },
      update: {
        name: sponsor.name,
        logoUrl: sponsor.logoUrl,
        websiteUrl: sponsor.websiteUrl,
        altText: sponsor.altText,
        displayOrder: sponsor.displayOrder,
        isActive: true,
      },
      create: {
        id: `seed-${sponsor.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: sponsor.name,
        logoUrl: sponsor.logoUrl,
        websiteUrl: sponsor.websiteUrl,
        altText: sponsor.altText,
        displayOrder: sponsor.displayOrder,
        isActive: true,
      },
    });
  }

  const articleCount = await prisma.article.count();

  console.log(`Seeded ${articleCount} articles`);
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
