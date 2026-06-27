import express from "express";
import { applyPromo } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/apply-promo", applyPromo);

export default router;