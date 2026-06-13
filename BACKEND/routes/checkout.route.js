import express from "express";
import { processCheckout } from "../controllers/checkout.controller.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, processCheckout);

export default router;
