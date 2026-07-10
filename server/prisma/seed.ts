import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "Admin", description: "Full system access" },
    { name: "Editor", description: "Can publish and manage content" },
    { name: "Journalist", description: "Can create and edit own articles" },
    { name: "Moderator", description: "Can moderate comments and content" },
  ];

  const createdRoles: Record<string, number> = {};

  for (const role of roles) {
    const result = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    createdRoles[role.name] = result.id;
  }

  const categories = [
    { name: "Top Stories", slug: "top-stories", description: "Leading news stories and headlines" },
    { name: "Sports", slug: "sports", description: "African sports coverage including AFCON and athletics" },
    { name: "Business", slug: "business", description: "Business news, finance, and economic developments" },
    { name: "Innovation", slug: "innovation", description: "Technology and innovation across Africa" },
    { name: "Youth", slug: "youth", description: "Stories amplifying young African voices" },
    { name: "Culture", slug: "culture", description: "Arts, music, film, and cultural movements" },
    { name: "Travel", slug: "travel", description: "Travel destinations and experiences" },
    { name: "Lifestyle", slug: "lifestyle", description: "Fashion, food, wellness, and lifestyle trends" },
    { name: "Interviews", slug: "interviews", description: "Exclusive conversations with changemakers" },
    { name: "Opinion & Analysis", slug: "opinion-analysis", description: "Commentary and in-depth analysis" },
  ];

  const createdCategories: Record<string, number> = {};

  for (const category of categories) {
    const result = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
    createdCategories[category.slug] = result.id;
  }

  const testUsers = [
    { firstName: "Admin", lastName: "User", email: "admin@dnewsafrica.com", password: "Admin@12345", role: "Admin" },
    { firstName: "Editor", lastName: "User", email: "editor@dnewsafrica.com", password: "Editor@12345", role: "Editor" },
    { firstName: "Journalist", lastName: "User", email: "journalist@dnewsafrica.com", password: "Journalist@12345", role: "Journalist" },
    { firstName: "Moderator", lastName: "User", email: "moderator@dnewsafrica.com", password: "Moderator@12345", role: "Moderator" },
  ];

  const createdUserIds: Record<string, string> = {};

  for (const u of testUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 12);
      const user = await prisma.user.create({
        data: {
          email: u.email,
          passwordHash,
          firstName: u.firstName,
          lastName: u.lastName,
          roleId: createdRoles[u.role],
          isActive: true,
        },
      });
      createdUserIds[u.role] = user.id;
    } else {
      createdUserIds[u.role] = existing.id;
    }
  }

  const adminId = createdUserIds["Admin"];
  const editorId = createdUserIds["Editor"];

  const demoArticles = [
    {
      title: "AU Summit reaches landmark agreement on cross-border digital infrastructure",
      slug: "au-summit-cross-border-digital-infrastructure",
      summary: "African Union heads of state have endorsed a historic framework to harmonize digital policies across member nations, aiming to connect the continent's unconnected and boost intra-African trade through seamless data flows.",
      content: `The African Union has achieved a breakthrough in continental digital integration, with heads of state from 54 member nations signing the landmark Digital Africa Framework at the conclusion of the 38th AU Summit in Addis Ababa.

The agreement establishes a unified regulatory framework for cross-border data flows, digital payments, and telecommunications infrastructure across the continent. It is expected to reduce the cost of digital services by up to 40 percent within five years.

"This is not just about technology. It is about economic sovereignty and the right of every African to participate in the digital economy," said AU Commission Chairperson during the signing ceremony.

Key provisions of the framework include mutual recognition of digital identities, harmonised data protection standards, and a commitment to invest $100 billion in broadband infrastructure by 2030. The agreement also establishes the African Digital Single Market, which will allow startups and businesses to operate seamlessly across borders.

Industry leaders have welcomed the move. "This is the single most important policy decision for African tech since the establishment of the African Continental Free Trade Area," said the founder of a major African tech incubator.

Implementation will begin in January 2027, with pilot programmes launching in five member states including Kenya, Ghana, and Rwanda. The AU estimates the digital economy could contribute $712 billion to Africa's GDP by 2030 if the framework is fully implemented.`,
      coverImageUrl: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&q=80",
      coverImageAlt: "African Union delegates at a diplomatic summit meeting",
      categorySlug: "top-stories",
      authorId: editorId,
      status: "PUBLISHED" as const,
      isFeatured: true,
      isTrending: true,
      publishedAt: new Date("2026-06-29"),
    },
    {
      title: "Kenyan fintech startup raises $45M to expand mobile banking across Francophone Africa",
      slug: "kenyan-fintech-45m-mobile-banking-francophone-africa",
      summary: "The Series B round, led by a pan-African venture capital firm, will fund the company's expansion into five French-speaking African nations over the next 18 months.",
      content: `A Nairobi-based fintech startup has closed a $45 million Series B funding round to bring its mobile banking platform to millions of unbanked users across Francophone Africa.

The round was led by PanAfric Capital, with participation from existing investors including TechVentures Africa and Global Impact Fund. The company plans to use the capital to launch operations in Senegal, Ivory Coast, Cameroon, Burkina Faso, and Mali by early 2028.

Founded in 2021, the startup has grown to serve over 2 million customers in Kenya, Uganda, and Tanzania. Its platform offers savings accounts, microloans, and remittance services entirely through mobile phones, without requiring a traditional bank account.

"Francophone Africa represents a massive underserved market. Over 80 percent of adults in the region lack access to formal banking services," said the company's CEO. "Our technology is ready, and this funding will help us bridge that gap."

The expansion comes as mobile money adoption continues to surge across Africa. According to the GSMA, the continent's mobile money transaction value exceeded $900 billion in 2025, with Francophone countries showing the fastest growth rates.

The startup plans to hire 200 local staff across its new markets and establish regional headquarters in Abidjan, Ivory Coast.`,
      coverImageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
      coverImageAlt: "Mobile payment terminal and smartphone representing digital finance",
      categorySlug: "business",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: true,
      publishedAt: new Date("2026-06-29"),
    },
    {
      title: "Senegal secures AFCON quarterfinal spot after dramatic penalty shootout victory",
      slug: "senegal-afcon-quarterfinal-penalty-shootout",
      summary: "The Teranga Lions advanced to the last eight after a tense 4-2 penalty shootout win over Cameroon following a 1-1 draw in regulation time.",
      content: `Senegal booked their place in the Africa Cup of Nations quarterfinals after a dramatic penalty shootout victory over Cameroon at the Stade Olympique in Yaoundé.

The match ended 1-1 after 120 minutes of gripping action, with Senegal's star forward scoring a stunning equaliser in the 78th minute after Cameroon had taken an early lead through a well-worked set piece.

In the shootout, Senegal's goalkeeper emerged as the hero, saving two penalties to send his side through 4-2. The victory sets up a quarterfinal clash against Morocco, who earlier defeated Burkina Faso.

"It was a game of character. The players showed incredible resilience after going behind," said Senegal's head coach. "We know the quarterfinal will be even tougher, but this team believes in itself."

Senegal, who won their first AFCON title in 2022, are seeking to become the first team since Egypt (2006-2010) to win back-to-back titles. The quarterfinal against Morocco is expected to draw a record television audience across the continent.`,
      coverImageUrl: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&q=80",
      coverImageAlt: "Football players competing during a match on a stadium field",
      categorySlug: "sports",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: true,
      publishedAt: new Date("2026-06-28"),
    },
    {
      title: "Nigeria unveils ambitious five-year plan to develop Africa's first commercial satellite network",
      slug: "nigeria-five-year-plan-commercial-satellite-network",
      summary: "The Nigerian Space Agency has announced a $2.5 billion initiative to launch a constellation of 25 satellites providing broadband, earth observation, and navigation services across the continent.",
      content: `Nigeria has announced plans to build and launch Africa's first commercial satellite network, a $2.5 billion project that aims to close the continent's digital divide and create a homegrown space industry.

The Nigerian Space Agency (NASPA) unveiled the five-year plan on Tuesday, detailing a constellation of 25 Low Earth Orbit satellites that will provide broadband internet, agricultural monitoring, and navigation services across Africa.

"Space technology is no longer a luxury. It is a necessity for development," said the Director General of NASPA. "This network will bring high-speed internet to rural communities, help farmers monitor crops, and provide critical data for climate adaptation."

The project, named NaijaSat, will be developed in partnership with several international space agencies and private sector partners. Nigeria plans to train over 500 aerospace engineers as part of the initiative, establishing the country as a hub for space technology in Africa.

The first satellite is expected to launch in 2027, with the full constellation operational by 2031. The project is expected to create over 10,000 jobs in the Nigerian space sector.`,
      coverImageUrl: "https://images.unsplash.com/photo-1451186859696-371d9477be93?w=1200&q=80",
      coverImageAlt: "Global network and technology visualization representing satellite communications",
      categorySlug: "innovation",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: false,
      publishedAt: new Date("2026-06-28"),
    },
    {
      title: "Lagos literary festival draws thousands as African storytelling goes global",
      slug: "lagos-literary-festival-african-storytelling-global",
      summary: "The annual Lagos Literary Festival attracted over 15,000 attendees this year, featuring authors from 30 countries and highlighting the growing international demand for African literature.",
      content: `The Lagos Literary Festival concluded its most successful edition yet, drawing over 15,000 attendees and featuring more than 100 authors, poets, and storytellers from across Africa and the diaspora.

The four-day event, held at various venues across Lagos, included panel discussions, book signings, poetry slams, and workshops. This year's theme, "African Stories for the World," reflected the growing global appetite for African literature.

"African writers are no longer just writing for African audiences. Our stories are being read in New York, London, and Tokyo," said the festival's director. "This is a golden age for African literature."

The festival featured several high-profile launches, including a new novel by a Nobel Prize-winning African author and the English translation of a bestselling work from Cameroon. International publishers reported record sales of African literature at the festival's book fair.

The event also highlighted the role of digital platforms in promoting African stories. Several sessions focused on how social media and streaming services are creating new opportunities for African content creators.`,
      coverImageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&q=80",
      coverImageAlt: "Rows of books on library shelves representing literature and storytelling",
      categorySlug: "culture",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: false,
      publishedAt: new Date("2026-06-27"),
    },
    {
      title: "Inside Ghana's booming film industry: How local creators are challenging Nollywood",
      slug: "inside-ghanas-film-industry-challenging-nollywood",
      summary: "Ghana's film sector is experiencing unprecedented growth, with streaming platforms investing millions in local content and a new generation of filmmakers gaining international recognition.",
      content: `Ghana's film industry is experiencing a renaissance, with a new generation of filmmakers and streaming investment propelling the sector onto the global stage and challenging Nigeria's dominance of African cinema.

The past two years have seen over $50 million in streaming platform investments in Ghanaian content, with Netflix, Amazon Prime, and Showmax all commissioning original series and films from Ghanaian creators.

"Ghanaian storytelling has a distinct voice. We are seeing a wave of directors who are unafraid to tell authentic stories that resonate both locally and globally," said a film producer based in Accra.

The industry has created an estimated 50,000 jobs, from actors and directors to technicians and distributors. New film schools have opened in Accra and Kumasi, training the next generation of filmmakers.

Ghanaian films have also found success on the international festival circuit, with several titles winning awards at Cannes, Berlinale, and the Toronto International Film Festival in recent years.

The government has supported the growth with tax incentives for film production and investment in studio infrastructure, including the development of a new film village on the outskirts of Accra.`,
      coverImageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80",
      coverImageAlt: "Movie projector illuminating a cinema screen representing film industry",
      categorySlug: "culture",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: true,
      publishedAt: new Date("2026-06-27"),
    },
    {
      title: "Climate activists under 25: The young Africans leading grassroots environmental movements",
      slug: "climate-activists-under-25-africa-grassroots-environmental-movements",
      summary: "From Lagos to Nairobi, a new generation of young climate activists is driving grassroots environmental movements across Africa, combining digital organizing with on-the-ground action.",
      content: `Across Africa, a generation of climate activists under the age of 25 is leading grassroots environmental movements that are reshaping the continent's approach to climate action.

From plastic waste cleanups in Lagos to tree-planting campaigns in Nairobi and solar energy cooperatives in Johannesburg, young Africans are taking climate action into their own hands.

"I started my environmental club when I was 14. Now, three years later, we have planted over 10,000 trees and organized recycling programmes in 20 schools across my city," said a 17-year-old activist from Ghana.

The movement is powered by social media, with young activists using platforms like TikTok, Instagram, and WhatsApp to organize, educate, and mobilize their peers. The hashtag #ClimateActionAfrica has been viewed over 500 million times on TikTok.

"We don't have the luxury to wait for governments to act. Climate change is affecting our communities right now, and we are the ones who will bear the consequences," said a 22-year-old climate organizer from Kenya.

The activists are also demanding accountability from policymakers. Several youth-led organizations have filed legal challenges against government projects they say violate environmental regulations.`,
      coverImageUrl: "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&q=80",
      coverImageAlt: "Sunlight streaming through a dense forest representing climate and environment",
      categorySlug: "youth",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: false,
      publishedAt: new Date("2026-06-26"),
    },
    {
      title: "Ethiopia launches first stock exchange in East Africa",
      slug: "ethiopia-first-stock-exchange-east-africa",
      summary: "The Ethiopian Securities Exchange began trading this week, marking a historic milestone for the country's economic liberalization and providing a new capital market for East African investors.",
      content: `Ethiopia opened its first stock exchange on Monday, a landmark moment in the country's economic reform programme and a significant addition to Africa's capital markets infrastructure.

The Ethiopian Securities Exchange (ESX) began trading with eight listed companies, including state-owned enterprises that have been partially privatized as part of the government's economic liberalization strategy.

"We are writing a new chapter in Ethiopia's economic history," said the CEO of the ESX. "This exchange will provide Ethiopian companies with access to capital, create investment opportunities for citizens, and signal to the world that Ethiopia is open for business."

The exchange has attracted significant interest from international investors, with several global asset managers registering as foreign portfolio investors. The government has announced plans to list an additional 15 companies within the next year.

Analysts say the exchange could transform Ethiopia's economy by providing a formal mechanism for capital formation and wealth creation. The country has one of the fastest-growing economies in Africa but has lacked deep capital markets.`,
      coverImageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",
      coverImageAlt: "Stock market display showing trading data representing financial exchange",
      categorySlug: "business",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: true,
      publishedAt: new Date("2026-06-25"),
    },
    {
      title: "Morocco's high-speed rail network expands to Marrakech, boosting tourism and trade",
      slug: "morocco-high-speed-rail-marrakech-tourism-trade",
      summary: "Morocco's ONCF has launched high-speed rail service connecting Casablanca to Marrakech, cutting travel time in half and strengthening economic ties between the country's two largest cities.",
      content: `Morocco's national railway operator ONCF launched high-speed rail service between Casablanca and Marrakech on Monday, extending the African continent's first bullet train network and slashing travel time between the two cities from three hours to just over 90 minutes.

The expansion of the Al Boraq service, which originally launched in 2018 connecting Casablanca to Tangier, represents a $2 billion investment in Moroccan infrastructure. The new line is expected to carry 3 million passengers annually by 2028.

"High-speed rail is transforming how Moroccans live, work, and travel," said the CEO of ONCF. "This connection between our economic capital and tourism hub will create new opportunities for businesses and make Morocco more competitive globally."

The extended line passes through some of Morocco's most productive agricultural regions, and officials expect the service to boost both tourism and agricultural exports. Hotel bookings in Marrakech have already increased 15 percent since the service was announced.

Morocco's rail modernization programme has positioned the country as a leader in African transportation infrastructure. The government has announced plans to eventually extend the network to link with other North African countries.`,
      coverImageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80",
      coverImageAlt: "High-speed train travelling through a landscape",
      categorySlug: "travel",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: false,
      publishedAt: new Date("2026-06-24"),
    },
    {
      title: "The rise of Afro-minimalism: How African designers are redefining contemporary fashion",
      slug: "rise-of-afro-minimalism-african-designers-fashion",
      summary: "A new generation of African fashion designers is embracing minimalism, blending traditional craftsmanship with clean lines to create a distinctly modern aesthetic that is gaining global recognition.",
      content: `A quiet revolution is taking place in African fashion. While bold prints and vibrant colours have long defined the continent's style identity, a growing number of designers are embracing minimalism, creating pieces that speak to a new generation of consumers.

Afro-minimalism, as it has been dubbed, combines the precision of Scandinavian design with African textile traditions. The result is clothing that is both contemporary and deeply rooted in heritage.

"We are moving beyond the idea that African fashion has to be loud to be authentic," said a Lagos-based designer whose collections have been featured at Paris Fashion Week. "Minimalism allows the craftsmanship and the quality of our materials to speak for themselves."

The movement has been driven by a younger demographic of consumers who are increasingly conscious of sustainability and versatility. These consumers want pieces that can transition from the office to social events, reflecting the fast pace of modern African urban life.

International fashion houses have taken notice, with several European brands collaborating with African minimalist designers. The aesthetic has also found a strong following on social media, where the hashtag #AfroMinimalism has garnered millions of views.`,
      coverImageUrl: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
      coverImageAlt: "Fashionable clothing on display representing modern African design",
      categorySlug: "lifestyle",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: false,
      publishedAt: new Date("2026-06-23"),
    },
    {
      title: "Exclusive interview: Dr. Akinwumi Adesina on Africa's agricultural transformation and food sovereignty",
      slug: "interview-akinwumi-adesina-agricultural-transformation-food-sovereignty",
      summary: "The President of the African Development Bank shares his vision for ending hunger on the continent, the role of technology in farming, and why African agriculture is the world's next big investment opportunity.",
      content: `Dr. Akinwumi Adesina, President of the African Development Bank, has long been one of the continent's most vocal advocates for agricultural transformation. In this exclusive interview with Dnews Africa, he discusses the challenges and opportunities facing African farmers.

"For too long, Africa has been importing food that it should be producing. That is not just an economic issue; it is a matter of sovereignty," Adesina says. "We have 65 percent of the world's uncultivated arable land. There is no reason we cannot feed ourselves and the world."

Under Adesina's leadership, the AfDB has invested over $10 billion in agricultural projects across the continent, focusing on irrigation, access to credit for smallholder farmers, and the adoption of climate-resilient crop varieties.

"The future of African agriculture is digital. We are seeing young entrepreneurs developing apps that help farmers access weather information, market prices, and veterinary services. This is the kind of innovation we need to scale."

Adesina also highlighted the importance of processing agricultural products locally rather than exporting raw materials. "We cannot continue to export raw cocoa and import chocolate. Value addition must happen here, on the continent, creating jobs and wealth for our people."`,
      coverImageUrl: "https://images.unsplash.com/photo-1577962917302-c3f0f8e3de4c?w=1200&q=80",
      coverImageAlt: "Agricultural landscape with crops representing African farming",
      categorySlug: "interviews",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: false,
      publishedAt: new Date("2026-06-22"),
    },
    {
      title: "Why Africa must own its data: The case for continental data sovereignty",
      slug: "africa-data-sovereignty-digital-economy",
      summary: "As Africa's digital economy grows, experts argue that data sovereignty is critical to ensuring the continent benefits from its own digital transformation rather than being a source of raw data for foreign tech giants.",
      content: `The digital economy is projected to contribute over $700 billion to Africa's GDP by 2030, but a growing chorus of policymakers, technologists, and civil society leaders is asking a difficult question: who owns Africa's data?

Data sovereignty, the concept that data should be subject to the laws and governance structures of the country where it is collected, has become a central issue in Africa's digital transformation debate.

"When African users generate data on foreign platforms, that data leaves the continent, and so does the value it creates," says a professor of digital economics at the University of Nairobi. "We are effectively exporting our digital raw materials and importing finished digital products."

Several African countries have enacted data protection laws in recent years, but enforcement remains inconsistent. The African Union's Digital Africa Framework aims to harmonize these regulations across the continent.

"We need a unified approach to data governance that protects the rights of African citizens while still enabling innovation," said a digital rights activist. "The European Union's GDPR showed that strong data protection can coexist with a thriving digital economy."

The debate comes as major tech companies increase their investment in African markets, building data centres and expanding services across the continent.`,
      coverImageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80",
      coverImageAlt: "Data centre server racks representing digital infrastructure",
      categorySlug: "opinion-analysis",
      authorId: adminId,
      status: "PUBLISHED" as const,
      isFeatured: false,
      isTrending: false,
      publishedAt: new Date("2026-06-21"),
    },
  ];

  for (const article of demoArticles) {
    const existing = await prisma.article.findUnique({ where: { slug: article.slug } });
    if (!existing) {
      await prisma.article.create({
        data: {
          title: article.title,
          slug: article.slug,
          summary: article.summary,
          content: article.content,
          coverImageUrl: article.coverImageUrl,
          coverImageAlt: article.coverImageAlt,
          categoryId: createdCategories[article.categorySlug],
          authorId: article.authorId,
          status: article.status,
          isFeatured: article.isFeatured,
          isTrending: article.isTrending,
          publishedAt: article.publishedAt,
        },
      });
    }
  }

  console.log("\n=== Dnews Africa Development Credentials ===\n");
  console.log("  Admin      | admin@dnewsafrica.com    | Admin@12345");
  console.log("  Editor     | editor@dnewsafrica.com   | Editor@12345");
  console.log("  Journalist | journalist@dnewsafrica.com| Journalist@12345");
  console.log("  Moderator  | moderator@dnewsafrica.com | Moderator@12345");
  console.log("\n==========================================\n");

  const articleCount = await prisma.article.count();
  console.log(`Seeded ${articleCount} articles`);
  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
