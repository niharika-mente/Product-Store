import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { MongoMemoryServer } from "mongodb-memory-server";

import User from "../models/user.model.js";
import { loginUser } from "../controllers/auth.controller.js";
import {
  setupTwoFactor,
  verifyTwoFactorSetup,
  disableTwoFactor,
} from "../controllers/twoFactor.controller.js";
import { generateTOTP } from "../services/totp.service.js";

// The 2FA controllers are exercised directly (not through app.js) so the suite
// owns its own in-memory MongoDB without app.js's import-time connectDB()
// fighting it for the connection. authMiddleware is bypassed by passing req.user
// — the logic under test is the controller + login flow, not the JWT guard.

let mongoServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "test-secret";
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 600000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

const createUser = async () => {
  const password = await bcrypt.hash("password123", 10);
  return User.create({ name: "Jane", email: "jane@example.com", password });
};

// A syntactically valid id that doesn't correspond to any user.
const missingId = () => new mongoose.Types.ObjectId();

// Reads the (select:false) secret stashed during setup straight from the DB.
const readSecret = async (id, field) => {
  const user = await User.findById(id).select(`+${field}`);
  return user[field];
};

describe("POST /2fa/setup", () => {
  it("issues a pending secret and otpauth URL without enabling 2FA yet", async () => {
    const user = await createUser();
    const res = mockRes();

    await setupTwoFactor({ user: { id: user._id } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.secret).toEqual(expect.any(String));
    expect(res.body.otpauthUrl).toContain("otpauth://totp/");

    const fresh = await User.findById(user._id);
    expect(fresh.twoFactorEnabled).toBe(false);
    expect(await readSecret(user._id, "twoFactorTempSecret")).toBe(res.body.secret);
  });

  it("refuses when 2FA is already enabled", async () => {
    const user = await createUser();
    user.twoFactorEnabled = true;
    await user.save();
    const res = mockRes();

    await setupTwoFactor({ user: { id: user._id } }, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 when the user no longer exists", async () => {
    const res = mockRes();
    await setupTwoFactor({ user: { id: missingId() } }, res);
    expect(res.statusCode).toBe(404);
  });
});

describe("POST /2fa/verify", () => {
  it("enables 2FA when the first code is correct and promotes the secret", async () => {
    const user = await createUser();
    await setupTwoFactor({ user: { id: user._id } }, mockRes());
    const secret = await readSecret(user._id, "twoFactorTempSecret");

    const res = mockRes();
    await verifyTwoFactorSetup(
      { user: { id: user._id }, body: { token: generateTOTP(secret) } },
      res
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const fresh = await User.findById(user._id);
    expect(fresh.twoFactorEnabled).toBe(true);
    expect(await readSecret(user._id, "twoFactorSecret")).toBe(secret);
    expect(await readSecret(user._id, "twoFactorTempSecret")).toBeNull();
  });

  it("rejects an incorrect code and leaves 2FA disabled", async () => {
    const user = await createUser();
    await setupTwoFactor({ user: { id: user._id } }, mockRes());

    const res = mockRes();
    await verifyTwoFactorSetup({ user: { id: user._id }, body: { token: "000000" } }, res);

    expect(res.statusCode).toBe(400);
    expect((await User.findById(user._id)).twoFactorEnabled).toBe(false);
  });

  it("requires a token in the body", async () => {
    const user = await createUser();
    const res = mockRes();
    await verifyTwoFactorSetup({ user: { id: user._id }, body: {} }, res);
    expect(res.statusCode).toBe(400);
  });

  it("rejects verification when no setup is pending", async () => {
    const user = await createUser();
    const res = mockRes();
    await verifyTwoFactorSetup({ user: { id: user._id }, body: { token: "123456" } }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/no pending/i);
  });

  it("returns 404 when the user no longer exists", async () => {
    const res = mockRes();
    await verifyTwoFactorSetup({ user: { id: missingId() }, body: { token: "123456" } }, res);
    expect(res.statusCode).toBe(404);
  });
});

describe("login with 2FA enabled", () => {
  // Enables 2FA for the user and returns the active secret.
  const enable2FA = async (user) => {
    await setupTwoFactor({ user: { id: user._id } }, mockRes());
    const secret = await readSecret(user._id, "twoFactorTempSecret");
    await verifyTwoFactorSetup(
      { user: { id: user._id }, body: { token: generateTOTP(secret) } },
      mockRes()
    );
    return secret;
  };

  it("issues a token directly when 2FA is not enabled", async () => {
    await createUser();
    const res = mockRes();
    await loginUser({ body: { email: "jane@example.com", password: "password123" } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.twoFactorRequired).toBeUndefined();
  });

  it("withholds the token and asks for a code when 2FA is enabled", async () => {
    const user = await createUser();
    await enable2FA(user);

    const res = mockRes();
    await loginUser({ body: { email: "jane@example.com", password: "password123" } }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body.twoFactorRequired).toBe(true);
    expect(res.body.token).toBeUndefined();
  });

  it("issues a token when a valid code accompanies the password", async () => {
    const user = await createUser();
    const secret = await enable2FA(user);

    const res = mockRes();
    await loginUser(
      {
        body: {
          email: "jane@example.com",
          password: "password123",
          token: generateTOTP(secret),
        },
      },
      res
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it("rejects login when the 2FA code is wrong", async () => {
    const user = await createUser();
    await enable2FA(user);

    const res = mockRes();
    await loginUser(
      {
        body: { email: "jane@example.com", password: "password123", token: "000000" },
      },
      res
    );

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /2fa/disable", () => {
  const enable2FA = async (user) => {
    await setupTwoFactor({ user: { id: user._id } }, mockRes());
    const secret = await readSecret(user._id, "twoFactorTempSecret");
    await verifyTwoFactorSetup(
      { user: { id: user._id }, body: { token: generateTOTP(secret) } },
      mockRes()
    );
    return secret;
  };

  it("disables 2FA and clears secrets when given a valid code", async () => {
    const user = await createUser();
    const secret = await enable2FA(user);

    const res = mockRes();
    await disableTwoFactor({ user: { id: user._id }, body: { token: generateTOTP(secret) } }, res);

    expect(res.statusCode).toBe(200);
    const fresh = await User.findById(user._id);
    expect(fresh.twoFactorEnabled).toBe(false);
    expect(await readSecret(user._id, "twoFactorSecret")).toBeNull();
  });

  it("refuses to disable without a valid code", async () => {
    const user = await createUser();
    await enable2FA(user);

    const res = mockRes();
    await disableTwoFactor({ user: { id: user._id }, body: { token: "000000" } }, res);

    expect(res.statusCode).toBe(400);
    expect((await User.findById(user._id)).twoFactorEnabled).toBe(true);
  });

  it("refuses when 2FA is not enabled", async () => {
    const user = await createUser();
    const res = mockRes();
    await disableTwoFactor({ user: { id: user._id }, body: { token: "123456" } }, res);
    expect(res.statusCode).toBe(400);
  });

  it("requires a token once 2FA is enabled", async () => {
    const user = await createUser();
    await enable2FA(user);
    const res = mockRes();
    await disableTwoFactor({ user: { id: user._id }, body: {} }, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("returns 404 when the user no longer exists", async () => {
    const res = mockRes();
    await disableTwoFactor({ user: { id: missingId() }, body: { token: "123456" } }, res);
    expect(res.statusCode).toBe(404);
  });
});
