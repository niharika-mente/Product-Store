import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import Coupon from "../models/coupon.model.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 600000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Coupon.deleteMany({});
});

describe("Coupon Validation API", () => {
  it("should validate a percentage coupon", async () => {
    await Coupon.create({
      code: "SAVE10",
      type: "percentage",
      value: 10,
      isActive: true,
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .send({
        code: "SAVE10",
        orderTotal: 100,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.discount).toBe(10);
    expect(response.body.data.finalTotal).toBe(90);
  });

  it("should validate a flat coupon", async () => {
    await Coupon.create({
      code: "FLAT20",
      type: "flat",
      value: 20,
      isActive: true,
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .send({
        code: "FLAT20",
        orderTotal: 100,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.discount).toBe(20);
    expect(response.body.data.finalTotal).toBe(80);
  });

  it("should return 400 when code is missing", async () => {
    const response = await request(app)
      .post("/api/coupons/validate")
      .send({
        orderTotal: 100,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should return 404 for invalid coupon", async () => {
    const response = await request(app)
      .post("/api/coupons/validate")
      .send({
        code: "INVALID",
        orderTotal: 100,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it("should reject expired coupon", async () => {
    await Coupon.create({
      code: "EXPIRED",
      type: "percentage",
      value: 10,
      expiresAt: new Date(Date.now() - 86400000),
      isActive: true,
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .send({
        code: "EXPIRED",
        orderTotal: 100,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject coupon that reached usage limit", async () => {
    await Coupon.create({
      code: "LIMITED",
      type: "percentage",
      value: 10,
      maxUses: 1,
      usedCount: 1,
      isActive: true,
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .send({
        code: "LIMITED",
        orderTotal: 100,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should reject when minimum order amount is not met", async () => {
    await Coupon.create({
      code: "MIN100",
      type: "percentage",
      value: 10,
      minOrderAmount: 100,
      isActive: true,
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .send({
        code: "MIN100",
        orderTotal: 50,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Minimum order amount");
  });

  it("should not allow flat discount greater than order total", async () => {
    await Coupon.create({
      code: "FLAT500",
      type: "flat",
      value: 500,
      isActive: true,
    });

    const response = await request(app)
      .post("/api/coupons/validate")
      .send({
        code: "FLAT500",
        orderTotal: 100,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.discount).toBe(100);
    expect(response.body.data.finalTotal).toBe(0);
  });
});