import LeftSidebar from "@/components/home/LeftSidebar";
import HeroArticle from "@/components/home/HeroArticle";
import LatestStories from "@/components/home/LatestStories";
import RightSidebar from "@/components/home/RightSidebar";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-full shrink-0 lg:block lg:w-[220px]">
          <div className="border-r border-dnews-border pr-4">
            <LeftSidebar />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="lg:pr-6">
            <HeroArticle />
            <LatestStories />
          </div>
        </main>

        <aside className="w-full shrink-0 lg:w-[260px]">
          <div className="border-l border-dnews-border pl-4">
            <RightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}
