import ArticleListItem from "./ArticleListItem";

const stories = [
  {
    category: "Business · Innovation",
    title: "Kenyan fintech startup raises $45M to expand mobile banking across Francophone Africa",
    date: "June 29, 2026",
    readTime: "4 min read",
    categoryColor: "blue" as const,
  },
  {
    category: "Sports",
    title: "Senegal secures AFCON quarterfinal spot after dramatic penalty shootout victory",
    date: "June 28, 2026",
    readTime: "3 min read",
    categoryColor: "red" as const,
  },
  {
    category: "News",
    title: "Nigeria unveils ambitious five-year plan to develop Africa's first commercial satellite network",
    date: "June 28, 2026",
    readTime: "5 min read",
    categoryColor: "blue" as const,
  },
  {
    category: "Culture",
    title: "Lagos literary festival draws thousands as African storytelling goes global",
    date: "June 27, 2026",
    readTime: "4 min read",
    categoryColor: "red" as const,
  },
  {
    category: "Video · DnewsAfrica TV",
    title: "Inside Ghana's booming film industry: How local creators are challenging Nollywood",
    date: "June 27, 2026",
    readTime: "8 min watch",
    categoryColor: "blue" as const,
  },
  {
    category: "Youth",
    title: "Climate activists under 25: The young Africans leading grassroots environmental movements",
    date: "June 26, 2026",
    readTime: "6 min read",
    categoryColor: "red" as const,
  },
];

export default function LatestStories() {
  return (
    <section>
      <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-dnews-muted">
        Latest Stories
      </h3>
      <div className="space-y-4">
        {stories.map((story, i) => (
          <ArticleListItem key={i} {...story} />
        ))}
      </div>
    </section>
  );
}
