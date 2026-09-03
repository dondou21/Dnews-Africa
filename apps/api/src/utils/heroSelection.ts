export interface HeroCandidate {
  id: string;
  publishedAt: Date | string | null;
  isFeatured?: boolean;
}

export const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Selects the homepage hero article using the following priority:
 *  1. Only PUBLISHED articles with a `publishedAt` are eligible.
 *  2. If a recently published article exists (within `recentWindowMs`),
 *     the newest recent article wins (fresh content has priority).
 *  3. Otherwise, dynamic mode: prefer articles the caller has not already
 *     read (`readIds`), falling back to a random eligible article when every
 *     eligible article has been read.
 *  4. Never returns a draft/scheduled/archived/unpublished article.
 */
export function selectHeroArticle(
  candidates: HeroCandidate[],
  readIds: Set<string> = new Set(),
  now: number = Date.now(),
  recentWindowMs: number = TWENTY_FOUR_HOURS_MS,
): HeroCandidate | null {
  const eligible = candidates.filter(
    (c) => c.publishedAt != null,
  );

  if (eligible.length === 0) return null;

  const sorted = [...eligible].sort(
    (a, b) =>
      new Date(b.publishedAt as string).getTime() -
      new Date(a.publishedAt as string).getTime(),
  );

  const recent = sorted.filter(
    (c) => now - new Date(c.publishedAt as string).getTime() <= recentWindowMs,
  );
  const recentFeatured = recent.filter((c) => c.isFeatured);
  if (recentFeatured.length > 0) return recentFeatured[0];
  if (recent.length > 0) return recent[0];

  const unread = sorted.filter((c) => !readIds.has(c.id));
  const pool = unread.length > 0 ? unread : sorted;

  return pool[Math.floor(Math.random() * pool.length)];
}
