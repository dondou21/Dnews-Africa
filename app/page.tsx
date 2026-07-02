import {
  getFeaturedArticle,
  getLatestArticles,
  getTrendingArticles,
} from "@/src/lib/articles";
import LeftSidebar from "@/components/home/LeftSidebar";
import HeroArticle from "@/components/home/HeroArticle";
import LatestStories from "@/components/home/LatestStories";
import RightSidebar from "@/components/home/RightSidebar";
import AdSlot from "@/components/home/AdSlot";

export default function Home() {
  const featured = getFeaturedArticle()!;
  const latest = getLatestArticles(6);
  const trending = getTrendingArticles();

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-5 md:py-6">
      <div className="flex flex-col lg:flex-row lg:gap-6">
        <aside className="hidden w-full shrink-0 lg:block lg:w-[200px]">
          <div className="border-r border-dnews-border pr-4">
            <LeftSidebar />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <HeroArticle article={featured} />
          <AdSlot variant="banner" className="mb-8" />
          <LatestStories articles={latest} />
        </main>

        <aside className="w-full shrink-0 lg:w-[260px]">
          <div className="border-t border-dnews-border pt-6 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <RightSidebar trendingArticles={trending} />
          </div>
        </aside>
      </div>
    </div>
  );
}
