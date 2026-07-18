-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('DESKTOP', 'TABLET', 'MOBILE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TrafficSourceType" AS ENUM ('DIRECT', 'GOOGLE_SEARCH', 'GOOGLE_DISCOVER', 'GOOGLE_NEWS', 'FACEBOOK', 'TWITTER', 'LINKEDIN', 'WHATSAPP', 'NEWSLETTER', 'REFERRAL', 'INTERNAL', 'OTHER');

-- CreateTable
CREATE TABLE "visitor_sessions" (
    "id" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "isBounced" BOOLEAN NOT NULL DEFAULT false,
    "isReturning" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "timezone" TEXT,
    "language" TEXT,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "deviceModel" TEXT,
    "screenWidth" INTEGER,
    "screenHeight" INTEGER,
    "trafficSource" "TrafficSourceType" NOT NULL DEFAULT 'DIRECT',
    "referrer" TEXT,
    "referrerUrl" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_views" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "referrer" TEXT,
    "referrerUrl" TEXT,
    "timeOnPage" INTEGER,
    "scrollDepth" INTEGER,
    "isExit" BOOLEAN NOT NULL DEFAULT false,
    "isBounce" BOOLEAN NOT NULL DEFAULT false,
    "entityType" TEXT,
    "entityId" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "language" TEXT,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "browser" TEXT,
    "os" TEXT,
    "trafficSource" "TrafficSourceType" NOT NULL DEFAULT 'DIRECT',
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_views" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "referrer" TEXT,
    "timeOnPage" INTEGER,
    "scrollDepth" INTEGER,
    "completionRate" DOUBLE PRECISION,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "trafficSource" "TrafficSourceType" NOT NULL DEFAULT 'DIRECT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reader_events" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventData" JSONB,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "pageViewId" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "value" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reader_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_queries" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "normalized" TEXT NOT NULL,
    "resultsCount" INTEGER NOT NULL DEFAULT 0,
    "noResults" BOOLEAN NOT NULL DEFAULT false,
    "sessionId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "avgTimeOnPage" DOUBLE PRECISION,
    "bounceRate" DOUBLE PRECISION,
    "avgScrollDepth" DOUBLE PRECISION,
    "directViews" INTEGER NOT NULL DEFAULT 0,
    "googleSearch" INTEGER NOT NULL DEFAULT 0,
    "googleDiscover" INTEGER NOT NULL DEFAULT 0,
    "googleNews" INTEGER NOT NULL DEFAULT 0,
    "socialViews" INTEGER NOT NULL DEFAULT 0,
    "newsletterViews" INTEGER NOT NULL DEFAULT 0,
    "referralViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_snapshots" (
    "id" TEXT NOT NULL,
    "snapshotType" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalPageViews" INTEGER NOT NULL DEFAULT 0,
    "totalVisitors" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "activeReaders" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDuration" DOUBLE PRECISION,
    "bounceRate" DOUBLE PRECISION,
    "pagesPerSession" DOUBLE PRECISION,
    "returningVisitors" INTEGER NOT NULL DEFAULT 0,
    "totalArticles" INTEGER NOT NULL DEFAULT 0,
    "totalNewsletters" INTEGER NOT NULL DEFAULT 0,
    "totalSubscribers" INTEGER NOT NULL DEFAULT 0,
    "trafficBreakdown" JSONB,
    "topArticles" JSONB,
    "topSources" JSONB,
    "topCountries" JSONB,
    "topCategories" JSONB,
    "topAuthors" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_exports" (
    "id" TEXT NOT NULL,
    "exportType" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "filters" JSONB,
    "fileUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_exports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visitor_sessions_anonymousId_idx" ON "visitor_sessions"("anonymousId");

-- CreateIndex
CREATE INDEX "visitor_sessions_startTime_idx" ON "visitor_sessions"("startTime");

-- CreateIndex
CREATE INDEX "visitor_sessions_trafficSource_idx" ON "visitor_sessions"("trafficSource");

-- CreateIndex
CREATE INDEX "visitor_sessions_country_idx" ON "visitor_sessions"("country");

-- CreateIndex
CREATE INDEX "page_views_path_idx" ON "page_views"("path");

-- CreateIndex
CREATE INDEX "page_views_entityType_entityId_idx" ON "page_views"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "page_views_createdAt_idx" ON "page_views"("createdAt");

-- CreateIndex
CREATE INDEX "page_views_sessionId_idx" ON "page_views"("sessionId");

-- CreateIndex
CREATE INDEX "page_views_visitorId_idx" ON "page_views"("visitorId");

-- CreateIndex
CREATE INDEX "article_views_articleId_idx" ON "article_views"("articleId");

-- CreateIndex
CREATE INDEX "article_views_createdAt_idx" ON "article_views"("createdAt");

-- CreateIndex
CREATE INDEX "article_views_visitorId_idx" ON "article_views"("visitorId");

-- CreateIndex
CREATE INDEX "reader_events_eventType_idx" ON "reader_events"("eventType");

-- CreateIndex
CREATE INDEX "reader_events_entityType_entityId_idx" ON "reader_events"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "reader_events_createdAt_idx" ON "reader_events"("createdAt");

-- CreateIndex
CREATE INDEX "search_queries_normalized_idx" ON "search_queries"("normalized");

-- CreateIndex
CREATE INDEX "search_queries_createdAt_idx" ON "search_queries"("createdAt");

-- CreateIndex
CREATE INDEX "search_queries_noResults_idx" ON "search_queries"("noResults");

-- CreateIndex
CREATE INDEX "daily_stats_date_idx" ON "daily_stats"("date");

-- CreateIndex
CREATE INDEX "daily_stats_entityType_entityId_idx" ON "daily_stats"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_date_entityType_entityId_key" ON "daily_stats"("date", "entityType", "entityId");

-- CreateIndex
CREATE INDEX "dashboard_snapshots_snapshotType_periodStart_idx" ON "dashboard_snapshots"("snapshotType", "periodStart");

-- AddForeignKey
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "visitor_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reader_events" ADD CONSTRAINT "reader_events_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "visitor_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_exports" ADD CONSTRAINT "analytics_exports_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
