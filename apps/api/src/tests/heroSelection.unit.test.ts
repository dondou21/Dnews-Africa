import { describe, it, expect } from "vitest";
import {
  selectHeroArticle,
  TWENTY_FOUR_HOURS_MS,
  type HeroCandidate,
} from "../utils/heroSelection";

function article(id: string, hoursAgo: number | null): HeroCandidate {
  return {
    id,
    publishedAt:
      hoursAgo === null
        ? null
        : new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
  };
}

function featuredArticle(id: string, hoursAgo: number): HeroCandidate {
  return { ...article(id, hoursAgo), isFeatured: true };
}

const HOUR = 60 * 60 * 1000;

describe("selectHeroArticle", () => {
  it("returns null when there are no eligible articles", () => {
    expect(selectHeroArticle([])).toBeNull();
    expect(selectHeroArticle([article("a", null)])).toBeNull();
  });

  it("prioritizes the newest article published within the last 24 hours", () => {
    const candidates = [
      article("old", 48),
      article("recent-2h", 2),
      article("recent-5h", 5),
      article("recent-23h", 23),
    ];
    expect(selectHeroArticle(candidates)?.id).toBe("recent-2h");
  });

  it("treats an article published exactly 24h ago as outside the window", () => {
    const candidates = [article("exactly-24h", 24), article("recent-1h", 1)];
    expect(selectHeroArticle(candidates)?.id).toBe("recent-1h");
  });

  it("prioritizes the newest recent featured article over a newer non-featured article", () => {
    const candidates = [
      featuredArticle("featured-2h", 2),
      { ...article("non-featured-1h", 1), isFeatured: false },
    ];
    expect(selectHeroArticle(candidates)?.id).toBe("featured-2h");
  });

  it("falls back to dynamic mode when nothing is within 24h", () => {
    const candidates = [article("a", 25), article("b", 30), article("c", 40)];
    const result = selectHeroArticle(candidates);
    expect(["a", "b", "c"]).toContain(result?.id);
  });

  it("never returns a draft/unpublished article (null publishedAt)", () => {
    const candidates = [article("draft", null), article("published", 30)];
    const result = selectHeroArticle(candidates);
    expect(result?.id).toBe("published");
  });

  it("prefers an unread article in dynamic mode", () => {
    const candidates = [article("a", 30), article("b", 31), article("c", 32)];
    const read = new Set(["a", "b"]);
    const result = selectHeroArticle(candidates, read);
    expect(result?.id).toBe("c");
  });

  it("still returns a read article when all are read (dynamic mode)", () => {
    const candidates = [article("a", 30), article("b", 31)];
    const read = new Set(["a", "b"]);
    const result = selectHeroArticle(candidates, read);
    expect(["a", "b"]).toContain(result?.id);
  });

  it("returns the only article even when it has been read", () => {
    const candidates = [article("only", 30)];
    const read = new Set(["only"]);
    expect(selectHeroArticle(candidates, read)?.id).toBe("only");
  });

  it("selects the newest recent article even if it has been read (freshness wins)", () => {
    const candidates = [article("fresh-read", 2), article("old-30h", 30)];
    const read = new Set(["fresh-read"]);
    expect(selectHeroArticle(candidates, read)?.id).toBe("fresh-read");
  });

  it("uses a custom recency window", () => {
    const candidates = [article("ten-days", 240), article("two-days", 48)];
    const result = selectHeroArticle(candidates, new Set(), Date.now(), 72 * HOUR);
    expect(result?.id).toBe("two-days");
  });

  it("selects from a random eligible article in dynamic mode across calls", () => {
    const candidates = Array.from({ length: 20 }, (_, i) => article(`a${i}`, 48 + i));
    const picks = new Set<string>();
    for (let i = 0; i < 40; i++) {
      picks.add(selectHeroArticle(candidates)!.id);
    }
    expect(picks.size).toBeGreaterThan(1);
  });

  it("exposes a 24h window constant", () => {
    expect(TWENTY_FOUR_HOURS_MS).toBe(24 * 60 * 60 * 1000);
  });
});
