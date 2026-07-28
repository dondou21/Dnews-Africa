"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import ArticleImage from "@/components/shared/ArticleImage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Share2 } from "lucide-react";
import { FaXTwitter, FaFacebookF } from "react-icons/fa6";
import { get } from "@dnews/api-client";
import { getFeaturedImageUrl, FALLBACK_IMAGE } from "@/lib/image";
import { useRevalidateOnPublish } from "@/lib/useRevalidateOnPublish";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import AdSlot from "@/components/home/AdSlot";
import NewsletterSubscribe from "@/components/newsletter/NewsletterSubscribe";
import ContentRenderer from "@/components/shared/ContentRenderer";

interface FeaturedImageData {
  url: string;
  alt: string | null;
  caption?: string | null;
  credit?: string | null;
  source?: string | null;
  description?: string | null;
  copyright?: string | null;
  location?: string | null;
  dateTaken?: string | null;
  creditUrl?: string | null;
  aiGenerated?: boolean | null;
  aiDisclosure?: string | null;
}

interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage: FeaturedImageData | null;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  publishedAt: string | null;
  updatedAt: string;
  category: { id: number; name: string; slug: string; parentId: number | null; parent: { id: number; name: string; slug: string } | null };
  author: { id: string; firstName: string; lastName: string; bio?: string | null; avatarUrl?: string | null };
  authorName: string | null;
  authorPosition: string | null;
  authorOrganization: string | null;
  tags: { tag: { id: number; name: string; slug: string } }[];
  createdAt: string;
}

function estimateReadingTime(content: string): number {
  if (!content) return 1;
  const plain = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const wordCount = plain.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isSameDay(a: string | null, b: string): boolean {
  if (!a) return false;
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

function getShareUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return window.location.origin + "/articles/" + slug;
  }
  return "";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ArticleJsonLd({ article, imgUrl }: { article: ArticleDetail; imgUrl: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    image: imgUrl !== FALLBACK_IMAGE ? imgUrl : undefined,
    datePublished: article.publishedAt || article.createdAt,
    dateModified: article.updatedAt || article.publishedAt || article.createdAt,
    author: {
      "@type": "Person",
      name: article.authorName || `${article.author.firstName} ${article.author.lastName}`,
    },
    publisher: {
      "@type": "Organization",
      name: "Dnews Africa",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": typeof window !== "undefined" ? window.location.href : "",
    },
    articleSection: article.category.parent ? `${article.category.parent.name} / ${article.category.name}` : article.category.name,
    keywords: article.tags.map((t) => t.tag.name).join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [related, setRelated] = useState<ArticleDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRelated = useCallback(async (s: string) => {
    try {
      const all = await get<ArticleDetail[]>("/articles/latest");
      setRelated(all.filter((a) => a.slug !== s).slice(0, 3));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const data = await get<ArticleDetail>(`/articles/${slug}`);
        setArticle(data);
        await loadRelated(slug);
      } catch {
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, loadRelated]);

  useRevalidateOnPublish(
    useCallback(() => { loadRelated(slug); }, [loadRelated, slug])
  );

  const readingTime = useMemo(() => {
    if (!article) return 1;
    return estimateReadingTime(article.content);
  }, [article]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:py-8">
        <div className="mx-auto max-w-[720px] space-y-4">
          <div className="h-4 w-20 animate-pulse rounded bg-dnews-border/50" />
          <div className="h-10 w-full animate-pulse rounded bg-dnews-border/50" />
          <div className="h-5 w-2/3 animate-pulse rounded bg-dnews-border/50" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-dnews-border/50" />
          <div className="aspect-[16/9] w-full animate-pulse rounded-sm bg-dnews-border/50" />
          <div className="h-4 w-full animate-pulse rounded bg-dnews-border/50" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-dnews-border/50" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-6 text-center sm:py-8">
        <h1 className="font-heading text-2xl font-bold text-dnews-dark">
          Article Not Found
        </h1>
        <p className="mt-2 text-sm text-dnews-muted">
          The article you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-1 text-sm text-dnews-accent transition-colors hover:text-dnews-accent-light"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>
      </div>
    );
  }

  const imgUrl = getFeaturedImageUrl(article.featuredImage, article.coverImageUrl);
  const imgAlt = article.featuredImage?.alt || article.coverImageAlt || article.title;
  const fi = article.featuredImage;

  const hasCredits = !!(fi?.credit || fi?.source || fi?.creditUrl);
  const hasCaption = !!fi?.caption;

  const shareUrl = getShareUrl(article.slug);
  const shareText = encodeURIComponent(article.title);
  const encodedUrl = encodeURIComponent(shareUrl);

  const authorDisplayName = article.authorName || `${article.author.firstName} ${article.author.lastName}`;
  const authorInitials = getInitials(authorDisplayName);
  const showUpdated = !isSameDay(article.publishedAt, article.updatedAt);

  return (
    <>
      <ArticleJsonLd article={article} imgUrl={imgUrl} />
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:py-8">
        <Breadcrumbs articleTitle={article.title} categoryName={article.category.name} categorySlug={article.category.slug} parentCategoryName={article.category.parent?.name} parentCategorySlug={article.category.parent?.slug} />
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <article className="min-w-0 flex-1">
            <div className="mx-auto max-w-[720px]">

              {/* Category */}
              {article.category.parent ? (
                <div className="inline-flex flex-wrap gap-1 text-[11px] font-semibold uppercase tracking-wider">
                  <Link
                    href={`/${article.category.parent.slug}`}
                    className="text-dnews-red transition-colors hover:text-dnews-accent"
                  >
                    {article.category.parent.name}
                  </Link>
                  <span className="text-dnews-muted">/</span>
                  <Link
                    href={`/${article.category.slug}`}
                    className="text-dnews-red transition-colors hover:text-dnews-accent"
                  >
                    {article.category.name}
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/${article.category.slug}`}
                  className="inline-block text-[11px] font-semibold uppercase tracking-wider text-dnews-red transition-colors hover:text-dnews-accent"
                >
                  {article.category.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="font-heading text-[clamp(1.75rem,4vw,3.25rem)] font-bold leading-tight text-dnews-dark mt-3">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.summary && (
                <p className="mt-4 text-[clamp(1rem,2vw,1.2rem)] leading-relaxed text-dnews-gray">
                  {article.summary}
                </p>
              )}

              {/* Author */}
              <div className="mt-5 flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dnews-accent/10 text-xs font-bold text-dnews-accent">
                  {authorInitials}
                </div>
                <div>
                  <span className="text-sm font-medium text-dnews-dark">
                    {authorDisplayName}
                  </span>
                  {article.authorPosition && (
                    <span className="ml-1 text-xs text-dnews-muted">
                      {article.authorPosition}
                    </span>
                  )}
                </div>
              </div>

              {/* Date & Reading Time */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-dnews-muted">
                <time dateTime={article.publishedAt || article.createdAt} className="inline-flex items-center gap-1.5">
                  <CalendarDays size={13} className="opacity-60" aria-hidden="true" />
                  {formatDate(article.publishedAt || article.createdAt)}
                </time>
                {showUpdated && (
                  <span className="text-dnews-muted">
                    &middot; Updated {formatDate(article.updatedAt)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <span>&middot;</span>
                  <Clock size={13} aria-hidden="true" />
                  {readingTime} min read
                </span>
              </div>

              {/* Share Buttons */}
              <div className="mt-5 flex items-center gap-2 border-b border-dnews-border pb-5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-dnews-muted">
                  Share
                </span>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dnews-bg text-dnews-gray transition-colors hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  aria-label="Share on X (Twitter)"
                >
                  <FaXTwitter size={14} aria-hidden="true" />
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dnews-bg text-dnews-gray transition-colors hover:bg-[#1877f2] hover:text-white"
                  aria-label="Share on Facebook"
                >
                  <FaFacebookF size={14} aria-hidden="true" />
                </a>
                <a
                  href={`https://wa.me/?text=${shareText}%20${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dnews-bg text-dnews-gray transition-colors hover:bg-[#25d366] hover:text-white"
                  aria-label="Share on WhatsApp"
                >
                  <Share2 size={14} aria-hidden="true" />
                </a>
              </div>

              {/* Featured Image */}
              <ArticleImage
                src={imgUrl}
                alt={imgAlt}
                layout="hero"
                priority
                containerClassName="mt-6"
                sizes="(max-width: 720px) 100vw, 720px"
              />

              {(hasCredits || hasCaption) && (
                <div className="mt-3 border-l-2 border-dnews-border/50 pl-4">
                  {hasCaption && (
                    <p className="text-sm leading-relaxed text-dnews-dark">
                      {fi?.caption}
                    </p>
                  )}
                  {hasCredits && (
                    <div className="mt-1.5 flex flex-wrap gap-x-1 text-[11px] text-dnews-muted">
                      {fi?.credit && (
                        <span>
                          Photo: {fi.credit}
                          {fi?.creditUrl && (
                            <>
                              {" "}
                              <a
                                href={fi.creditUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline transition-colors hover:text-dnews-accent"
                              >
                                ({fi.creditUrl})
                              </a>
                            </>
                          )}
                        </span>
                      )}
                      {fi?.credit && fi?.source && <span className="mx-0.5">|</span>}
                      {fi?.source && <span>Source: {fi.source}</span>}
                    </div>
                  )}
                  {fi?.copyright && (
                    <p className="mt-1 text-[10px] text-dnews-muted/70">
                      &copy; {fi.copyright}
                    </p>
                  )}
                </div>
              )}

              {fi?.aiGenerated && fi?.aiDisclosure && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-sm bg-amber-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  <span>AI Generated</span>
                  <span className="mx-1">&middot;</span>
                  <span className="font-normal normal-case">{fi.aiDisclosure}</span>
                </div>
              )}

              {/* Article Content */}
              <div className="mt-8 text-dnews-dark [&>*:first-child]:mt-0">
                <ContentRenderer content={article.content} />
              </div>

              {/* Metadata Footer */}
              <div className="mt-12 border-t border-dnews-border pt-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-dnews-muted">
                  <span className="inline-flex items-center gap-1">
                    <span className="font-medium text-dnews-dark">Category:</span>{" "}
                    <Link
                      href={`/${article.category.slug}`}
                      className="text-dnews-accent transition-colors hover:text-dnews-accent-light"
                    >
                      {article.category.name}
                    </Link>
                  </span>
                  <span className="hidden sm:inline">&middot;</span>
                  <span>
                    Published{" "}
                    <time dateTime={article.publishedAt || article.createdAt}>
                      {formatDate(article.publishedAt || article.createdAt)}
                    </time>
                  </span>
                  {showUpdated && (
                    <>
                      <span className="hidden sm:inline">&middot;</span>
                      <span>
                        Updated{" "}
                        <time dateTime={article.updatedAt}>
                          {formatDate(article.updatedAt)}
                        </time>
                      </span>
                    </>
                  )}
                  <span className="hidden sm:inline">&middot;</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {readingTime} min read
                  </span>
                </div>
              </div>

              {/* Tags */}
              {article.tags.length > 0 && (
                <div className="mt-8">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((t) => (
                      <Link
                        key={t.tag.id}
                        href={`/search?q=${encodeURIComponent(t.tag.name)}`}
                        className="rounded-md border border-dnews-border bg-dnews-card px-3 py-1.5 text-[11px] font-medium text-dnews-gray transition-colors hover:border-dnews-accent hover:bg-dnews-accent/5 hover:text-dnews-accent"
                      >
                        {t.tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author */}
              <div className="mt-10 rounded-sm border border-dnews-border bg-dnews-card px-5 py-6 sm:p-6">
                <div className="flex items-start gap-4">
                  {article.author.avatarUrl ? (
                    <img
                      src={article.author.avatarUrl}
                      alt={authorDisplayName}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dnews-accent/10 text-sm font-bold text-dnews-accent">
                      {authorInitials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-dnews-dark">
                      {authorDisplayName}
                    </p>
                    {article.authorPosition && (
                      <p className="text-xs text-dnews-muted">{article.authorPosition}</p>
                    )}
                    {article.authorOrganization && (
                      <p className="text-xs text-dnews-muted">{article.authorOrganization}</p>
                    )}
                    {article.author.bio && (
                      <p className="mt-2 text-sm leading-relaxed text-dnews-gray">
                        {article.author.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="mt-10 rounded-sm border border-dnews-border bg-dnews-card px-5 py-6 sm:p-6">
                <NewsletterSubscribe
                  title="Enjoying this article?"
                  description="Subscribe to receive more African stories delivered to your inbox."
                  source="ARTICLE"
                  buttonText="Subscribe"
                />
              </div>
            </div>
          </article>

          <aside className="w-full shrink-0 lg:w-[300px]">
            <div className="border-t border-dnews-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {related.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
                    Related Articles
                  </h3>
                  <div className="space-y-5">
                    {related.map((r) => {
                      const rImg = getFeaturedImageUrl(r.featuredImage, r.coverImageUrl);
                      return (
                        <div key={r.id} className="group">
                          <Link href={`/articles/${r.slug}`}>
                            <ArticleImage
                              src={rImg}
                              alt={r.featuredImage?.alt || r.title}
                              layout="card"
                              containerClassName="mb-2"
                              sizes="300px"
                            />
                          </Link>
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-dnews-accent">
                            {r.category.name}
                          </p>
                          <Link
                            href={`/articles/${r.slug}`}
                            className="text-sm font-medium leading-snug text-dnews-dark transition-colors group-hover:text-dnews-accent"
                          >
                            {r.title}
                          </Link>
                          <p className="mt-1 text-[11px] text-dnews-muted">
                            {formatDate(r.publishedAt || r.createdAt)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <AdSlot variant="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}