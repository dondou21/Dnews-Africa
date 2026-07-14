"use client";

import CategoryPage from "@/components/articles/CategoryPage";

export default function SubcategoryPage(props: { title: string; description: string; categorySlug: string }) {
  return <CategoryPage {...props} />;
}
