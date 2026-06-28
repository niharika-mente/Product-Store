import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import returnRoutes from '../routes/return.route.js';
import { generateToken } from '../middleware/auth.js';
import User from '../models/user.model.js';
import ReturnRequest from '../models/returnRequest.model.js';

// Mount only the return router on a minimal app (avoids app.js/server.js).
const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/returns', returnRoutes);
  return app;
};

const makeReturn = (userId, i) => ({
  orderId: new mongoose.Types.ObjectId(),
  userId,
  items: [
    { productId: new mongoose.Types.ObjectId(), name: `Item ${i}`, price: 10, quantity: 1, reason: 'Defective' },
  ],
  refundAmount: 10,
});

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = buildApp();
}, 600000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('GET /api/returns — pagination', () => {
  let admin, adminToken, userToken;

  beforeEach(async () => {
    await User.deleteMany({});
    await ReturnRequest.deleteMany({});

    admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'admin' });
    const user = await User.create({ name: 'User', email: 'user@test.com', password: 'password', role: 'user' });
    adminToken = generateToken(admin);
    userToken = generateToken(user);

    // Seed 25 return requests so default (20) and custom limits both paginate.
    await ReturnRequest.insertMany(Array.from({ length: 25 }, (_, i) => makeReturn(admin._id, i)));
  });

  const get = (query = '') =>
    request(app).get(`/api/returns${query}`).set('Authorization', `Bearer ${adminToken}`);

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/returns');
    expect(res.status).toBe(401);
  });

  it('rejects non-admin users', async () => {
    const res = await request(app).get('/api/returns').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('caps the default page size to 20 (bounds the unbounded query)', async () => {
    const res = await get();
    expect(res.status).toBe(200);
    expect(res.body.returns).toHaveLength(20);
    expect(res.body.pagination).toMatchObject({
      page: 1,
      limit: 20,
      totalReturns: 25,
      totalPages: 2,
    });
  });

  it('honours page and limit query params', async () => {
    const res = await get('?page=2&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.returns).toHaveLength(10);
    expect(res.body.pagination).toMatchObject({ page: 2, limit: 10, totalReturns: 25, totalPages: 3 });
  });

  it('returns the remainder on the last page', async () => {
    const res = await get('?page=3&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.returns).toHaveLength(5);
  });

  it('clamps an excessive limit to the maximum (100)', async () => {
    const res = await get('?limit=100000');
    expect(res.status).toBe(200);
    expect(res.body.pagination.limit).toBe(100);
  });

  it('falls back to defaults for invalid/zero/negative params', async () => {
    for (const q of ['?page=0&limit=-5', '?page=abc&limit=xyz', '?page=-1']) {
      const res = await get(q);
      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(20);
    }
  });
});
