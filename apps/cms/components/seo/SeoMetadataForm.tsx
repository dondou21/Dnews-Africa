"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { Search, Globe, AtSign, Share2, Code } from "lucide-react";
import SeoAnalyzer from "./SeoAnalyzer";
import SocialPreview from "./SocialPreview";
import { post } from "@dnews/api-client";
import type { SeoMetadata, SeoAnalysisResult } from "@dnews/types";

interface SeoMetadataFormProps {
  metadata: Partial<SeoMetadata>;
  articleTitle?: string;
  articleContent?: string;
  articleSlug?: string;
  coverImageUrl?: string | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  saving?: boolean;
  readOnly?: boolean;
}

export default function SeoMetadataForm({ metadata, articleTitle, articleContent, articleSlug, coverImageUrl, onSave, saving, readOnly }: SeoMetadataFormProps) {
  const [metaTitle, setMetaTitle] = useState(metadata.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(metadata.metaDescription ?? "");
  const [focusKeyword, setFocusKeyword] = useState(metadata.focusKeyword ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(metadata.canonicalUrl ?? "");
  const [robots, setRobots] = useState(metadata.robots ?? "index, follow");
  const [ogTitle, setOgTitle] = useState(metadata.ogTitle ?? "");
  const [ogDescription, setOgDescription] = useState(metadata.ogDescription ?? "");
  const [twitterTitle, setTwitterTitle] = useState(metadata.twitterTitle ?? "");
  const [twitterDescription, setTwitterDescription] = useState(metadata.twitterDescription ?? "");
  const [schemaType, setSchemaType] = useState(metadata.schemaType ?? "NewsArticle");
  const [analysis, setAnalysis] = useState<SeoAnalysisResult | null>(null);
  const [analysing, setAnalysing] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "social" | "schema">("general");

  const runAnalysis = useCallback(async () => {
    setAnalysing(true);
    try {
      const result = await post<SeoAnalysisResult>("/seo/analyze", {
        title: metaTitle || articleTitle,
        metaTitle,
        metaDescription,
        focusKeyword,
        content: articleContent,
        coverImageUrl,
        ogTitle,
        ogDescription,
        twitterTitle,
        slug: articleSlug,
      });
      setAnalysis(result);
    } catch { setAnalysis(null); } finally { setAnalysing(false); }
  }, [metaTitle, metaDescription, focusKeyword, articleContent, articleTitle, coverImageUrl, ogTitle, ogDescription, twitterTitle, articleSlug]);

  useEffect(() => {
    const timer = setTimeout(runAnalysis, 800);
    return () => clearTimeout(timer);
  }, [runAnalysis]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSave({
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      focusKeyword: focusKeyword || null,
      canonicalUrl: canonicalUrl || null,
      robots: robots || null,
      ogTitle: ogTitle || null,
      ogDescription: ogDescription || null,
      twitterTitle: twitterTitle || null,
      twitterDescription: twitterDescription || null,
      schemaType: schemaType || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 rounded-sm border border-dnews-border bg-dnews-card p-1">
            {[
              { key: "general", label: "General", icon: Search },
              { key: "social", label: "Social", icon: Share2 },
              { key: "schema", label: "Schema", icon: Code },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key as any)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-2 text-xs font-medium transition-colors ${
                    isActive ? "bg-dnews-accent text-white" : "text-dnews-gray hover:text-dnews-dark"
                  }`}>
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "general" && (
            <div className="space-y-4 rounded-sm border border-dnews-border bg-dnews-card p-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">SEO Title</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} maxLength={70} disabled={readOnly}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" placeholder={articleTitle || "SEO title"} />
                <p className="mt-1 text-xs text-dnews-muted">{metaTitle.length}/70 characters</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Meta Description</label>
                <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={160} rows={2} disabled={readOnly}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" placeholder="Brief description for search results" />
                <p className="mt-1 text-xs text-dnews-muted">{metaDescription.length}/160 characters</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Focus Keyword</label>
                  <input type="text" value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} disabled={readOnly}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" placeholder="main keyword" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Robots</label>
                  <select value={robots} onChange={(e) => setRobots(e.target.value)} disabled={readOnly}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                    <option value="index, follow">index, follow</option>
                    <option value="noindex, follow">noindex, follow</option>
                    <option value="index, nofollow">index, nofollow</option>
                    <option value="noindex, nofollow">noindex, nofollow</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Canonical URL</label>
                <div className="relative">
                  <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dnews-muted" />
                  <input type="url" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} disabled={readOnly}
                    className="w-full rounded-sm border border-dnews-border bg-dnews-bg py-2 pl-9 pr-3 text-sm text-dnews-dark outline-none focus:border-dnews-accent" placeholder="https://dnewsafrica.com/articles/..." />
                </div>
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="space-y-4 rounded-sm border border-dnews-border bg-dnews-card p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                <Share2 size={14} className="mr-1 inline" /> Open Graph (Facebook, LinkedIn, WhatsApp)
              </h4>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">OG Title</label>
                <input type="text" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} maxLength={70} disabled={readOnly}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" placeholder={metaTitle || articleTitle || "Open Graph title"} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">OG Description</label>
                <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} maxLength={200} rows={2} disabled={readOnly}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" placeholder={metaDescription || "Open Graph description"} />
              </div>
              <hr className="border-dnews-border" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-dnews-gray">
                <AtSign size={14} className="mr-1 inline" /> Twitter Card
              </h4>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Twitter Title</label>
                <input type="text" value={twitterTitle} onChange={(e) => setTwitterTitle(e.target.value)} maxLength={70} disabled={readOnly}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" placeholder={ogTitle || metaTitle || articleTitle || "Twitter title"} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Twitter Description</label>
                <textarea value={twitterDescription} onChange={(e) => setTwitterDescription(e.target.value)} maxLength={200} rows={2} disabled={readOnly}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent" placeholder={ogDescription || metaDescription || "Twitter description"} />
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-4 rounded-sm border border-dnews-border bg-dnews-card p-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-dnews-gray">Schema Type</label>
                <select value={schemaType} onChange={(e) => setSchemaType(e.target.value)} disabled={readOnly}
                  className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-sm text-dnews-dark outline-none focus:border-dnews-accent">
                  <option value="NewsArticle">NewsArticle</option>
                  <option value="Article">Article</option>
                  <option value="BreadcrumbList">BreadcrumbList</option>
                  <option value="Organization">Organization</option>
                  <option value="Person">Person</option>
                  <option value="WebSite">WebSite</option>
                  <option value="FAQPage">FAQPage</option>
                </select>
              </div>
              <div className="rounded-sm bg-dnews-bg p-3">
                <p className="text-xs font-medium text-dnews-muted">Generated JSON-LD will appear here when the article is published.</p>
                <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-3 text-xs text-green-400">
                  {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": schemaType,
                    headline: metaTitle || articleTitle,
                    description: metaDescription,
                    ...(coverImageUrl ? { image: coverImageUrl } : {}),
                  }, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <SeoAnalyzer analysis={analysis} loading={analysing} />
          <SocialPreview
            title={ogTitle || metaTitle || articleTitle}
            description={ogDescription || metaDescription}
            imageUrl={coverImageUrl}
            url={canonicalUrl || `https://dnewsafrica.com/articles/${articleSlug}`}
          />
        </div>
      </div>

      {!readOnly && (
        <div className="flex justify-end gap-3">
          <button type="submit" disabled={saving}
            className="rounded-sm bg-dnews-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60">
            {saving ? "Saving..." : "Save SEO Metadata"}
          </button>
        </div>
      )}
    </form>
  );
}
