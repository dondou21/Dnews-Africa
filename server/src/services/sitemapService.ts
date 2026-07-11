import prisma from "../utils/prisma";

function xmlEncode(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  return new Date(date).toISOString();
}

export const sitemapService = {
  async generateMainSitemap(baseUrl: string): Promise<string> {
    const [articles, categories, tags, authors] = await Promise.all([
      prisma.article.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true }, orderBy: { updatedAt: "desc" } }),
      prisma.category.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.tag.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.user.findMany({ where: { isActive: true }, select: { id: true, updatedAt: true } }),
    ]);

    const urls: string[] = [`${baseUrl}/`];

    for (const a of articles) urls.push(`${baseUrl}/articles/${a.slug}`);
    for (const c of categories) urls.push(`${baseUrl}/category/${c.slug}`);
    for (const t of tags) urls.push(`${baseUrl}/tag/${t.slug}`);
    for (const a of authors) urls.push(`${baseUrl}/author/${a.id}`);

    const chunks = urls.map((url) => {
      const article = articles.find((a) => url.endsWith(a.slug));
      const lastmod = article ? formatDate(article.updatedAt) : formatDate(null);
      return `  <url>\n    <loc>${xmlEncode(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${chunks.join("\n")}\n</urlset>`;
  },

  async generateNewsSitemap(baseUrl: string): Promise<string> {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, title: true, publishedAt: true, updatedAt: true, category: { select: { name: true } }, tags: { include: { tag: { select: { name: true } } } } },
      orderBy: { publishedAt: "desc" },
      take: 1000,
    });

    const settings = await prisma.seoSettings.findFirst({ orderBy: { id: "asc" } });
    const pubName = settings?.googleNewsPubName ?? "Dnews Africa";

    const items = articles.map((a) => {
      const keywords = a.tags.map((t) => t.tag.name).join(", ");
      return `  <url>\n    <loc>${xmlEncode(`${baseUrl}/articles/${a.slug}`)}</loc>\n    <news:news>\n      <news:publication>\n        <news:name>${xmlEncode(pubName)}</news:name>\n        <news:language>en</news:language>\n      </news:publication>\n      <news:publication_date>${formatDate(a.publishedAt)}</news:publication_date>\n      <news:title>${xmlEncode(a.title)}</news:title>\n      ${keywords ? `<news:keywords>${xmlEncode(keywords)}</news:keywords>` : ""}\n    </news:news>\n  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${items.join("\n")}\n</urlset>`;
  },

  async generateImageSitemap(baseUrl: string): Promise<string> {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED", coverImageUrl: { not: null } },
      select: { slug: true, coverImageUrl: true, title: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    const items = articles.map((a) => {
      return `  <url>\n    <loc>${xmlEncode(`${baseUrl}/articles/${a.slug}`)}</loc>\n    <image:image>\n      <image:loc>${xmlEncode(a.coverImageUrl!)}</image:loc>\n      <image:title>${xmlEncode(a.title)}</image:title>\n    </image:image>\n    <lastmod>${formatDate(a.updatedAt)}</lastmod>\n  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${items.join("\n")}\n</urlset>`;
  },

  async generateRobotsTxt(baseUrl: string): Promise<string> {
    const settings = await prisma.seoSettings.findFirst({ orderBy: { id: "asc" } });
    const defaultRobots = settings?.defaultRobots ?? "index, follow";

    const lines: string[] = [
      `User-agent: *`,
      defaultRobots.includes("noindex") ? "Disallow: /" : "Allow: /",
      defaultRobots.includes("noindex") ? "" : "",
      `Sitemap: ${baseUrl}/sitemap.xml`,
      `Sitemap: ${baseUrl}/news-sitemap.xml`,
      `Sitemap: ${baseUrl}/image-sitemap.xml`,
    ];

    return lines.filter(Boolean).join("\n");
  },
};
