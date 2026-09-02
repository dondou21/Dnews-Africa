interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

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
  inFlight.delete(key);
}

function clearPrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
  for (const key of inFlight.keys()) {
    if (key.startsWith(prefix)) inFlight.delete(key);
  }
}

async function wrap<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const cached = get<T>(key);
  if (cached !== undefined) return cached;

  let promise = inFlight.get(key) as Promise<T> | undefined;
  if (!promise) {
    promise = (async () => {
      try {
        const value = await loader();
        set(key, value, ttlMs);
        return value;
      } finally {
        inFlight.delete(key);
      }
    })();
    inFlight.set(key, promise);
  }
  return promise;
}

export const cache = {
  get,
  set,
  del,
  wrap,
  clearPrefix,
  clear: () => {
    store.clear();
    inFlight.clear();
  },
};
