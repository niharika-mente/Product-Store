import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import Product from '../models/product.model.js';
let mongoServer;

beforeAll(async () => {
    // Start MongoMemoryServer
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect to the in-memory database
    await mongoose.connect(uri);
}, 600000);

afterAll(async () => {
    // Disconnect and stop MongoMemoryServer
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    // Clear database before each test
    await Product.deleteMany({});
});

describe('Checkout API Routes', () => {

    describe('POST /api/checkout', () => {
        it('should return 400 when cart is empty', async () => {
            const response = await request(app).post('/api/checkout').send({ items: [] });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Cart is empty or invalid');
        });

        it('should return 400 when items is missing', async () => {
            const response = await request(app).post('/api/checkout').send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Cart is empty or invalid');
        });

        it('should return 400 when quantity is negative', async () => {
            const product = await Product.create({ name: 'Test Product', price: 100, image: 'img.jpg', stock: 10 });

            const response = await request(app).post('/api/checkout').send({
                items: [{ _id: product._id, name: product.name, quantity: -5 }]
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Item quantity must be a positive integer');
        });

        it('should return 400 when quantity is zero', async () => {
            const product = await Product.create({ name: 'Test Product', price: 100, image: 'img.jpg', stock: 10 });

            const response = await request(app).post('/api/checkout').send({
                items: [{ _id: product._id, name: product.name, quantity: 0 }]
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Item quantity must be a positive integer');
        });

        it('should return 400 when quantity is a float', async () => {
            const product = await Product.create({ name: 'Test Product', price: 100, image: 'img.jpg', stock: 10 });

            const response = await request(app).post('/api/checkout').send({
                items: [{ _id: product._id, name: product.name, quantity: 1.5 }]
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Item quantity must be a positive integer');
        });

        it('should return 400 when quantity is not a number', async () => {
            const product = await Product.create({ name: 'Test Product', price: 100, image: 'img.jpg', stock: 10 });

            const response = await request(app).post('/api/checkout').send({
                items: [{ _id: product._id, name: product.name, quantity: 'two' }]
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Item quantity must be a positive integer');
        });

        it('should return 400 when quantity exceeds available stock', async () => {
            const product = await Product.create({ name: 'Test Product', price: 100, image: 'img.jpg', stock: 3 });

            const response = await request(app).post('/api/checkout').send({
                items: [{ _id: product._id, name: product.name, quantity: 5 }]
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(`Insufficient stock for ${product.name}. Available: ${product.stock}, requested: 5`);
        });

        it('should return 400 for an invalid product ID', async () => {
            const response = await request(app).post('/api/checkout').send({
                items: [{ _id: 'invalid-id', name: 'Ghost', quantity: 1 }]
            });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 404 when product does not exist', async () => {
            const fakeId = new mongoose.Types.ObjectId();

            const response = await request(app).post('/api/checkout').send({
                items: [{ _id: fakeId, name: 'Ghost Product', quantity: 1 }]
            });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('should return 404 when a cart item has been soft-deleted', async () => {
            const product = await Product.create({ name: 'Deleted Product', price: 50, image: 'img.jpg', stock: 10, isDeleted: true });

            const response = await request(app).post('/api/checkout').send({
                items: [{ _id: product._id, name: product.name, quantity: 1 }]
            });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('should return 404 when one item in a multi-item cart has been soft-deleted', async () => {
            const active = await Product.create({ name: 'Active Product', price: 30, image: 'a.jpg', stock: 10 });
            const deleted = await Product.create({ name: 'Removed Product', price: 20, image: 'b.jpg', stock: 10, isDeleted: true });

            const response = await request(app).post('/api/checkout').send({
                items: [
                    { _id: active._id, name: active.name, quantity: 1 },
                    { _id: deleted._id, name: deleted.name, quantity: 1 }
                ]
            });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('should return 200 with correct total for valid items', async () => {
            const product = await Product.create({ name: 'Test Product', price: 50, image: 'img.jpg', stock: 10 });

            const response = await request(app).post('/api/checkout').send({
                items: [{ _id: product._id, name: product.name, quantity: 3 }]
            });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.url).toBe('https://checkout.stripe.com/test-url');
        });

        it('should calculate correct total for multiple items', async () => {
            const p1 = await Product.create({ name: 'Product A', price: 20, image: 'a.jpg', stock: 10 });
            const p2 = await Product.create({ name: 'Product B', price: 30, image: 'b.jpg', stock: 10 });

            const response = await request(app).post('/api/checkout').send({
                items: [
                    { _id: p1._id, name: p1.name, quantity: 2 },
                    { _id: p2._id, name: p2.name, quantity: 1 }
                ]
            });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.url).toBe('https://checkout.stripe.com/test-url');
        });
    });

});
