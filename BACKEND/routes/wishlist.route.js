import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/WishlistController.controller.js";

const router = express.Router();

// ✅ No authentication middleware
router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.delete("/remove/:productId", removeFromWishlist);

export default router;