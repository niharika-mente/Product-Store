import express from "express";
import { createCheckoutSession } from "../controllers/checkout.controller.js";

const router = express.Router();

router.post("/", createCheckoutSession);

export default router;
