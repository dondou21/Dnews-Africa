import { describe, it, expect, beforeEach } from "vitest";
import { cache } from "../utils/cache";

describe("Advanced Caching Utility", () => {
  beforeEach(() => {
    cache.clear();
  });

  it("caches values on cache miss and serves from cache on cache hit", async () => {
    let callCount = 0;
    const loader = async () => {
      callCount++;
      return "result-data";
    };

    const key = "test:key:1";
    const ttl = 1000;

    // First call: Cache miss
    const val1 = await cache.wrap(key, ttl, loader);
    expect(val1).toBe("result-data");
    expect(callCount).toBe(1);

    // Second call: Cache hit (loader should not be called again)
    const val2 = await cache.wrap(key, ttl, loader);
    expect(val2).toBe("result-data");
    expect(callCount).toBe(1);
  });

  it("coalesces concurrent requests to prevent duplicate loader execution (stampede protection)", async () => {
    let callCount = 0;
    const loader = async () => {
      callCount++;
      await new Promise((resolve) => setTimeout(resolve, 50));
      return "coalesced-data";
    };

    const key = "test:concurrent";
    const ttl = 1000;

    // Fire 10 concurrent requests for the same uncached key
    const promises = Array.from({ length: 10 }, () => cache.wrap(key, ttl, loader));
    const results = await Promise.all(promises);

    expect(results).toEqual(Array(10).fill("coalesced-data"));
    expect(callCount).toBe(1); // Loader executed exactly once!
  });

  it("respects TTL expiration", async () => {
    let callCount = 0;
    const loader = async () => {
      callCount++;
      return `val-${callCount}`;
    };

    const key = "test:ttl";
    const ttl = 50; // 50ms TTL

    const v1 = await cache.wrap(key, ttl, loader);
    expect(v1).toBe("val-1");
    expect(callCount).toBe(1);

    // Immediate re-fetch: cache hit
    const v2 = await cache.wrap(key, ttl, loader);
    expect(v2).toBe("val-1");
    expect(callCount).toBe(1);

    // Wait for TTL to expire
    await new Promise((resolve) => setTimeout(resolve, 80));

    const v3 = await cache.wrap(key, ttl, loader);
    expect(v3).toBe("val-2");
    expect(callCount).toBe(2);
  });

  it("invalidates cache entries correctly with clearPrefix and del", async () => {
    let callCount = 0;
    const loader = async () => {
      callCount++;
      return `data-${callCount}`;
    };

    await cache.wrap("articles:1", 5000, loader);
    await cache.wrap("articles:2", 5000, loader);
    await cache.wrap("sponsors:active", 5000, loader);

    expect(cache.get("articles:1")).toBe("data-1");
    expect(cache.get("sponsors:active")).toBe("data-3");

    // Invalidate articles prefix
    cache.clearPrefix("articles:");

    expect(cache.get("articles:1")).toBeUndefined();
    expect(cache.get("articles:2")).toBeUndefined();
    expect(cache.get("sponsors:active")).toBe("data-3"); // Sponsors unaffected
  });
});
