"use client";

import { useEffect, useState } from "react";
import Image from "@/components/shared/AppImage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { get } from "@/lib/api-client";
import { getFeaturedImageUrl, FALLBACK_IMAGE } from "@/lib/image";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import AdSlot from "@/components/home/AdSlot";
import NewsletterSubscribe from "@/components/newsletter/NewsletterSubscribe";

interface ArticleDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  featuredImage: { url: string; alt: string | null } | null;
  status: string;
  isFeatured: boolean;
  isTrending: boolean;
  publishedAt: string | null;
  category: { id: number; name: string; slug: string };
  author: { id: string; firstName: string; lastName: string };
  tags: { tag: { id: number; name: string; slug: string } }[];
  createdAt: string;
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

  if (loading) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-8">
        <div className="mx-auto max-w-[720px] space-y-4">
          <div className="aspect-[16/9] w-full animate-pulse rounded-sm bg-dnews-border/50" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-dnews-border/50" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-dnews-border/50" />
          <div className="h-4 w-full animate-pulse rounded bg-dnews-border/50" />
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

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <Breadcrumbs articleTitle={article.title} categoryName={article.category.name} />
      <div className="flex flex-col gap-8 lg:flex-row">
        <article className="min-w-0 flex-1">
          <div className="mx-auto max-w-[720px]">
            <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-sm bg-dnews-light-gray">
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

            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
              {article.category.name}
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight text-dnews-dark md:text-4xl">
              {article.title}
            </h1>

            <p className="mt-3 text-base leading-relaxed text-dnews-gray">
              {article.summary}
            </p>

            <div className="mt-4 flex items-center gap-3 border-b border-dnews-border pb-4 text-xs text-dnews-muted">
              <div>
                <span className="font-medium text-dnews-dark">
                  {article.author.firstName} {article.author.lastName}
                </span>
              </div>
              <span>·</span>
              <span>
                {article.publishedAt
                  ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : new Date(article.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
              </span>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-dnews-dark">
              {article.content.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {article.tags.length > 0 && (
              <div className="mt-8 border-t border-dnews-border pt-6">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((t) => (
                    <span
                      key={t.tag.id}
                      className="rounded border border-dnews-border px-2.5 py-1 text-xs text-dnews-gray"
                    >
                      {t.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 rounded-sm border border-dnews-border bg-dnews-card p-5">
              <NewsletterSubscribe
                title="Enjoying this article?"
                description="Subscribe to receive more African stories."
                source="ARTICLE"
                buttonText="Subscribe"
              />
            </div>
          </div>
        </article>

        <aside className="w-full shrink-0 lg:w-[260px]">
          <div className="border-t border-dnews-border pt-6 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            {related.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
                  Related Articles
                </h3>
                <div className="space-y-4">
                  {related.map((r) => (
                    <div key={r.id} className="border-b border-dnews-border pb-3">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-dnews-accent">
                        {r.category.name}
                      </p>
                      <Link
                        href={`/articles/${r.slug}`}
                        className="text-sm font-medium leading-snug text-dnews-dark transition-colors hover:text-dnews-accent"
                      >
                        {r.title}
                      </Link>
                      <p className="mt-1 text-[11px] text-dnews-muted">
                        {r.publishedAt
                          ? new Date(r.publishedAt).toLocaleDateString()
                          : new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
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
