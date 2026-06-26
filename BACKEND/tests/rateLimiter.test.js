import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/user.model.js';

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
    await User.deleteMany({});
});

// The app trusts the first proxy hop (app.set("trust proxy", 1)), so the
// X-Forwarded-For header drives req.ip. Giving each test a unique source IP
// keeps the in-memory rate-limit buckets isolated from one another.
const LOGIN_URL = '/api/auth/login';
const LIMIT = 5;

describe('Login rate limiter', () => {
    it('allows up to 5 login attempts within the window', async () => {
        const ip = '10.0.0.1';

        for (let attempt = 1; attempt <= LIMIT; attempt++) {
            const response = await request(app)
                .post(LOGIN_URL)
                .set('X-Forwarded-For', ip)
                .send({ email: 'nobody@example.com', password: 'wrong-password' });

            expect(response.status).not.toBe(429);
        }
    });

    it('blocks the 6th login attempt with 429 from the same IP', async () => {
        const ip = '10.0.0.2';

        for (let attempt = 1; attempt <= LIMIT; attempt++) {
            await request(app)
                .post(LOGIN_URL)
                .set('X-Forwarded-For', ip)
                .send({ email: 'nobody@example.com', password: 'wrong-password' });
        }

        const blocked = await request(app)
            .post(LOGIN_URL)
            .set('X-Forwarded-For', ip)
            .send({ email: 'nobody@example.com', password: 'wrong-password' });

        expect(blocked.status).toBe(429);
        expect(blocked.body.success).toBe(false);
        expect(blocked.body.message).toMatch(/too many login attempts/i);
    });

    it('exposes the configured limit of 5 via standard RateLimit headers', async () => {
        const ip = '10.0.0.3';

        const response = await request(app)
            .post(LOGIN_URL)
            .set('X-Forwarded-For', ip)
            .send({ email: 'nobody@example.com', password: 'wrong-password' });

        // The login limiter uses standardHeaders, exposing the cap of 5.
        expect(response.headers['ratelimit-limit']).toBe(String(LIMIT));
    });

    it('tracks limits independently per IP address', async () => {
        const exhaustedIp = '10.0.0.4';
        const freshIp = '10.0.0.5';

        for (let attempt = 1; attempt <= LIMIT + 1; attempt++) {
            await request(app)
                .post(LOGIN_URL)
                .set('X-Forwarded-For', exhaustedIp)
                .send({ email: 'nobody@example.com', password: 'wrong-password' });
        }

        // A different IP must still be served — limits are per-IP, not global.
        const fresh = await request(app)
            .post(LOGIN_URL)
            .set('X-Forwarded-For', freshIp)
            .send({ email: 'nobody@example.com', password: 'wrong-password' });

        expect(fresh.status).not.toBe(429);
    });
});
