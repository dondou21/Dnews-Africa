"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { get } from "@/lib/api-client";

interface Category {
  id: number;
  name: string;
  slug: string;
  _count?: { articles: number };
}

const featuredCategories: Category[] = [
  { id: 0, name: "News", slug: "top-stories" },
  { id: 0, name: "Business", slug: "business" },
  { id: 0, name: "Sports", slug: "sports" },
  { id: 0, name: "Culture", slug: "culture" },
  { id: 0, name: "Innovation", slug: "innovation" },
  { id: 0, name: "Travel", slug: "travel" },
  { id: 0, name: "Youth", slug: "youth" },
  { id: 0, name: "Lifestyle", slug: "lifestyle" },
  { id: 0, name: "Interviews", slug: "interviews" },
  { id: 0, name: "Opinion", slug: "opinion-analysis" },
  { id: 0, name: "Africa", slug: "top-stories" },
  { id: 0, name: "Featured", slug: "featured" },
];

export default function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    get<Category[]>("/categories")
      .then(setCategories)
      .catch(() => {});
  }, []);

  const displayCategories = categories.length > 0 ? categories : featuredCategories;

  const pageMap: Record<string, string> = {
    "top-stories": "/news",
    "opinion-analysis": "/opinion",
  };

  return (
    <section className="mb-8">
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
          {displayCategories.map((cat) => {
            const href = pageMap[cat.slug] || `/${cat.slug}`;
            return (
              <Link
                key={cat.slug}
                href={href}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-dnews-border bg-dnews-card px-4 py-2 text-xs font-medium uppercase tracking-wider text-dnews-gray transition-all hover:border-dnews-accent hover:bg-dnews-accent hover:text-white dark:bg-black dark:hover:bg-dnews-accent"
              >
                {cat.name}
                {cat._count && cat._count.articles > 0 && (
                  <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-dnews-red/10 px-1 text-[10px] font-bold text-dnews-red">
                    {cat._count.articles}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
