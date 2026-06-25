import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// In-memory stand-in for the ioredis client. By mocking config/redis.js the
// real cache service (services/productCache.js) and the real controller run
// end-to-end against this fake — so these tests exercise the actual
// read-through / write-through / invalidate wiring, not a reimplementation.
const store = new Map();
const fakeRedis = {
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

jest.unstable_mockModule('../config/redis.js', () => ({ default: fakeRedis }));

// Import AFTER the mock is registered so the cache service binds to fakeRedis.
// The controller is exercised directly (not through app.js) to avoid app.js's
// import-time connectDB() clashing with this suite's in-memory MongoDB.
const Product = (await import('../models/product.model.js')).default;
const { getProducts, createProduct } = await import('../controllers/product.controller.js');

// Minimal Express response double that captures the status code and JSON body.
const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 600000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  store.clear();
  jest.clearAllMocks();
  await Product.deleteMany({});
  await Product.create([
    { name: 'iPhone 15', description: 'Apple phone', brand: 'Apple', basePrice: 999, baseStock: 5 },
    { name: 'Galaxy S24', description: 'Samsung phone', brand: 'Samsung', basePrice: 899, baseStock: 5 },
  ]);
});

describe('getProducts — Redis caching', () => {
  it('serves from MongoDB on a miss and populates the cache', async () => {
    const res = mockRes();
    await getProducts({ query: {} }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalProducts).toBe(2);

    // The response was written through to Redis under the products namespace.
    const keys = [...store.keys()];
    expect(keys).toHaveLength(1);
    expect(keys[0].startsWith('products:list:')).toBe(true);
    expect(fakeRedis.set).toHaveBeenCalledTimes(1);
  });

  it('serves a second identical request from the cache without touching MongoDB', async () => {
    await getProducts({ query: {} }, mockRes()); // miss → populate

    // Wipe the DB: if the second request still returns 2 products, it was
    // served from Redis rather than re-queried.
    await Product.deleteMany({});
    const spy = jest.spyOn(Product, 'find');

    const res = mockRes();
    await getProducts({ query: {} }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.totalProducts).toBe(2);
    expect(Product.find).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('caches each pagination/filter combination under a separate key', async () => {
    await getProducts({ query: { page: '1', limit: '10' } }, mockRes());
    await getProducts({ query: { page: '2', limit: '10' } }, mockRes());
    await getProducts({ query: { sort: 'price_asc' } }, mockRes());

    expect(new Set(store.keys()).size).toBe(3);
  });

  it('drops every cached page when a product is created', async () => {
    await getProducts({ query: {} }, mockRes());
    expect(store.size).toBe(1); // cache populated

    await createProduct(
      { body: { name: 'Pixel 9', description: 'Google phone', brand: 'Google', basePrice: 799, baseStock: 5 } },
      mockRes()
    );

    expect(store.size).toBe(0);

    // The next read misses, re-queries MongoDB, and now sees three products.
    const res = mockRes();
    await getProducts({ query: {} }, res);
    expect(res.body.totalProducts).toBe(3);
  });
});
