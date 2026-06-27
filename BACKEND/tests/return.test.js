import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/user.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import ReturnRequest from '../models/returnRequest.model.js';
import { generateToken } from '../middleware/auth.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 600000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await Order.deleteMany({});
  await Product.deleteMany({});
  await ReturnRequest.deleteMany({});
});

describe('Return API Routes', () => {
  let user, admin, userToken, adminToken, product;

  beforeEach(async () => {
    // Create users
    user = await User.create({ name: 'User 1', email: 'user@test.com', password: 'password', role: 'user' });
    admin = await User.create({ name: 'Admin 1', email: 'admin@test.com', password: 'password', role: 'admin' });
    
    // Create tokens
    userToken = generateToken(user);
    adminToken = generateToken(admin);

    // Create product
    product = await Product.create({ name: 'Test Product', description: 'A test product', basePrice: 50, baseStock: 10 });
  });

  describe('POST /api/returns', () => {
    it('should create a return request for an eligible order', async () => {
      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: product.name, price: product.basePrice, quantity: 2 }],
        totalAmount: 100,
        stripeSessionId: 'sess_1',
        paymentStatus: 'completed',
        deliveryStatus: 'delivered',
        deliveryDate: new Date() // Today
      });

      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: order._id,
          items: [{ productId: product._id.toString(), name: product.name, price: product.basePrice, quantity: 1, reason: 'Defective' }]
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.returnRequest.refundAmount).toBe(50);
    });

    it('should fail if order is not delivered', async () => {
      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: product.name, price: product.basePrice, quantity: 1 }],
        totalAmount: 50,
        stripeSessionId: 'sess_2',
        paymentStatus: 'completed',
        deliveryStatus: 'pending'
      });

      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: order._id,
          items: [{ productId: product._id.toString(), name: product.name, price: product.basePrice, quantity: 1, reason: 'Defective' }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Only delivered orders can be returned');
    });

    it('should fail if delivery date is more than 30 days ago', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35); // 35 days ago

      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: product.name, price: product.basePrice, quantity: 1 }],
        totalAmount: 50,
        stripeSessionId: 'sess_3',
        paymentStatus: 'completed',
        deliveryStatus: 'delivered',
        deliveryDate: oldDate
      });

      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: order._id,
          items: [{ productId: product._id.toString(), name: product.name, price: product.basePrice, quantity: 1, reason: 'Defective' }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Return window of 30 days has expired');
    });

    it('should fail if trying to return more quantity than ordered', async () => {
      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: product.name, price: product.basePrice, quantity: 1 }],
        totalAmount: 50,
        stripeSessionId: 'sess_4',
        paymentStatus: 'completed',
        deliveryStatus: 'delivered',
        deliveryDate: new Date()
      });

      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: order._id,
          items: [{ productId: product._id.toString(), name: product.name, price: product.basePrice, quantity: 2, reason: 'Defective' }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Cannot return more quantity than ordered');
    });

    it('should fail if item was already returned', async () => {
      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: product.name, price: product.basePrice, quantity: 2 }],
        totalAmount: 100,
        stripeSessionId: 'sess_5',
        paymentStatus: 'completed',
        deliveryStatus: 'delivered',
        deliveryDate: new Date()
      });

      // First return
      await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: order._id,
          items: [{ productId: product._id.toString(), name: product.name, price: product.basePrice, quantity: 1, reason: 'Defective' }]
        });

      // Second return of same item
      const response = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: order._id,
          items: [{ productId: product._id.toString(), name: product.name, price: product.basePrice, quantity: 1, reason: 'Changed Mind' }]
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('A return request already exists for one or more of these items.');
    });
  });

  describe('Admin Routes', () => {
    it('should allow admin to fetch all returns', async () => {
      const response = await request(app)
        .get('/api/returns')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.returns)).toBe(true);
    });

    it('should reject non-admin users from fetching all returns', async () => {
      const response = await request(app)
        .get('/api/returns')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow admin to update return status', async () => {
      const order = await Order.create({
        user: user._id,
        items: [{ product: product._id, name: product.name, price: product.basePrice, quantity: 1 }],
        totalAmount: 50,
        stripeSessionId: 'sess_6',
        paymentStatus: 'completed',
        deliveryStatus: 'delivered',
        deliveryDate: new Date()
      });

      const retRes = await request(app)
        .post('/api/returns')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: order._id,
          items: [{ productId: product._id.toString(), name: product.name, price: product.basePrice, quantity: 1, reason: 'Defective' }]
        });

      const returnId = retRes.body.returnRequest._id;

      const updateRes = await request(app)
        .put(`/api/returns/${returnId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Approved',
          adminComments: 'Looks good'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.returnRequest.status).toBe('Approved');
      expect(updateRes.body.returnRequest.adminComments).toBe('Looks good');
    });
  });
});
