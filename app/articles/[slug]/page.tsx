import { notFound } from "next/navigation";
import Link from "next/link";
import {
  articles,
  getArticleBySlug,
  getRelatedArticles,
} from "@/src/data/articles";
import type { Article } from "@/src/lib/articles";
import AdSlot from "@/components/home/AdSlot";

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = getRelatedArticles(article, 3);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        <article className="min-w-0 flex-1">
          <div className="mx-auto max-w-[720px]">
            <div className="mb-4 aspect-[16/9] w-full bg-dnews-light-gray flex items-center justify-center text-dnews-muted text-sm">
              Cover Image Placeholder
            </div>

            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-dnews-red">
              {article.category}
            </div>

            <h1 className="font-heading text-3xl font-bold leading-tight text-dnews-dark md:text-4xl">
              {article.title}
            </h1>

            <p className="mt-3 text-base leading-relaxed text-dnews-gray">
              {article.excerpt}
            </p>

            <div className="mt-4 flex items-center gap-3 border-b border-dnews-border pb-4 text-xs text-dnews-muted">
              <div>
                <span className="font-medium text-dnews-dark">{article.authorName}</span>
                <span className="ml-1 text-dnews-muted">({article.authorRole})</span>
              </div>
              <span>·</span>
              <span>{article.publishedAt}</span>
              <span>·</span>
              <span>{article.readTime}</span>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-relaxed text-dnews-dark">
              {article.content.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 border-t border-dnews-border pt-6">
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
                Share this article
              </h4>
              <div className="flex gap-2">
                {["Twitter", "Facebook", "WhatsApp", "Email"].map((platform) => (
                  <span
                    key={platform}
                    className="rounded border border-dnews-border px-3 py-1.5 text-xs font-medium text-dnews-gray"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        <aside className="w-full shrink-0 lg:w-[260px]">
          <div className="border-t border-dnews-border pt-6 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <RelatedArticles articles={related} />
            <AdSlot size="medium" />
          </div>
        </aside>
      </div>
    </div>
  );
}

function RelatedArticles({ articles }: { articles: Article[] }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
        Related Articles
      </h3>
      <div className="space-y-4">
        {articles.map((related) => (
          <div key={related.id} className="border-b border-dnews-border pb-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-dnews-accent">
              {related.category}
            </p>
            <Link
              href={`/articles/${related.slug}`}
              className="text-sm font-medium leading-snug text-dnews-dark transition-colors hover:text-dnews-accent"
            >
              {related.title}
            </Link>
            <p className="mt-1 text-[11px] text-dnews-muted">{related.publishedAt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
