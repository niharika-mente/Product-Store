import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/WishlistController.controller.js";

const router = express.Router();

// Wishlists are per-user, so every route requires authentication.
router.get("/", protect, getWishlist);
router.post("/add", protect, addToWishlist);
router.delete("/remove/:productId", protect, removeFromWishlist);

export default router;