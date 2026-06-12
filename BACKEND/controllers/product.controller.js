import Product from "../models/product.model.js";
import mongoose from "mongoose";

export const getProducts = async (req, res) => {
  try {
    const { sort } = req.query;

    let sortOption = {};

    if (sort === "price_asc") {
      sortOption = { price: 1 };
    } else if (sort === "price_desc") {
      sortOption = { price: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    const products = await Product.find({
      isDeleted: { $ne: true },
    }).sort(sortOption);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error in fetching products:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const createProduct = async (req, res) => {
  const product = req.body;

  if (!product.name || !product.price || !product.image) {
    return res.status(400).json({
      success: false,
      message: "Please provide all fields",
    });
  }

  try {
    const newProduct = new Product(product);

    await newProduct.save();

    res.status(201).json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error("Error in Create product:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      success: false,
      message: "Invalid Product Id",
    });
  }

  if (!product || Object.keys(product).length === 0) {
    return res.status(400).json({
      success: false,
      message: "No update fields provided",
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, product, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Error in Update product:", error.message);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      success: false,
      message: "Invalid Product Id",
    });
  }

  try {
    await Product.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleting product:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      success: false,
      message: "Invalid Product Id",
    });
  }

  try {
    const product = await Product.findOne({
      _id: id,
      isDeleted: { $ne: true },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error in fetching product:", error.message);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getRelatedProducts = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      success: false,
      message: "Invalid Product Id",
    });
  }

  try {
    const product = await Product.findById(id);

    if (!product || product.isDeleted === true) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "with",
      "of",
    ]);

    const words = product.name
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z0-9]/g, ""))
      .filter((w) => w.length > 1 && !stopWords.has(w));

    let related = [];

    if (words.length > 0) {
      const regexes = words.map((word) => new RegExp(word, "i"));

      related = await Product.find({
        _id: { $ne: product._id },
        name: { $in: regexes },
        isDeleted: { $ne: true },
      }).limit(5);
    }

    if (related.length < 4) {
      const excludeIds = [
        product._id,
        ...related.map((p) => p._id),
      ];

      const padding = await Product.find({
        _id: { $nin: excludeIds },
        isDeleted: { $ne: true },
      }).limit(5 - related.length);

      related = [...related, ...padding];
    }

    res.status(200).json({
      success: true,
      data: related.slice(0, 5),
    });
  } catch (error) {
    console.error(
      "Error in fetching related products:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const searchProducts = async (req, res) => {
  const { q } = req.query;

  try {
    const regex = new RegExp(q, "i");

    const products = await Product.find({
      name: regex,
      isDeleted: { $ne: true },
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(
      "Error in searching products:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};