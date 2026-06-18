import express from "express";
import { createCheckoutSession } from "../controllers/checkout.controller.js";
import { optionalProtect } from "../middleware/auth.js";
import { checkoutLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/", checkoutLimiter, optionalProtect, createCheckoutSession);

export default router;
