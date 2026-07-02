import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';

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

// helmet is registered as global middleware in app.js, so every response -
// regardless of route - should carry the hardened security headers.
describe('Helmet security HTTP headers', () => {
    let res;

    beforeAll(async () => {
        res = await request(app).get('/api/products');
    });

    it('responds successfully so headers are asserted on a real route', () => {
        expect(res.status).toBe(200);
    });

    it('sets Content-Security-Policy reflecting the configured directives', () => {
        const csp = res.headers['content-security-policy'];
        expect(csp).toBeDefined();
        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("object-src 'none'");
        expect(csp).toContain("frame-ancestors 'self'");
        // Custom directives configured in app.js for the app's real asset hosts.
        expect(csp).toContain('https://res.cloudinary.com');
        expect(csp).toContain('https://fonts.googleapis.com');
    });

    it('disables MIME-type sniffing', () => {
        expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('prevents clickjacking via X-Frame-Options', () => {
        expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    it('enforces HSTS', () => {
        expect(res.headers['strict-transport-security']).toContain('max-age=');
    });

    it('sets a strict Referrer-Policy', () => {
        expect(res.headers['referrer-policy']).toBe('no-referrer');
    });

    it('restricts cross-origin resource sharing of responses', () => {
        expect(res.headers['cross-origin-resource-policy']).toBe('same-origin');
    });

    it('disables DNS prefetching', () => {
        expect(res.headers['x-dns-prefetch-control']).toBe('off');
    });

    it('hides the Express fingerprint (X-Powered-By)', () => {
        expect(res.headers['x-powered-by']).toBeUndefined();
    });
});

// helmet must be registered before the /graphql route, otherwise GraphQL
// responses bypass the security headers entirely.
describe('Helmet security headers on the /graphql route', () => {
    let res;

    beforeAll(async () => {
        res = await request(app).post('/graphql').send({ query: '{ __typename }' });
    });

    it('resolves the GraphQL request', () => {
        expect(res.status).toBe(200);
        expect(res.body.data.__typename).toBe('Query');
    });

    it('applies the security headers to GraphQL responses', () => {
        expect(res.headers['content-security-policy']).toBeDefined();
        expect(res.headers['x-content-type-options']).toBe('nosniff');
        expect(res.headers['strict-transport-security']).toContain('max-age=');
        expect(res.headers['x-powered-by']).toBeUndefined();
    });
});
