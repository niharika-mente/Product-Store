import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

describe('Security Headers (Helmet)', () => {
  afterAll(async () => {
    // Ensure MongoDB connection is closed after tests
    await mongoose.connection.close();
  });

  it('should set Content-Security-Policy header correctly', async () => {
    const res = await request(app).get('/api/non-existent-route-for-testing-headers-csp'); 
    expect(res.headers['content-security-policy']).toBeDefined();
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
    expect(res.headers['content-security-policy']).toContain("script-src 'self'");
  });

  it('should set basic helmet security headers on API routes', async () => {
    // Testing a general API endpoint, such as a non-existent one
    const res = await request(app).get('/api/non-existent-route-for-testing-headers');
    
    // Check for standard Helmet headers
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['strict-transport-security']).toBeDefined();
    expect(res.headers['x-download-options']).toBe('noopen');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-xss-protection']).toBe('0');
  });
});
