import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import wishlistRoutes from '../routes/wishlist.route.js';
import { errorHandler } from '../middleware/errorMiddleware.js';
import { generateToken } from '../middleware/auth.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Wishlist from '../models/Wishlist.model.js';

// Mount only the wishlist router (plus the real error handler) on a minimal app.
// This avoids importing app.js / server.js, whose circular import breaks
// supertest-style loading of the whole application.
const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/wishlist', wishlistRoutes);
  app.use(errorHandler);
  return app;
};

// generateToken and the route's `protect` middleware both live in auth.js and
// share its module-level JWT secret, so tokens minted here always verify.
const signToken = (user) => generateToken(user);

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

beforeEach(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await Wishlist.deleteMany({});
});

describe('Wishlist API (per-user isolation)', () => {
  let userA, userB, tokenA, tokenB, productA, productB;

  beforeEach(async () => {
    userA = await User.create({ name: 'A', email: 'a@test.com', password: 'password' });
    userB = await User.create({ name: 'B', email: 'b@test.com', password: 'password' });
    tokenA = signToken(userA);
    tokenB = signToken(userB);
    productA = await Product.create({ name: 'Phone', description: 'A phone', basePrice: 100 });
    productB = await Product.create({ name: 'Laptop', description: 'A laptop', basePrice: 200 });
  });

  describe('authentication', () => {
    it('rejects GET without a token', async () => {
      const res = await request(app).get('/api/wishlist');
      expect(res.status).toBe(401);
    });

    it('rejects add without a token', async () => {
      const res = await request(app).post('/api/wishlist/add').send({ productId: productA._id });
      expect(res.status).toBe(401);
    });

    it('rejects remove without a token', async () => {
      const res = await request(app).delete(`/api/wishlist/remove/${productA._id}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/wishlist', () => {
    it('returns an empty wishlist for a user who has none', async () => {
      const res = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.products).toEqual([]);
    });
  });

  describe('POST /api/wishlist/add', () => {
    it('adds a product to the user wishlist', async () => {
      const res = await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ productId: productA._id });

      expect(res.status).toBe(200);
      expect(res.body.user).toBe(userA._id.toString());
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0]._id).toBe(productA._id.toString());
    });

    it('rejects a missing productId', async () => {
      const res = await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('rejects an invalid productId', async () => {
      const res = await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ productId: 'not-an-id' });
      expect(res.status).toBe(400);
    });

    it('returns 404 for a non-existent product', async () => {
      const res = await request(app)
        .post('/api/wishlist/add')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ productId: new mongoose.Types.ObjectId() });
      expect(res.status).toBe(404);
    });

    it('does not store duplicates when adding the same product twice', async () => {
      await request(app).post('/api/wishlist/add').set('Authorization', `Bearer ${tokenA}`).send({ productId: productA._id });
      const res = await request(app).post('/api/wishlist/add').set('Authorization', `Bearer ${tokenA}`).send({ productId: productA._id });

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      const count = await Wishlist.countDocuments({ user: userA._id });
      expect(count).toBe(1);
    });
  });

  describe('DELETE /api/wishlist/remove/:productId', () => {
    it('removes a product from the user wishlist', async () => {
      await request(app).post('/api/wishlist/add').set('Authorization', `Bearer ${tokenA}`).send({ productId: productA._id });

      const res = await request(app)
        .delete(`/api/wishlist/remove/${productA._id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(0);
    });

    it('rejects an invalid productId', async () => {
      const res = await request(app)
        .delete('/api/wishlist/remove/not-an-id')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(400);
    });

    it('returns 404 when the user has no wishlist yet', async () => {
      const res = await request(app)
        .delete(`/api/wishlist/remove/${productA._id}`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(404);
    });

    it('is a no-op when removing a product that is not in the wishlist', async () => {
      await request(app).post('/api/wishlist/add').set('Authorization', `Bearer ${tokenA}`).send({ productId: productA._id });

      const res = await request(app)
        .delete(`/api/wishlist/remove/${productB._id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
    });
  });

  describe('cross-user isolation (the reported bug)', () => {
    it('does not leak one user\'s wishlist to another', async () => {
      // User A adds a product.
      await request(app).post('/api/wishlist/add').set('Authorization', `Bearer ${tokenA}`).send({ productId: productA._id });

      // User B must NOT see it.
      const resB = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${tokenB}`);
      expect(resB.status).toBe(200);
      expect(resB.body.products).toEqual([]);

      // User A still sees their own.
      const resA = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${tokenA}`);
      expect(resA.body.products).toHaveLength(1);
      expect(resA.body.products[0]._id).toBe(productA._id.toString());
    });

    it('keeps two users wishlists independent', async () => {
      await request(app).post('/api/wishlist/add').set('Authorization', `Bearer ${tokenA}`).send({ productId: productA._id });
      await request(app).post('/api/wishlist/add').set('Authorization', `Bearer ${tokenB}`).send({ productId: productB._id });

      // A removing its product must not touch B's wishlist.
      await request(app).delete(`/api/wishlist/remove/${productA._id}`).set('Authorization', `Bearer ${tokenA}`);

      const resB = await request(app).get('/api/wishlist').set('Authorization', `Bearer ${tokenB}`);
      expect(resB.body.products).toHaveLength(1);
      expect(resB.body.products[0]._id).toBe(productB._id.toString());
    });
  });
});
