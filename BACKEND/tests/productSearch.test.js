import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import Product from '../models/product.model.js';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
}, 600000);

afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
    }
});

beforeEach(async () => {
    await Product.deleteMany({});
    await Product.create([
        { name: 'iPhone 15', description: 'Apple phone', brand: 'Apple', basePrice: 999, baseStock: 5 },
        { name: 'Galaxy S24', description: 'Samsung phone', brand: 'Samsung', basePrice: 899, baseStock: 5 },
        { name: 'Xperia 1', description: 'Sony phone', brand: 'Sony', basePrice: 799, baseStock: 5 },
        { name: 'No-brand gadget', description: 'Generic', basePrice: 50, baseStock: 5 },
    ]);
});

const brandsOf = (body) => body.data.map((p) => p.brand).sort();

describe('GET /api/products/search — filter by brands', () => {
    it('returns products matching ANY of multiple brands', async () => {
        const res = await request(app).get('/api/products/search?brands=Apple,Samsung');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(2);
        expect(brandsOf(res.body)).toEqual(['Apple', 'Samsung']);
    });

    it('filters by a single brand', async () => {
        const res = await request(app).get('/api/products/search?brands=Sony');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].brand).toBe('Sony');
    });

    it('matches brands case-insensitively', async () => {
        const res = await request(app).get('/api/products/search?brands=apple,SAMSUNG');

        expect(res.body.count).toBe(2);
        expect(brandsOf(res.body)).toEqual(['Apple', 'Samsung']);
    });

    it('trims whitespace around brand values', async () => {
        const res = await request(app).get('/api/products/search?brands=Apple%20,%20Samsung');

        expect(res.body.count).toBe(2);
        expect(brandsOf(res.body)).toEqual(['Apple', 'Samsung']);
    });

    it('ignores empty entries between commas', async () => {
        const res = await request(app).get('/api/products/search?brands=Apple,,,Sony');

        expect(res.body.count).toBe(2);
        expect(brandsOf(res.body)).toEqual(['Apple', 'Sony']);
    });

    it('returns all products when no brand filter is provided', async () => {
        const res = await request(app).get('/api/products/search');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(4);
    });

    it('returns all products when brands param is empty', async () => {
        const res = await request(app).get('/api/products/search?brands=');

        expect(res.body.count).toBe(4);
    });

    it('returns an empty result for an unknown brand', async () => {
        const res = await request(app).get('/api/products/search?brands=Nokia');

        expect(res.status).toBe(200);
        expect(res.body.count).toBe(0);
        expect(res.body.data).toEqual([]);
    });

    it('treats brand values literally (no regex injection)', async () => {
        // ".*" must not behave as a wildcard matching every brand.
        const res = await request(app).get('/api/products/search?brands=.*');

        expect(res.body.count).toBe(0);
    });

    it('combines brand filtering with a free-text name query', async () => {
        const res = await request(app).get('/api/products/search?brands=Apple,Samsung&q=galaxy');

        expect(res.body.count).toBe(1);
        expect(res.body.data[0].name).toBe('Galaxy S24');
    });
});
