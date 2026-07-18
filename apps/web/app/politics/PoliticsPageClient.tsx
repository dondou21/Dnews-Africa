"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "@/components/shared/AppImage";
import { get } from "@dnews/api-client";
import { getFeaturedImageUrl, FALLBACK_IMAGE } from "@/lib/image";
import SectionHeader from "@/components/home/SectionHeader";
import ArticleListItem from "@/components/home/ArticleListItem";
import NewsletterSubscribe from "@/components/newsletter/NewsletterSubscribe";
import { extractExcerpt } from "@/lib/excerpt";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage: { url: string; alt: string | null } | null;
  publishedAt: string | null;
  createdAt: string;
  isFeatured: boolean;
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
  authorName?: string | null;
  authorPosition?: string | null;
}

interface ApiResponse {
  articles: ArticleItem[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const FALLBACK_IMG = "/images/placeholder-news.svg";

export default function PoliticsPageClient() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [latestArticles, setLatestArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [catRes, latestRes] = await Promise.all([
          get<ApiResponse>("/articles?category=politics&limit=20"),
          get<ApiResponse>("/articles?limit=5").catch(() => null),
        ]);
        if (cancelled) return;
        setArticles(catRes.articles || []);
        if (latestRes) setLatestArticles(latestRes.articles || []);
      } catch {
        console.error("Failed to load politics articles");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const featured = articles.find((a) => a.isFeatured) || articles[0] || null;
  const otherArticles = featured ? articles.filter((a) => a.id !== featured.id) : articles;
  const trending = articles.filter((a) => a.isFeatured).slice(0, 5);
  const editorsPicks = articles.slice(0, 4);
  const sidebarArticles = latestArticles.slice(0, 5);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-dnews-dark md:text-4xl">
          Politics
        </h1>
        <p className="mt-2 text-sm text-dnews-gray">
          Political news, policy analysis, and governance stories from across Africa and the diaspora.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-[16/9] rounded-sm bg-dnews-border/50" />
              <div className="h-4 w-3/4 rounded bg-dnews-border/50" />
              <div className="h-4 w-1/2 rounded bg-dnews-border/50" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-sm border border-dnews-border bg-dnews-card p-12 text-center">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-dnews-light-gray">
              <svg className="h-8 w-8 text-dnews-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            </div>
            <h2 className="font-heading text-2xl font-bold text-dnews-dark">
              No published articles yet
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-dnews-muted">
              There are currently no published articles in <strong className="text-dnews-dark">Politics</strong>.
              Our team is working on bringing you the latest stories. Please check back later.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="rounded-sm bg-dnews-accent px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-dnews-accent-light"
              >
                Back to Home
              </Link>
              <Link
                href="/news"
                className="rounded-sm border border-dnews-border px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-dnews-gray transition-colors hover:bg-dnews-light-gray"
              >
                Browse All News
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-8">
          <div className="min-w-0 flex-1 space-y-10">
            {featured && (
              <section>
                <SectionHeader title="Featured Story" />
                <article className="group">
                  <Link href={`/articles/${featured.slug}`}>
                    <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
                      <Image
                        src={getFeaturedImageUrl(featured.featuredImage, featured.coverImageUrl)}
                        alt={featured.featuredImage?.alt || featured.coverImageAlt || featured.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 780px"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <span className="mb-2 inline-block rounded bg-dnews-red px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                      {featured.category?.name || "Politics"}
                    </span>
                    <h2 className="font-heading mt-2 text-2xl font-bold leading-tight text-dnews-dark md:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-base leading-relaxed text-dnews-gray">
                      {extractExcerpt(featured.summary, featured.content)}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm text-dnews-muted">
                      <span className="font-medium text-dnews-dark">
                        By {featured.authorName || `${featured.author?.firstName || ""} ${featured.author?.lastName || ""}`.trim()}
                      </span>
                      <span>·</span>
                      <span>{formatDate(featured.publishedAt)}</span>
                    </div>
                  </Link>
                </article>
              </section>
            )}

            <section>
              <SectionHeader title="Latest Political News" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {otherArticles.slice(0, 6).map((article) => (
                  <article key={article.id} className="group">
                    <Link href={`/articles/${article.slug}`}>
                      <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
                        <Image
                          src={getFeaturedImageUrl(article.featuredImage, article.coverImageUrl)}
                          alt={article.featuredImage?.alt || article.coverImageAlt || article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <span className="mb-1.5 inline-block text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
                        {article.category?.name || ""}
                      </span>
                      <h3 className="font-heading text-base font-bold leading-snug text-dnews-dark transition-colors group-hover:text-dnews-accent">
                        {article.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-dnews-gray">
                        {extractExcerpt(article.summary, article.content)}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-dnews-muted">
                        <span className="font-medium text-dnews-dark">
                          By {article.authorName || `${article.author?.firstName || ""} ${article.author?.lastName || ""}`.trim()}
                        </span>
                        <span>·</span>
                        <span>{formatDate(article.publishedAt)}</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            {trending.length > 0 && (
              <section>
                <SectionHeader title="Trending in Politics" />
                <div className="space-y-4">
                  {trending.map((article, i) => (
                    <div key={article.id} className="flex items-start gap-4">
                      <span className="font-heading mt-0.5 shrink-0 text-2xl font-bold text-dnews-border">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <Link href={`/articles/${article.slug}`} className="group">
                        <h3 className="font-heading text-sm font-bold leading-snug text-dnews-dark transition-colors group-hover:text-dnews-accent">
                          {article.title}
                        </h3>
                        <p className="mt-1 text-xs text-dnews-muted">{formatDate(article.publishedAt)}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <SectionHeader title="Editor&apos;s Picks" />
              <div className="grid gap-6 sm:grid-cols-2">
                {editorsPicks.map((article) => (
                  <article key={article.id} className="group">
                    <Link href={`/articles/${article.slug}`}>
                      <div className="relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
                        <Image
                          src={getFeaturedImageUrl(article.featuredImage, article.coverImageUrl)}
                          alt={article.featuredImage?.alt || article.coverImageAlt || article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <h3 className="font-heading text-base font-bold leading-snug text-dnews-dark transition-colors group-hover:text-dnews-accent">
                        {article.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-dnews-gray">
                        {extractExcerpt(article.summary, article.content)}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="w-full shrink-0 lg:w-[300px]">
            <div className="border-t border-dnews-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <div className="mb-6 rounded-sm border border-dnews-border bg-dnews-card p-4">
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
                  Latest Headlines
                </h3>
                <div className="space-y-3">
                  {sidebarArticles.map((article) => (
                    <ArticleListItem key={article.slug} article={article} />
                  ))}
                </div>
              </div>

              <div className="mb-6 rounded-sm border border-dnews-border bg-dnews-card p-4">
                <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
                  Newsletter
                </h3>
                <NewsletterSubscribe
                  title=""
                  description="Get the latest political news delivered to your inbox."
                  source="ARTICLE"
                  buttonText="Subscribe"
                />
              </div>

              {trending.length > 0 && (
                <div className="mb-6 rounded-sm border border-dnews-border bg-dnews-card p-4">
                  <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
                    Trending
                  </h3>
                  <div className="space-y-3">
                    {trending.map((article) => (
                      <ArticleListItem key={article.slug} article={article} />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-sm border border-dnews-border bg-dnews-card p-4">
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-red">
                  Follow Us
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "YouTube", icon: "FaYoutube", href: "#" },
                    { name: "Instagram", icon: "FaInstagram", href: "#" },
                    { name: "Facebook", icon: "FaFacebookF", href: "#" },
                    { name: "X (Twitter)", icon: "FaXTwitter", href: "#" },
                  ].map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="inline-flex h-8 w-8 items-center justify-center rounded border border-dnews-border text-dnews-gray transition-colors hover:border-dnews-red hover:text-dnews-red"
                      aria-label={link.name}
                    >
                      <span className="text-[10px] font-bold uppercase">{link.name.charAt(0)}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
