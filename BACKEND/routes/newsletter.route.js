import express from "express";
import { subscribeNewsletter } from "../controllers/newsletter.controller.js";
import { newsletterSubscribeLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/subscribe", newsletterSubscribeLimiter, subscribeNewsletter);

export default router;
