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

describe('Product API Routes', () => {

    describe('POST /api/products', () => {
        it('should create a new product when provided valid data', async () => {
            const newProduct = {
                name: 'Test Product',
                price: 100,
                image: 'test-image.jpg'
            };
            
            const response = await request(app).post('/api/products').send(newProduct);
            
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Test Product');
        });
        
        it('should return 400 when missing required fields', async () => {
            const newProduct = { name: 'Test Product' }; // Missing price and image
            
            const response = await request(app).post('/api/products').send(newProduct);
            
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
        
        it('should return all products', async () => {
            await Product.create({ name: 'Product 1', price: 10, image: 'img1.jpg' });
            await Product.create({ name: 'Product 2', price: 20, image: 'img2.jpg' });
            
            const response = await request(app).get('/api/products');
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(2);
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should update an existing product', async () => {
            const product = await Product.create({ name: 'Old Product', price: 10, image: 'old.jpg' });
            
            const response = await request(app).put(`/api/products/${product._id}`).send({ name: 'Updated Product' });
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Product');
        });
        
        it('should return 404 for an invalid ID format', async () => {
            const response = await request(app).put('/api/products/123').send({ name: 'Updated' });
            
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid Product Id');
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete an existing product', async () => {
            const product = await Product.create({ name: 'Product to delete', price: 10, image: 'del.jpg' });
            
            const response = await request(app).delete(`/api/products/${product._id}`);
            
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Product deleted');
            
            const checkProduct = await Product.findById(product._id);
            expect(checkProduct).toBeNull();
        });
        
        it('should return 404 for an invalid ID format', async () => {
            const response = await request(app).delete('/api/products/123');
            
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Invalid Product Id');
        });
    });

});
