import express from "express";
import { processCheckout } from "../controllers/checkout.controller.js";

const router = express.Router();

router.post("/", processCheckout);

export default router;
