import Wishlist from "../models/Wishlist.model.js";
import Product from "../models/product.model.js";
import { AppError } from "../middleware/errorMiddleware.js";

// ✅ Get wishlist (single global wishlist)
export const getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne().populate("products");

    if (!wishlist) {
      return res.status(200).json({ products: [] });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

// ✅ Add product to wishlist
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    let wishlist = await Wishlist.findOne();

    if (!wishlist) {
      wishlist = await Wishlist.create({
        products: [productId],
      });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }
    }

    await wishlist.populate("products");
    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

// ✅ Remove product from wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne();

    if (!wishlist) {
      return next(new AppError("Wishlist not found", 404));
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();
    await wishlist.populate("products");

    res.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};