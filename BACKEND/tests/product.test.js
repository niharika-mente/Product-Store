import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import app from '../app.js';
import Product from '../models/product.model.js';
import User from '../models/user.model.js';

let mongoServer;
let adminToken;
let userToken;
let adminUser;
let regularUser;

beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long!!';

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    const hashedPassword = await bcrypt.hash('password123', 10);

    adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'admin',
    });

    regularUser = await User.create({
        name: 'Regular User',
        email: 'user@test.com',
        password: hashedPassword,
        role: 'user',
    });

    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    userToken = jwt.sign({ id: regularUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}, 600000);

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    await Product.deleteMany({});
});

describe('Product API Routes', () => {

    describe('POST /api/products', () => {
        it('should create a product when authenticated as admin', async () => {
            const newProduct = {
                name: 'Test Product',
                price: 100,
                image: 'test-image.jpg'
            };

            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newProduct);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Test Product');
        });

        it('should return 401 when no token provided', async () => {
            const response = await request(app)
                .post('/api/products')
                .send({ name: 'Test', price: 100, image: 'img.jpg' });

            expect(response.status).toBe(401);
        });

        it('should return 403 when authenticated as non-admin user', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Test', price: 100, image: 'img.jpg' });

            expect(response.status).toBe(403);
        });

        it('should return 400 when missing required fields', async () => {
            const newProduct = { name: 'Test Product' };

            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newProduct);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Please provide all fields');
        });
    });

    describe('GET /api/products', () => {
        it('should return an empty array if no products exist', async () => {
            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBe(0);
        });

        it('should return all products (public)', async () => {
            await Product.create({ name: 'Product 1', price: 10, image: 'img1.jpg' });
            await Product.create({ name: 'Product 2', price: 20, image: 'img2.jpg' });

            const response = await request(app).get('/api/products');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should update a product when authenticated as admin', async () => {
            const product = await Product.create({ name: 'Old Product', price: 10, image: 'old.jpg' });

            const response = await request(app)
                .put(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Updated Product' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Product');
        });

        it('should return 401 when no token provided', async () => {
            const product = await Product.create({ name: 'Old', price: 10, image: 'old.jpg' });

            const response = await request(app)
                .put(`/api/products/${product._id}`)
                .send({ name: 'Updated' });

            expect(response.status).toBe(401);
        });

        it('should return 403 when authenticated as non-admin user', async () => {
            const product = await Product.create({ name: 'Old', price: 10, image: 'old.jpg' });

            const response = await request(app)
                .put(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ name: 'Updated' });

            expect(response.status).toBe(403);
        });

        it('should return 404 for an invalid ID format', async () => {
            const response = await request(app)
                .put('/api/products/123')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Updated' });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid Product Id');
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete a product when authenticated as admin', async () => {
            const product = await Product.create({ name: 'Product to delete', price: 10, image: 'del.jpg' });

            const response = await request(app)
                .delete(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Product deleted successfully');

            const checkProduct = await Product.findById(product._id);
            expect(checkProduct.isDeleted).toBe(true);
        });

        it('should return 401 when no token provided', async () => {
            const product = await Product.create({ name: 'To delete', price: 10, image: 'del.jpg' });

            const response = await request(app).delete(`/api/products/${product._id}`);

            expect(response.status).toBe(401);
        });

        it('should return 403 when authenticated as non-admin user', async () => {
            const product = await Product.create({ name: 'To delete', price: 10, image: 'del.jpg' });

            const response = await request(app)
                .delete(`/api/products/${product._id}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
        });

        it('should return 404 for an invalid ID format', async () => {
            const response = await request(app)
                .delete('/api/products/123')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid Product Id');
        });
    });

});
