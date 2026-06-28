import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.model.js";
import Product from "../models/product.model.js";
import { AppError } from "../middleware/errorMiddleware.js";

// Get the authenticated user's wishlist
export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
      "products"
    );

    if (!wishlist) {
      return res.status(200).json({ products: [] });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

// Add a product to the authenticated user's wishlist
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return next(new AppError("A valid productId is required", 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    // Atomic upsert scoped to the user: lazily creates the wishlist on first use
    // and never stores a duplicate product ($addToSet).
    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $addToSet: { products: productId } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("products");

    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

// Remove a product from the authenticated user's wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return next(new AppError("A valid productId is required", 400));
    }

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: productId } },
      { new: true }
    ).populate("products");

    if (!wishlist) {
      return next(new AppError("Wishlist not found", 404));
    }

    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};
