import redisClient from '../config/redis.js';

// Namespace for every product-related cache entry. Kept in sync with the
// GraphQL resolvers (graphql/resolvers.js) so a write through either path
// invalidates the other's cached reads.
const CACHE_PREFIX = 'products:';
const LIST_PREFIX = `${CACHE_PREFIX}list:`;

// How long a cached catalog page lives before it is refreshed from MongoDB.
const CACHE_TTL_SECONDS = 60;

// Builds a deterministic cache key from the query parameters that influence
// the getProducts response. Different filters/pagination produce different
// keys so each variant is cached independently.
export const buildListCacheKey = ({ page = 1, limit = 10, sort = '', minPrice = '', maxPrice = '' } = {}) =>
  `${LIST_PREFIX}page=${page}&limit=${limit}&sort=${sort}&min=${minPrice}&max=${maxPrice}`;

// Reads a cached list response. Returns null on a miss, when caching is
// disabled (no REDIS_URL), or when Redis is unreachable — callers then fall
// back to MongoDB. Cache problems must never break the request.
export const getCachedList = async (key, client = redisClient) => {
  if (!client) return null;
  try {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('[Redis] Cache read error (falling back to MongoDB):', error.message);
    return null;
  }
};

// Stores a list response with a TTL. No-ops when caching is disabled and
// swallows Redis errors so a write failure can't fail the request.
export const setCachedList = async (key, value, client = redisClient) => {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), 'EX', CACHE_TTL_SECONDS);
  } catch (error) {
    console.warn('[Redis] Cache write error:', error.message);
  }
};

// Drops every product cache entry. Called whenever a product is created,
// updated, or deleted so subsequent reads reflect the change.
export const invalidateProductCache = async (client = redisClient) => {
  if (!client) return;
  try {
    const keys = await client.keys(`${CACHE_PREFIX}*`);
    if (keys.length) {
      await client.del(...keys);
    }
  } catch (error) {
    console.warn('[Redis] Cache invalidation error:', error.message);
  }
};
