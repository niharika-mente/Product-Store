import express from "express";
import { createCheckoutSession } from "../controllers/checkout.controller.js";
import { optionalProtect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", optionalProtect, createCheckoutSession);

export default router;
