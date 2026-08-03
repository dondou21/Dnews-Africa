interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

function get<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function set<T>(key: string, value: T, ttlMs: number): T {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

function del(key: string): void {
  store.delete(key);
}

async function wrap<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const cached = get<T>(key);
  if (cached !== undefined) return cached;
  const value = await loader();
  return set(key, value, ttlMs);
}

export const cache = { get, set, del, wrap, clear: () => store.clear() };
