-- CreateTable
CREATE TABLE "seo_metadata" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "focusKeyword" TEXT,
    "robots" TEXT NOT NULL DEFAULT 'index, follow',
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImageId" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImageId" TEXT,
    "schemaType" TEXT NOT NULL DEFAULT 'NewsArticle',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redirects" (
    "id" TEXT NOT NULL,
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL DEFAULT 301,
    "entityType" TEXT,
    "entityId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redirects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_settings" (
    "id" SERIAL NOT NULL,
    "siteTitle" TEXT NOT NULL DEFAULT 'Dnews Africa',
    "defaultDescription" TEXT NOT NULL DEFAULT 'Latest African news, stories, and analysis.',
    "defaultImageUrl" TEXT,
    "defaultRobots" TEXT NOT NULL DEFAULT 'index, follow',
    "organizationName" TEXT NOT NULL DEFAULT 'Dnews Africa',
    "organizationLogo" TEXT,
    "socialFacebook" TEXT,
    "socialTwitter" TEXT,
    "socialInstagram" TEXT,
    "socialLinkedin" TEXT,
    "googleNewsPubName" TEXT DEFAULT 'Dnews Africa',
    "googleNewsPubLogo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_metadata_entityType_entityId_key" ON "seo_metadata"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "redirects_fromPath_key" ON "redirects"("fromPath");
