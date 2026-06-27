import Coupon from "../models/coupon.model.js";

export const applyPromo = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon code",
      });
    }

    // reuse existing validation logic
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to apply promo code",
    });
  }
};
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

exports.addToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.hasVariants) {
      const variant = product.variants.id(variantId);
      if (!variant) return res.status(404).json({ message: "Variant not found" });
      if (variant.stock < quantity) return res.status(400).json({ message: "Insufficient variant stock" });
    } else {
      if (product.baseStock < quantity) return res.status(400).json({ message: "Insufficient base stock" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const itemIndex = cart.items.findIndex(item => 
      item.productId.toString() === productId && 
      (!variantId || (item.variantId && item.variantId.toString() === variantId))
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, variantId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
