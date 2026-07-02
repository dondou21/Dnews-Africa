export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  authorName: string;
  authorRole: string;
  publishedAt: string;
  readTime: string;
  isFeatured: boolean;
  isTrending: boolean;
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "au-summit-cross-border-digital-infrastructure",
    title: "AU Summit reaches landmark agreement on cross-border digital infrastructure",
    excerpt:
      "African Union heads of state have endorsed a historic framework to harmonize digital policies across member nations, aiming to connect the continent's unconnected and boost intra-African trade through seamless data flows.",
    content: `The African Union has achieved a breakthrough in continental digital integration, with heads of state from 54 member nations signing the landmark Digital Africa Framework at the conclusion of the 38th AU Summit in Addis Ababa.

The agreement establishes a unified regulatory framework for cross-border data flows, digital payments, and telecommunications infrastructure across the continent. It is expected to reduce the cost of digital services by up to 40 percent within five years.

"This is not just about technology. It is about economic sovereignty and the right of every African to participate in the digital economy," said AU Commission Chairperson during the signing ceremony.

Key provisions of the framework include mutual recognition of digital identities, harmonised data protection standards, and a commitment to invest $100 billion in broadband infrastructure by 2030. The agreement also establishes the African Digital Single Market, which will allow startups and businesses to operate seamlessly across borders.

Industry leaders have welcomed the move. "This is the single most important policy decision for African tech since the establishment of the African Continental Free Trade Area," said the founder of a major African tech incubator.

Implementation will begin in January 2027, with pilot programmes launching in five member states including Kenya, Ghana, and Rwanda. The AU estimates the digital economy could contribute $712 billion to Africa's GDP by 2030 if the framework is fully implemented.`,
    category: "Featured · News",
    authorName: "Kwame Asante",
    authorRole: "Senior Political Correspondent",
    publishedAt: "June 29, 2026",
    readTime: "6 min read",
    isFeatured: true,
    isTrending: true,
  },
  {
    id: "2",
    slug: "kenyan-fintech-45m-mobile-banking-francophone-africa",
    title: "Kenyan fintech startup raises $45M to expand mobile banking across Francophone Africa",
    excerpt:
      "The Series B round, led by a pan-African venture capital firm, will fund the company's expansion into five French-speaking African nations over the next 18 months.",
    content: `A Nairobi-based fintech startup has closed a $45 million Series B funding round to bring its mobile banking platform to millions of unbanked users across Francophone Africa.

The round was led by PanAfric Capital, with participation from existing investors including TechVentures Africa and Global Impact Fund. The company plans to use the capital to launch operations in Senegal, Ivory Coast, Cameroon, Burkina Faso, and Mali by early 2028.

Founded in 2021, the startup has grown to serve over 2 million customers in Kenya, Uganda, and Tanzania. Its platform offers savings accounts, microloans, and remittance services entirely through mobile phones, without requiring a traditional bank account.

"Francophone Africa represents a massive underserved market. Over 80 percent of adults in the region lack access to formal banking services," said the company's CEO. "Our technology is ready, and this funding will help us bridge that gap."

The expansion comes as mobile money adoption continues to surge across Africa. According to the GSMA, the continent's mobile money transaction value exceeded $900 billion in 2025, with Francophone countries showing the fastest growth rates.

The startup plans to hire 200 local staff across its new markets and establish regional headquarters in Abidjan, Ivory Coast.`,
    category: "Business · Innovation",
    authorName: "Amina Diallo",
    authorRole: "Business Editor",
    publishedAt: "June 29, 2026",
    readTime: "4 min read",
    isFeatured: false,
    isTrending: true,
  },
  {
    id: "3",
    slug: "senegal-afcon-quarterfinal-penalty-shootout",
    title: "Senegal secures AFCON quarterfinal spot after dramatic penalty shootout victory",
    excerpt:
      "The Teranga Lions advanced to the last eight after a tense 4-2 penalty shootout win over Cameroon following a 1-1 draw in regulation time.",
    content: `Senegal booked their place in the Africa Cup of Nations quarterfinals after a dramatic penalty shootout victory over Cameroon at the Stade Olympique in Yaoundé.

The match ended 1-1 after 120 minutes of gripping action, with Senegal's star forward scoring a stunning equaliser in the 78th minute after Cameroon had taken an early lead through a well-worked set piece.

In the shootout, Senegal's goalkeeper emerged as the hero, saving two penalties to send his side through 4-2. The victory sets up a quarterfinal clash against Morocco, who earlier defeated Burkina Faso.

"It was a game of character. The players showed incredible resilience after going behind," said Senegal's head coach. "We know the quarterfinal will be even tougher, but this team believes in itself."

Senegal, who won their first AFCON title in 2022, are seeking to become the first team since Egypt (2006-2010) to win back-to-back titles. The quarterfinal against Morocco is expected to draw a record television audience across the continent.`,
    category: "Sports",
    authorName: "Chukwudi Okonkwo",
    authorRole: "Sports Correspondent",
    publishedAt: "June 28, 2026",
    readTime: "3 min read",
    isFeatured: false,
    isTrending: true,
  },
  {
    id: "4",
    slug: "nigeria-five-year-plan-commercial-satellite-network",
    title: "Nigeria unveils ambitious five-year plan to develop Africa's first commercial satellite network",
    excerpt:
      "The Nigerian Space Agency has announced a $2.5 billion initiative to launch a constellation of 25 satellites providing broadband, earth observation, and navigation services across the continent.",
    content: `Nigeria has announced plans to build and launch Africa's first commercial satellite network, a $2.5 billion project that aims to close the continent's digital divide and create a homegrown space industry.

The Nigerian Space Agency (NASPA) unveiled the five-year plan on Tuesday, detailing a constellation of 25 Low Earth Orbit satellites that will provide broadband internet, agricultural monitoring, and navigation services across Africa.

"Space technology is no longer a luxury. It is a necessity for development," said the Director General of NASPA. "This network will bring high-speed internet to rural communities, help farmers monitor crops, and provide critical data for climate adaptation."

The project, named NaijaSat, will be developed in partnership with several international space agencies and private sector partners. Nigeria plans to train over 500 aerospace engineers as part of the initiative, establishing the country as a hub for space technology in Africa.

The first satellite is expected to launch in 2027, with the full constellation operational by 2031. The project is expected to create over 10,000 jobs in the Nigerian space sector.`,
    category: "News",
    authorName: "Fatima Mohammed",
    authorRole: "Technology Correspondent",
    publishedAt: "June 28, 2026",
    readTime: "5 min read",
    isFeatured: false,
    isTrending: false,
  },
  {
    id: "5",
    slug: "lagos-literary-festival-african-storytelling-global",
    title: "Lagos literary festival draws thousands as African storytelling goes global",
    excerpt:
      "The annual Lagos Literary Festival attracted over 15,000 attendees this year, featuring authors from 30 countries and highlighting the growing international demand for African literature.",
    content: `The Lagos Literary Festival concluded its most successful edition yet, drawing over 15,000 attendees and featuring more than 100 authors, poets, and storytellers from across Africa and the diaspora.

The four-day event, held at various venues across Lagos, included panel discussions, book signings, poetry slams, and workshops. This year's theme, "African Stories for the World," reflected the growing global appetite for African literature.

"African writers are no longer just writing for African audiences. Our stories are being read in New York, London, and Tokyo," said the festival's director. "This is a golden age for African literature."

The festival featured several high-profile launches, including a new novel by a Nobel Prize-winning African author and the English translation of a bestselling work from Cameroon. International publishers reported record sales of African literature at the festival's book fair.

The event also highlighted the role of digital platforms in promoting African stories. Several sessions focused on how social media and streaming services are creating new opportunities for African content creators.`,
    category: "Culture",
    authorName: "Efe Johnson",
    authorRole: "Arts & Culture Editor",
    publishedAt: "June 27, 2026",
    readTime: "4 min read",
    isFeatured: false,
    isTrending: false,
  },
  {
    id: "6",
    slug: "inside-ghanas-film-industry-challenging-nollywood",
    title: "Inside Ghana's booming film industry: How local creators are challenging Nollywood",
    excerpt:
      "Ghana's film sector is experiencing unprecedented growth, with streaming platforms investing millions in local content and a new generation of filmmakers gaining international recognition.",
    content: `Ghana's film industry is experiencing a renaissance, with a new generation of filmmakers and streaming investment propelling the sector onto the global stage and challenging Nigeria's dominance of African cinema.

The past two years have seen over $50 million in streaming platform investments in Ghanaian content, with Netflix, Amazon Prime, and Showmax all commissioning original series and films from Ghanaian creators.

"Ghanaian storytelling has a distinct voice. We are seeing a wave of directors who are unafraid to tell authentic stories that resonate both locally and globally," said a film producer based in Accra.

The industry has created an estimated 50,000 jobs, from actors and directors to technicians and distributors. New film schools have opened in Accra and Kumasi, training the next generation of filmmakers.

Ghanaian films have also found success on the international festival circuit, with several titles winning awards at Cannes, Berlinale, and the Toronto International Film Festival in recent years.

The government has supported the growth with tax incentives for film production and investment in studio infrastructure, including the development of a new film village on the outskirts of Accra.`,
    category: "Video · DnewsAfrica TV",
    authorName: "Nana Yaa Ofori",
    authorRole: "Entertainment Correspondent",
    publishedAt: "June 27, 2026",
    readTime: "8 min watch",
    isFeatured: false,
    isTrending: true,
  },
  {
    id: "7",
    slug: "climate-activists-under-25-africa-grassroots-environmental-movements",
    title: "Climate activists under 25: The young Africans leading grassroots environmental movements",
    excerpt:
      "From Lagos to Nairobi, a new generation of young climate activists is driving grassroots environmental movements across Africa, combining digital organizing with on-the-ground action.",
    content: `Across Africa, a generation of climate activists under the age of 25 is leading grassroots environmental movements that are reshaping the continent's approach to climate action.

From plastic waste cleanups in Lagos to tree-planting campaigns in Nairobi and solar energy cooperatives in Johannesburg, young Africans are taking climate action into their own hands.

"I started my environmental club when I was 14. Now, three years later, we have planted over 10,000 trees and organized recycling programmes in 20 schools across my city," said a 17-year-old activist from Ghana.

The movement is powered by social media, with young activists using platforms like TikTok, Instagram, and WhatsApp to organize, educate, and mobilize their peers. The hashtag #ClimateActionAfrica has been viewed over 500 million times on TikTok.

"We don't have the luxury to wait for governments to act. Climate change is affecting our communities right now, and we are the ones who will bear the consequences," said a 22-year-old climate organizer from Kenya.

The activists are also demanding accountability from policymakers. Several youth-led organizations have filed legal challenges against government projects they say violate environmental regulations.`,
    category: "Youth",
    authorName: "Grace Wanjiku",
    authorRole: "Youth & Environment Correspondent",
    publishedAt: "June 26, 2026",
    readTime: "6 min read",
    isFeatured: false,
    isTrending: false,
  },
  {
    id: "8",
    slug: "ethiopia-first-stock-exchange-east-africa",
    title: "Ethiopia launches first stock exchange in East Africa",
    excerpt:
      "The Ethiopian Securities Exchange began trading this week, marking a historic milestone for the country's economic liberalization and providing a new capital market for East African investors.",
    content: `Ethiopia opened its first stock exchange on Monday, a landmark moment in the country's economic reform programme and a significant addition to Africa's capital markets infrastructure.

The Ethiopian Securities Exchange (ESX) began trading with eight listed companies, including state-owned enterprises that have been partially privatized as part of the government's economic liberalization strategy.

"We are writing a new chapter in Ethiopia's economic history," said the CEO of the ESX. "This exchange will provide Ethiopian companies with access to capital, create investment opportunities for citizens, and signal to the world that Ethiopia is open for business."

The exchange has attracted significant interest from international investors, with several global asset managers registering as foreign portfolio investors. The government has announced plans to list an additional 15 companies within the next year.

Analysts say the exchange could transform Ethiopia's economy by providing a formal mechanism for capital formation and wealth creation. The country has one of the fastest-growing economies in Africa but has lacked deep capital markets.`,
    category: "Business",
    authorName: "Mekonnen Tesfaye",
    authorRole: "Finance Correspondent",
    publishedAt: "June 25, 2026",
    readTime: "4 min read",
    isFeatured: false,
    isTrending: true,
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getFeaturedArticle(): Article | undefined {
  return articles.find((a) => a.isFeatured);
}

export function getTrendingArticles(): Article[] {
  return articles.filter((a) => a.isTrending);
}

export function getLatestArticles(count?: number): Article[] {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
  return count ? sorted.slice(0, count) : sorted;
}

export function getRelatedArticles(
  current: Article,
  count = 3
): Article[] {
  return articles
    .filter((a) => a.id !== current.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}
