import { notFound } from "next/navigation";
import SubcategoryPage from "./SubcategoryPage";

const VALID_SLUGS = new Set([
  "top-stories", "news", "breaking", "africa", "international", "economy",
  "agriculture", "sports", "football", "basketball", "athletics", "tennis",
  "rugby", "volleyball", "handball", "motorsports", "cricket", "combat-sports",
  "afcon", "world-cup", "business", "entrepreneurship", "startup", "markets",
  "banking-finance", "energy", "innovation", "tech", "ai-data", "space",
  "green-tech", "youth", "education", "careers", "social-impact",
  "culture", "music", "film-tv", "arts", "books-lit", "lifestyle",
  "fashion", "food", "health-wellness", "travel", "destinations",
  "aviation", "entertainment", "featured", "special-reports",
  "sponsored", "interviews", "opinion-analysis", "opinion",
  "pictorial", "tv", "videos", "podcasts", "documentaries",
  "politics",
]);

const SLUG_LABELS: Record<string, { title: string; description: string }> = {
  "top-stories": { title: "Top Stories", description: "Leading news stories and headlines from across Africa." },
  "breaking": { title: "Breaking News", description: "Breaking news and developing stories from across the continent." },
  "africa": { title: "Africa", description: "Stories and developments from across the African continent." },
  "international": { title: "International", description: "Global news and international affairs." },
  "economy": { title: "Economy", description: "Economic news, policy, and financial developments." },
  "agriculture": { title: "Agriculture", description: "Farming, agribusiness, and food security across Africa." },
  "football": { title: "Football", description: "African football coverage including AFCON, leagues, and stars." },
  "basketball": { title: "Basketball", description: "Basketball news, NBA Africa, and local leagues." },
  "athletics": { title: "Athletics", description: "Track and field, marathons, and Olympic sports." },
  "tennis": { title: "Tennis", description: "Tennis tournaments and African players on the global stage." },
  "rugby": { title: "Rugby", description: "Rugby union and sevens coverage across Africa." },
  "volleyball": { title: "Volleyball", description: "Volleyball news and tournaments." },
  "handball": { title: "Handball", description: "Handball coverage and competitions." },
  "motorsports": { title: "Motorsports", description: "Racing and motorsports from Africa and beyond." },
  "cricket": { title: "Cricket", description: "Cricket news, leagues, and African teams." },
  "combat-sports": { title: "Combat Sports", description: "Boxing, MMA, wrestling, and combat sports." },
  "afcon": { title: "AFCON", description: "Africa Cup of Nations coverage." },
  "world-cup": { title: "World Cup", description: "FIFA World Cup coverage and qualifiers." },
  "entrepreneurship": { title: "Entrepreneurship", description: "Entrepreneurial stories and business innovation." },
  "startup": { title: "Startup", description: "African startup ecosystem and venture capital." },
  "markets": { title: "Markets", description: "Stock markets, commodities, and trading." },
  "banking-finance": { title: "Banking & Finance", description: "Banking, fintech, and financial services." },
  "energy": { title: "Energy", description: "Oil, gas, renewables, and energy policy." },
  "tech": { title: "Tech", description: "Technology news and product launches." },
  "ai-data": { title: "AI & Data", description: "Artificial intelligence and data science." },
  "space": { title: "Space", description: "Space exploration and satellite technology." },
  "green-tech": { title: "Green Tech", description: "Clean technology and sustainable innovation." },
  "education": { title: "Education", description: "Education policy, schools, and learning." },
  "careers": { title: "Careers", description: "Career development and opportunities." },
  "social-impact": { title: "Social Impact", description: "Youth-led social change and activism." },
  "music": { title: "Music", description: "African music, artists, and the music industry." },
  "film-tv": { title: "Film & TV", description: "Nollywood, streaming, and television." },
  "arts": { title: "Arts", description: "Visual arts, theatre, and creative expression." },
  "books-lit": { title: "Books & Literature", description: "Literature, publishing, and literary events." },
  "fashion": { title: "Fashion", description: "African fashion, designers, and style." },
  "food": { title: "Food", description: "African cuisine, food culture, and dining." },
  "health-wellness": { title: "Health & Wellness", description: "Health, fitness, and mental wellness." },
  "destinations": { title: "Destinations", description: "Travel destinations and guides." },
  "aviation": { title: "Aviation", description: "Air travel, airlines, and aviation industry." },
  "special-reports": { title: "Special Reports", description: "In-depth special reports and investigations." },
  "sponsored": { title: "Sponsored Articles", description: "Sponsored content and partnerships." },
  "opinion-analysis": { title: "Opinion & Analysis", description: "Commentary and in-depth analysis." },
  "videos": { title: "Videos", description: "Video reports and visual journalism." },
  "podcasts": { title: "Podcasts", description: "Audio stories and podcast series." },
  "documentaries": { title: "Documentaries", description: "Documentary films and long-form video." },
  "politics": { title: "Politics", description: "Political news, policy, and governance across Africa." },
};

interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params;
  const lastSlug = slug[slug.length - 1];

  if (!VALID_SLUGS.has(lastSlug)) {
    notFound();
  }

  const info = SLUG_LABELS[lastSlug] ?? {
    title: lastSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: `Latest articles and stories about ${lastSlug.replace(/-/g, " ")}.`,
  };

  return (
    <SubcategoryPage
      title={info.title}
      description={info.description}
      categorySlug={lastSlug}
    />
  );
}
