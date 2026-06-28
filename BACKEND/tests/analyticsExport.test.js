import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import analyticsRoutes from '../routes/analytics.route.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';

// Mount only the analytics router on a minimal app. This deliberately avoids
// importing app.js / server.js, whose circular import (app -> product.controller
// -> server -> app) breaks supertest-style loading of the full app.
const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin/analytics', analyticsRoutes);
  return app;
};

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

const oid = () => new mongoose.Types.ObjectId();
const completedOrder = (owner, total, quantity, session) => ({
  user: owner._id,
  items: [{ product: oid(), name: 'Item', price: total, quantity }],
  totalAmount: total,
  stripeSessionId: session,
  paymentStatus: 'completed',
});

let mongoServer;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'analytics-export-test-secret';
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
  await Order.deleteMany({});
});

describe('GET /api/admin/analytics/export', () => {
  let userToken, adminToken;

  beforeEach(async () => {
    const user = await User.create({ name: 'User', email: 'user@test.com', password: 'password', role: 'user' });
    const admin = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'password', role: 'admin' });
    userToken = signToken(user);
    adminToken = signToken(admin);

    await Order.create(completedOrder(user, 100, 2, 'sess_1'));
    await Order.create(completedOrder(admin, 50, 1, 'sess_2'));
    // A pending order must be excluded from sales/revenue totals.
    await Order.create({ ...completedOrder(user, 999, 9, 'sess_3'), paymentStatus: 'pending' });
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/admin/analytics/export');
    expect(res.status).toBe(401);
  });

  it('rejects non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/export')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('rejects an invalid format', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/export?format=xlsx')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  it('rejects an unparseable startDate', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/export?startDate=not-a-date')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  it('rejects a start date after the end date', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/export?startDate=2026-06-01&endDate=2026-01-01')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });

  it('exports a CSV report covering only completed orders', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/export?format=csv')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment');
    expect(res.headers['content-disposition']).toContain('.csv');

    const body = res.text;
    expect(body).toContain('Total Revenue,150');
    expect(body).toContain('Total Orders,2');
    expect(body).toContain('Total Items Sold,3');
    expect(body).toContain('Average Order Value,75');
    expect(body).toContain('New Users,2');
    expect(body).toContain('Active Users,2');
    expect(body).toContain('Date,Orders,Revenue,Items Sold');
  });

  it('returns an empty-range report when the window has no orders', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/export?format=csv&startDate=2099-01-01&endDate=2099-12-31')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.text).toContain('Total Revenue,0');
    expect(res.text).toContain('No orders in the selected range');
  });

  it('exports a valid PDF report', async () => {
    const res = await request(app)
      .get('/api/admin/analytics/export?format=pdf')
      .set('Authorization', `Bearer ${adminToken}`)
      .buffer(true)
      .parse((response, callback) => {
        const chunks = [];
        response.on('data', (c) => chunks.push(c));
        response.on('end', () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('.pdf');
    // Valid PDFs begin with the "%PDF" magic bytes.
    expect(res.body.slice(0, 4).toString()).toBe('%PDF');
  });
});
