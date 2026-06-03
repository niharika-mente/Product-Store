
import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { AppError } from "../middleware/errorMiddleware.js";


export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};


export const createProduct = async (req, res, next) => {
  const product = req.body;

  // Basic validation - Missing fields
  if (!product.name || !product.price || !product.image) {
    return next(new AppError("Please provide all fields: name, price, image", 400));
  }

  // Price validation (extra check)
  if (product.price < 0) {
    return next(new AppError("Price cannot be negative", 400));
  }

  const newProduct = new Product(product);

  try {
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    next(error);
  }
};


export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const product = req.body;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid Product Id format", 404));
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, product, {
      new: true,
      runValidators: true  // Schema validation bhi run karo
    });

    if (!updatedProduct) {
      return next(new AppError("Product not found with this ID", 404));
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};


export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid Product Id format", 404));
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return next(new AppError("Product not found with this ID", 404));
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid Product Id format", 404));
  }

  try {
    const product = await Product.findById(id);
    
    if (!product) {
      return next(new AppError("Product not found with this ID", 404));
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};       