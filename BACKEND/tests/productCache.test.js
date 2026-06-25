import { jest } from '@jest/globals';
import {
  buildListCacheKey,
  getCachedList,
  setCachedList,
  invalidateProductCache,
} from '../services/productCache.js';

// Minimal in-memory stand-in for an ioredis client. Mirrors the subset of the
// API the cache service uses (get / set with EX / keys / del) so the cache
// logic can be exercised deterministically without a real Redis server.
const createFakeRedis = () => {
  const store = new Map();
  return {
    store,
    get: jest.fn(async (key) => (store.has(key) ? store.get(key) : null)),
    set: jest.fn(async (key, value) => {
      store.set(key, value);
      return 'OK';
    }),
    keys: jest.fn(async (pattern) => {
      const prefix = pattern.replace(/\*$/, '');
      return [...store.keys()].filter((k) => k.startsWith(prefix));
    }),
    del: jest.fn(async (...keys) => {
      let removed = 0;
      keys.forEach((k) => {
        if (store.delete(k)) removed += 1;
      });
      return removed;
    }),
  };
};

// A client whose every operation rejects — used to prove cache failures are
// swallowed and never propagate to the caller.
const createBrokenRedis = () => ({
  get: jest.fn(async () => {
    throw new Error('connection refused');
  }),
  set: jest.fn(async () => {
    throw new Error('connection refused');
  }),
  keys: jest.fn(async () => {
    throw new Error('connection refused');
  }),
  del: jest.fn(async () => {
    throw new Error('connection refused');
  }),
});

describe('buildListCacheKey', () => {
  it('produces identical keys for identical parameters', () => {
    const a = buildListCacheKey({ page: 2, limit: 10, sort: 'price_asc', minPrice: 5, maxPrice: 50 });
    const b = buildListCacheKey({ page: 2, limit: 10, sort: 'price_asc', minPrice: 5, maxPrice: 50 });
    expect(a).toBe(b);
  });

  it('produces different keys when any parameter differs', () => {
    const base = buildListCacheKey({ page: 1, limit: 10 });
    expect(buildListCacheKey({ page: 2, limit: 10 })).not.toBe(base);
    expect(buildListCacheKey({ page: 1, limit: 20 })).not.toBe(base);
    expect(buildListCacheKey({ page: 1, limit: 10, sort: 'newest' })).not.toBe(base);
  });

  it('applies defaults when called with no arguments', () => {
    expect(buildListCacheKey()).toBe('products:list:page=1&limit=10&sort=&min=&max=');
  });

  it('namespaces keys under "products:" so invalidation can find them', () => {
    expect(buildListCacheKey({ page: 1 }).startsWith('products:')).toBe(true);
  });
});

describe('getCachedList', () => {
  it('returns null on a cache miss', async () => {
    const redis = createFakeRedis();
    expect(await getCachedList('products:list:none', redis)).toBeNull();
  });

  it('returns the parsed value on a cache hit', async () => {
    const redis = createFakeRedis();
    const payload = { data: [{ name: 'iPhone' }], totalProducts: 1 };
    redis.store.set('products:list:hit', JSON.stringify(payload));

    expect(await getCachedList('products:list:hit', redis)).toEqual(payload);
  });

  it('returns null (caching disabled) when no client is provided', async () => {
    expect(await getCachedList('products:list:any', null)).toBeNull();
  });

  it('returns null instead of throwing when Redis errors', async () => {
    const redis = createBrokenRedis();
    expect(await getCachedList('products:list:any', redis)).toBeNull();
  });
});

describe('setCachedList', () => {
  it('writes a JSON-serialised value with a TTL', async () => {
    const redis = createFakeRedis();
    const payload = { data: [], totalProducts: 0 };

    await setCachedList('products:list:write', payload, redis);

    expect(redis.set).toHaveBeenCalledWith('products:list:write', JSON.stringify(payload), 'EX', 60);
    expect(JSON.parse(redis.store.get('products:list:write'))).toEqual(payload);
  });

  it('no-ops when caching is disabled (no client)', async () => {
    await expect(setCachedList('products:list:write', { a: 1 }, null)).resolves.toBeUndefined();
  });

  it('swallows Redis write errors', async () => {
    const redis = createBrokenRedis();
    await expect(setCachedList('products:list:write', { a: 1 }, redis)).resolves.toBeUndefined();
  });
});

describe('invalidateProductCache', () => {
  it('removes every key under the products namespace', async () => {
    const redis = createFakeRedis();
    redis.store.set('products:list:a', '1');
    redis.store.set('products:list:b', '2');
    redis.store.set('unrelated:key', '3');

    await invalidateProductCache(redis);

    expect(redis.store.has('products:list:a')).toBe(false);
    expect(redis.store.has('products:list:b')).toBe(false);
    expect(redis.store.has('unrelated:key')).toBe(true);
  });

  it('does not call del when there are no matching keys', async () => {
    const redis = createFakeRedis();
    await invalidateProductCache(redis);
    expect(redis.del).not.toHaveBeenCalled();
  });

  it('no-ops when caching is disabled (no client)', async () => {
    await expect(invalidateProductCache(null)).resolves.toBeUndefined();
  });

  it('swallows Redis invalidation errors', async () => {
    const redis = createBrokenRedis();
    await expect(invalidateProductCache(redis)).resolves.toBeUndefined();
  });
});

describe('cache lifecycle (write → read → invalidate)', () => {
  it('serves a stored response and clears it on invalidation', async () => {
    const redis = createFakeRedis();
    const key = buildListCacheKey({ page: 1, limit: 10 });
    const payload = { data: [{ name: 'Galaxy' }], totalProducts: 1 };

    // Miss, then populate.
    expect(await getCachedList(key, redis)).toBeNull();
    await setCachedList(key, payload, redis);

    // Hit.
    expect(await getCachedList(key, redis)).toEqual(payload);

    // After a create/update/delete the entry is gone.
    await invalidateProductCache(redis);
    expect(await getCachedList(key, redis)).toBeNull();
  });
});
