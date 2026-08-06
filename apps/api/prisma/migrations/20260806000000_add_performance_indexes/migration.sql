-- Add performance indexes for hot query paths across the CMS and public API.

CREATE INDEX "articles_status_publishedAt_idx" ON "articles" ("status", "publishedAt");
CREATE INDEX "articles_status_createdAt_idx" ON "articles" ("status", "createdAt");
CREATE INDEX "articles_categoryId_idx" ON "articles" ("categoryId");
CREATE INDEX "articles_authorId_idx" ON "articles" ("authorId");
CREATE INDEX "articles_isFeatured_publishedAt_idx" ON "articles" ("isFeatured", "publishedAt");
CREATE INDEX "articles_publishedAt_idx" ON "articles" ("publishedAt");

CREATE INDEX "categories_parentId_idx" ON "categories" ("parentId");

CREATE INDEX "comments_articleId_idx" ON "comments" ("articleId");
CREATE INDEX "comments_status_idx" ON "comments" ("status");

CREATE INDEX "contact_messages_isRead_idx" ON "contact_messages" ("isRead");

CREATE INDEX "media_uploadedById_idx" ON "media" ("uploadedById");

CREATE INDEX "notifications_userId_read_idx" ON "notifications" ("userId", "read");

CREATE INDEX "article_tags_tagId_idx" ON "article_tags" ("tagId");

CREATE INDEX "newsletter_subscribers_status_idx" ON "newsletter_subscribers" ("status");

CREATE INDEX "newsletter_campaign_recipients_campaignId_idx" ON "newsletter_campaign_recipients" ("campaignId");
