import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import prisma from "../utils/prisma";
import { articleService } from "../services/articleService";
import { seoService } from "../services/seoService";
import type { AuthenticatedUser } from "../types/express";

const PDF_PATH = path.resolve(process.cwd(), "..", "Dnews_Articles_Compilation.md.pdf");
const DEFAULT_AUTHOR_EMAIL = "dnews-reporter@dnewsafrica.com";
const DEFAULT_AUTHOR_FIRST = "Dnews";
const DEFAULT_AUTHOR_LAST = "Reporter";

interface ParsedArticle {
  index: number;
  title: string;
  authorName: string;
  content: string;
}

interface CategoryMatch {
  categoryId: number;
  categoryName: string;
  subcategoryName?: string;
  subcategoryId?: number;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function extractExcerpt(content: string): string {
  const paragraphs = content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    const cleaned = p.replace(/^["""]|["""]$/g, "").trim();
    if (cleaned.length > 40) {
      return cleaned.length > 300 ? cleaned.substring(0, 297) + "..." : cleaned;
    }
  }
  return content.substring(0, 300);
}

function generateTags(title: string, content: string, categoryName: string): string[] {
  const keywords: string[] = [];
  const lower = (title + " " + content).toLowerCase();

  const tagMap: Record<string, string[]> = {
    "sports": ["sports", "africa-sports"],
    "football": ["football", "soccer", "world-cup", "fifa"],
    "rally": ["motorsport", "rally", "racing"],
    "nuclear": ["nuclear-energy", "energy", "nuclear-power"],
    "energy": ["energy", "renewable-energy", "power"],
    "digital": ["digital", "technology", "fintech", "payments"],
    "health": ["health", "healthcare", "medical"],
    "ai": ["artificial-intelligence", "ai", "technology"],
    "economy": ["economy", "economic-growth", "economics"],
    "diaspora": ["diaspora", "african-diaspora", "investment"],
    "france": ["france", "diplomacy", "international-relations"],
    "rwanda": ["rwanda", "east-africa"],
    "ghana": ["ghana", "west-africa"],
    "kenya": ["kenya", "east-africa"],
    "nigeria": ["nigeria", "west-africa"],
    "gabon": ["gabon", "central-africa"],
    "senegal": ["senegal", "west-africa"],
    "fifa": ["fifa", "football", "world-cup"],
    "rugby": ["rugby"],
    "innovation": ["innovation", "technology"],
    "culture": ["culture", "arts"],
  };

  for (const [keyword, tags] of Object.entries(tagMap)) {
    if (lower.includes(keyword)) {
      for (const tag of tags) {
        if (!keywords.includes(tag)) keywords.push(tag);
      }
    }
  }

  if (keywords.length === 0) {
    keywords.push(categoryName.toLowerCase().replace(/\s+/g, "-"));
  }

  return keywords.slice(0, 6);
}

function classifyArticle(title: string, content: string): CategoryMatch {
  const lower = (title + " " + content.substring(0, 500)).toLowerCase();

  const rules: { test: RegExp; category: string; subcategory?: string }[] = [
    { test: /mountain gorilla rally|rally|motorsport/i, category: "Sports", subcategory: "Motor Sports" },
    { test: /world cup|fifa|football|senegal.*pape thiaw/i, category: "Sports", subcategory: "Football" },
    { test: /64-team|world cup expansion/i, category: "Sports", subcategory: "Football" },
    { test: /nuclear.*rwanda|rwanda.*nuclear|small modular reactor/i, category: "Innovation", subcategory: "Energy" },
    { test: /nuclear.*ghana|nuclear.*kenya|nuclear.*nigeria/i, category: "Innovation", subcategory: "Energy" },
    { test: /digital payments|parafiscal|gabon/i, category: "Innovation", subcategory: "Technology" },
    { test: /ai.*thinking|chatgpt|critical thinking/i, category: "Innovation", subcategory: "Technology" },
    { test: /diaspora.*economic|african diaspora.*driver/i, category: "Business", subcategory: "Economy" },
    { test: /health.*france|adais|health professional/i, category: "Lifestyle", subcategory: "Health" },
    { test: /french cultural centre|kigali.*france|rwanda.*france ties/i, category: "Culture", subcategory: "Arts" },
    { test: /shadows of football|keeps.*players.*feet/i, category: "Sports", subcategory: "Football" },
    { test: /africa.*world cup.*hope/i, category: "Sports", subcategory: "Football" },
  ];

  for (const rule of rules) {
    if (rule.test.test(lower)) {
      return { categoryId: 0, categoryName: rule.category, subcategoryName: rule.subcategory };
    }
  }

  return { categoryId: 0, categoryName: "Top Stories" };
}

async function findOrCreateCategory(categoryName: string, subcategoryName?: string): Promise<{ categoryId: number; subcategoryId?: number }> {
  const parent = subcategoryName
    ? await prisma.category.findFirst({ where: { name: categoryName, parentId: null } })
    : await prisma.category.findFirst({ where: { name: categoryName } });

  if (!parent) {
    console.warn(`  [WARN] Category "${categoryName}" not found. Creating it.`);
    const created = await prisma.category.create({
      data: { name: categoryName, slug: generateSlug(categoryName) },
    });
    if (subcategoryName) {
      const sub = await prisma.category.findFirst({ where: { name: subcategoryName, parentId: created.id } });
      if (!sub) {
        const createdSub = await prisma.category.create({
          data: { name: subcategoryName, slug: generateSlug(subcategoryName), parentId: created.id },
        });
        return { categoryId: createdSub.id };
      }
      return { categoryId: sub.id };
    }
    return { categoryId: created.id };
  }

  if (subcategoryName) {
    const sub = await prisma.category.findFirst({ where: { name: subcategoryName, parentId: parent.id } });
    if (!sub) {
      console.warn(`  [WARN] Subcategory "${subcategoryName}" under "${categoryName}" not found. Using parent.`);
      return { categoryId: parent.id, subcategoryId: undefined };
    }
    return { categoryId: sub.id, subcategoryId: sub.id };
  }

  return { categoryId: parent.id };
}

async function findOrCreateAuthor(email: string, firstName: string, lastName: string): Promise<string> {
  let user = await prisma.user.findUnique({ where: { email } });
  if (user) return user.id;

  const journalistRole = await prisma.role.findUnique({ where: { name: "Journalist" } });
  if (!journalistRole) throw new Error("Journalist role not found in database");

  user = await prisma.user.create({
    data: {
      email,
      firstName,
      lastName,
      passwordHash: "imported-user-no-login",
      isActive: true,
      roleId: journalistRole.id,
    },
  });

  console.log(`  [INFO] Created author: ${firstName} ${lastName} (${email})`);
  return user.id;
}

function parseArticles(text: string): ParsedArticle[] {
  const lines = text.split("\n");
  const articles: ParsedArticle[] = [];
  let current: ParsedArticle | null = null;
  let contentLines: string[] = [];
  let inArticle = false;

  const articleStarts = [
    /^\d+\.\s+/, /^##\s+\d+\./, /^\d+\)\s+/
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    const isPageMarker = /^--\s*\d+\s+of\s+\d+\s*--$/.test(line);
    if (isPageMarker) continue;

    const isTOC = /^Table of Contents/i.test(line);
    if (isTOC) {
      inArticle = false;
      if (current) {
        current.content = contentLines.join("\n\n").trim();
        if (current.content) articles.push(current);
        current = null;
        contentLines = [];
      }
      continue;
    }

    const isTOCEntry = /^\d+\.\s+[A-Z]/.test(line) && !inArticle;
    if (isTOCEntry) continue;

    const articleMatch = line.match(/^(?:##\s*)?(\d+)\.\s+(.+)/);
    if (articleMatch) {
      if (current) {
        current.content = contentLines.join("\n\n").trim();
        if (current.content && current.content.length > 50) articles.push(current);
      }
      current = {
        index: parseInt(articleMatch[1], 10),
        title: articleMatch[2].trim(),
        authorName: "",
        content: "",
      };
      contentLines = [];
      inArticle = true;

      const byMatch = lines[i + 1]?.trim().match(/^By\s+(.+)/i);
      if (byMatch) {
        current.authorName = byMatch[1].trim();
        i++;
      } else {
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && /^By\s+/i.test(nextLine)) {
          current.authorName = nextLine.replace(/^By\s+/i, "").trim();
          i++;
        }
      }
      continue;
    }

    if (inArticle && current) {
      if (line.length > 0 || contentLines.length > 0) {
        contentLines.push(line);
      }
    }
  }

  if (current) {
    current.content = contentLines.join("\n\n").trim();
    if (current.content && current.content.length > 50) articles.push(current);
  }

  return articles;
}

async function main() {
  console.log("=".repeat(60));
  console.log("Dnews Africa — PDF Article Import Script");
  console.log("=".repeat(60));

  if (!fs.existsSync(PDF_PATH)) {
    console.error(`PDF not found at: ${PDF_PATH}`);
    process.exit(1);
  }

  console.log("\n[1/4] Reading PDF...");
  const buffer = fs.readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buffer });
  const pdfResult = await parser.getText();
  await parser.destroy();
  console.log(`  Extracted ${pdfResult.text.length} chars across ${pdfResult.total} pages`);

  console.log("\n[2/4] Parsing articles...");
  const parsedArticles = parseArticles(pdfResult.text);
  console.log(`  Found ${parsedArticles.length} articles`);

  parsedArticles.forEach((a, i) => {
    console.log(`    ${i + 1}. "${a.title}" by ${a.authorName || "(unknown)"} (${a.content.length} chars)`);
  });

  if (parsedArticles.length === 0) {
    console.error("No articles could be parsed from the PDF. Aborting.");
    process.exit(1);
  }

  console.log("\n[3/4] Importing articles...");

  const authorId = await findOrCreateAuthor(DEFAULT_AUTHOR_EMAIL, DEFAULT_AUTHOR_FIRST, DEFAULT_AUTHOR_LAST);

  const user: AuthenticatedUser = await prisma.user.findUnique({
    where: { id: authorId },
    include: { role: true },
  }) as unknown as AuthenticatedUser;

  if (!user) {
    console.error("Failed to resolve author user");
    process.exit(1);
  }

  console.log(`  Using author: ${user.firstName} ${user.lastName} (${user.role.name})`);

  const results = { imported: 0, skipped: 0, errors: 0, details: [] as string[] };

  for (const article of parsedArticles) {
    const slug = generateSlug(article.title);
    console.log(`\n  --- Article ${article.index}: "${article.title}" ---`);

    const existing = await prisma.article.findFirst({
      where: { OR: [{ title: article.title }, { slug }] },
    });

    if (existing) {
      console.log(`  [SKIP] Duplicate found (status: ${existing.status}). Skipping.`);
      results.skipped++;
      results.details.push(`SKIPPED: "${article.title}" — already exists (${existing.status})`);
      continue;
    }

    const classification = classifyArticle(article.title, article.content);
    let categoryIds: { categoryId: number; subcategoryId?: number };
    try {
      categoryIds = await findOrCreateCategory(classification.categoryName, classification.subcategoryName);
    } catch (err) {
      console.error(`  [ERROR] Failed to resolve category: ${err}`);
      results.errors++;
      results.details.push(`ERROR: "${article.title}" — category resolution failed`);
      continue;
    }

    const excerpt = extractExcerpt(article.content);
    const tags = generateTags(article.title, article.content, classification.categoryName);
    const readTime = estimateReadingTime(article.content);

    const contentWithPreservedFormat = article.content
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean)
      .join("\n\n");

    try {
      const created = await articleService.create(
        {
          title: article.title,
          slug,
          summary: excerpt,
          content: contentWithPreservedFormat,
          categoryId: categoryIds.categoryId,
          status: "DRAFT",
          tags,
        },
        user,
      );

      const seoTitle = `${article.title} | Dnews Africa`;
      const seoDescription = excerpt.length > 160 ? excerpt.substring(0, 157) + "..." : excerpt;

      try {
        await seoService.saveSeo("article", created.id, {
          metaTitle: seoTitle,
          metaDescription: seoDescription,
          focusKeyword: tags[0] || "",
        });
      } catch (seoErr) {
        console.warn(`  [WARN] SEO metadata save failed: ${seoErr}`);
      }

      console.log(`  [OK] Imported as Draft (ID: ${created.id})`);
      console.log(`       Category: ${classification.categoryName}${classification.subcategoryName ? ` → ${classification.subcategoryName}` : ""}`);
      console.log(`       Tags: ${tags.join(", ")}`);
      console.log(`       Reading time: ${readTime} min`);
      results.imported++;
      results.details.push(`IMPORTED: "${article.title}" → ${classification.categoryName}${classification.subcategoryName ? ` / ${classification.subcategoryName}` : ""}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [ERROR] ${msg}`);
      results.errors++;
      results.details.push(`ERROR: "${article.title}" — ${msg}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("IMPORT SUMMARY");
  console.log("=".repeat(60));
  console.log(`  Total articles found in PDF: ${parsedArticles.length}`);
  console.log(`  Imported:                   ${results.imported}`);
  console.log(`  Skipped (duplicates):       ${results.skipped}`);
  console.log(`  Errors:                     ${results.errors}`);
  console.log("");

  const categoryCounts: Record<string, number> = {};
  for (const d of results.details) {
    if (d.startsWith("IMPORTED:")) {
      const parts = d.split("→");
      const cat = parts[1]?.trim().split(" /")[0] || "Unknown";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }
  }

  if (Object.keys(categoryCounts).length > 0) {
    console.log("  Categories assigned:");
    for (const [cat, count] of Object.entries(categoryCounts)) {
      console.log(`    ${cat}: ${count} article(s)`);
    }
  }

  console.log("");
  if (results.errors > 0) {
    console.log("  Validation issues / errors:");
    for (const d of results.details) {
      if (d.startsWith("ERROR:")) console.log(`    ${d}`);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
