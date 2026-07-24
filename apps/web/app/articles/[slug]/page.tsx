"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "@/components/shared/AppImage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, Share2 } from "lucide-react";
import { FaXTwitter, FaFacebookF } from "react-icons/fa6";
import { get } from "@dnews/api-client";
import { getFeaturedImageUrl, FALLBACK_IMAGE } from "@/lib/image";
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
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
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
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return minutes;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getShareUrl(slug: string): string {
  if (typeof window !== "undefined") {
    return window.location.origin + "/articles/" + slug;
  }
  return "";
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [related, setRelated] = useState<ArticleDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await get<ArticleDetail>(`/articles/${slug}`);
        setArticle(data);
        const all = await get<ArticleDetail[]>("/articles/latest");
        setRelated(all.filter((a) => a.slug !== slug).slice(0, 3));
      } catch {
        setArticle(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const readingTime = useMemo(() => {
    if (!article) return 1;
    return estimateReadingTime(article.content);
  }, [article]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-8">
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
      <div className="mx-auto max-w-[1180px] px-4 py-8 text-center">
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

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <Breadcrumbs articleTitle={article.title} categoryName={article.category.name} />
      <div className="flex flex-col gap-8 lg:flex-row">
        <article className="min-w-0 flex-1">
          <div className="mx-auto max-w-[720px]">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
              {article.category.name}
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight text-dnews-dark md:text-4xl lg:text-5xl">
              {article.title}
            </h1>

            {article.summary && (
              <p className="mt-3 text-lg leading-relaxed text-dnews-gray">
                {article.summary}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-dnews-border pb-4 text-sm text-dnews-muted">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dnews-accent/10 text-xs font-bold text-dnews-accent">
                  {(article.authorName || `${article.author.firstName} ${article.author.lastName}`)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  {article.authorName ? (
                    <span className="font-medium text-dnews-dark">
                      {article.authorName}
                    </span>
                  ) : (
                    <span className="font-medium text-dnews-dark">
                      {article.author.firstName} {article.author.lastName}
                    </span>
                  )}
                  {article.authorPosition && (
                    <span className="ml-1 text-dnews-muted">
                      &middot; {article.authorPosition}
                    </span>
                  )}
                </div>
              </div>
              <span className="hidden sm:inline">&middot;</span>
              <time dateTime={article.publishedAt || article.createdAt}>
                {formatDate(article.publishedAt || article.createdAt)}
              </time>
              <span>&middot;</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} />
                {readingTime} min read
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-dnews-muted">
                Share
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dnews-bg text-dnews-gray transition-colors hover:bg-black hover:text-white"
                aria-label="Share on X (Twitter)"
              >
                <FaXTwitter size={14} />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dnews-bg text-dnews-gray transition-colors hover:bg-[#1877f2] hover:text-white"
                aria-label="Share on Facebook"
              >
                <FaFacebookF size={14} />
              </a>
              <a
                href={`https://wa.me/?text=${shareText}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dnews-bg text-dnews-gray transition-colors hover:bg-[#25d366] hover:text-white"
                aria-label="Share on WhatsApp"
              >
                <Share2 size={14} />
              </a>
            </div>

            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
              <Image
                src={imgUrl}
                alt={imgAlt}
                fill
                className="object-cover"
                sizes="(max-width: 720px) 100vw, 720px"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {hasCredits && (
              <div className="mt-2 flex flex-wrap gap-x-1 text-xs text-dnews-muted">
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
                {fi?.credit && fi?.source && <span className="mx-1">|</span>}
                {fi?.source && <span>Source: {fi.source}</span>}
              </div>
            )}

            {hasCaption && (
              <p className="mt-1 text-sm italic leading-relaxed text-dnews-gray">
                {fi?.caption}
              </p>
            )}

            {fi?.copyright && (
              <p className="mt-1 text-[11px] text-dnews-muted">
                &copy; {fi.copyright}
              </p>
            )}

            {fi?.aiGenerated && fi?.aiDisclosure && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-sm bg-amber-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                <span>AI Generated</span>
                <span className="mx-1">&middot;</span>
                <span className="font-normal normal-case">{fi.aiDisclosure}</span>
              </div>
            )}

            <div className="mt-8 space-y-5 text-base leading-relaxed text-dnews-dark">
              <ContentRenderer content={article.content} />
            </div>

            {article.tags.length > 0 && (
              <div className="mt-10 border-t border-dnews-border pt-6">
                <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((t) => (
                    <Link
                      key={t.tag.id}
                      href={`/search?q=${encodeURIComponent(t.tag.name)}`}
                      className="rounded border border-dnews-border px-3 py-1 text-xs text-dnews-gray transition-colors hover:border-dnews-accent hover:text-dnews-accent"
                    >
                      {t.tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-10 rounded-sm border border-dnews-border bg-dnews-card p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-dnews-accent/10 text-sm font-bold text-dnews-accent">
                  {(article.authorName || `${article.author.firstName} ${article.author.lastName}`)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-dnews-dark">
                    {article.authorName
                      ? article.authorName
                      : `${article.author.firstName} ${article.author.lastName}`}
                  </p>
                  {article.authorPosition && (
                    <p className="text-xs text-dnews-muted">{article.authorPosition}</p>
                  )}
                  {article.authorOrganization && (
                    <p className="text-xs text-dnews-muted">{article.authorOrganization}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 rounded-sm border border-dnews-border bg-dnews-card p-6">
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
                          <div className="relative mb-2 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
                            <Image
                              src={rImg}
                              alt={r.featuredImage?.alt || r.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="300px"
                            />
                          </div>
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
  );
}