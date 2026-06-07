import Wishlist from "../models/Wishlist.model.js";
import Product from '../models/product.model.js';


// ✅ Get wishlist (single global wishlist)
export const getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne().populate("products");

    if (!wishlist) {
      return res.status(200).json({ products: [] });
    }

    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
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
    console.error("Add to wishlist error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    let wishlist = await Wishlist.findOne();

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );
    await wishlist.save();

    await wishlist.populate("products");
    res.status(200).json(wishlist);
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};