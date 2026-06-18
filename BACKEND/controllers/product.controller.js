import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { escapeRegex } from '../utils/escapeRegex.js';
import cloudinary from '../config/cloudinary.js';
import { AppError } from "../middleware/errorMiddleware.js";

export const getProducts = async (req, res) => {
    try {
        const { tags } = req.query;
        
        let query = {};
        
        // ─── TAG FILTER ─────────────────────────────────────────────
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagArray };
        }
        
        const products = await Product.find(query);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log("error in fetching products:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const createProduct = async (req, res) => {
    const product = req.body;

    if (!product.name || !product.price || !product.image) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    // ─── VALIDATE TAGS ─────────────────────────────────────────────
    if (product.tags && product.tags.length > 5) {
        return res.status(400).json({
            success: false,
            message: "Maximum 5 tags allowed per product"
        });
    }

    const newProduct = new Product(product);

    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error("Error in Create product:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const product = req.body;
    console.log("PUT Request ID:", id);
    console.log("PUT Request Body:", product);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    // ─── VALIDATE TAGS ON UPDATE ────────────────────────────────────
    if (product.tags && product.tags.length > 5) {
        return res.status(400).json({
            success: false,
            message: "Maximum 5 tags allowed per product"
        });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, { 
            new: true,
            runValidators: true 
        });
        
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    try {
        await Product.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Product deleted" });
    } catch (error) {
        console.log("error in deleting product:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ─── SEARCH PRODUCTS (INCLUDING TAGS) ────────────────────────────
export const searchProducts = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ success: false, message: "Search query required" });
    }

    try {
        const regex = new RegExp(q, 'i');
        
        const products = await Product.find({
            $or: [
                { name: regex },
                { tags: { $in: [regex] } }
            ]
        });
        
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error in searching products:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }

    try {
        const product = await Product.findById(id);

        if (!product || product.isDeleted === true) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const targetTagsSet = new Set((product.tags || []).map(t => t.toLowerCase()));
        const targetWords = new Set(tokenize(product.name));

        const orConditions = [];
        if (product.category) orConditions.push({ category: product.category });
        if (product.brand) orConditions.push({ brand: product.brand });
        if (targetTagsSet.size > 0) orConditions.push({ tags: { $in: [ ...targetTagsSet ] } });

        const query = {
            _id: { $ne: product._id },
            isDeleted: { $ne: true },
        };
        if (orConditions.length > 0) query.$or = orConditions;

        const candidates = await Product.find(query).sort({ updatedAt: -1 }).limit(50);

        const scored = candidates.map(c => {
            let score = 0;

            if (c.category && product.category &&
                c.category.toLowerCase() === product.category.toLowerCase()) {
                score += 3;
            }

            if (c.brand && product.brand &&
                c.brand.toLowerCase() === product.brand.toLowerCase()) {
                score += 1;
            }

            if (c.tags && c.tags.length > 0) {
                for (const tag of c.tags) {
                    if (targetTagsSet.has(tag.toLowerCase())) {
                        score += 2;
                    }
                }
            }

            const candidateWords = tokenize(c.name);
            for (const word of candidateWords) {
                if (targetWords.has(word)) {
                    score += 0.5;
                }
            }

            return { product: c, score };
        });

        scored.sort((a, b) => b.score - a.score);

        const related = scored.slice(0, 5).map(s => s.product);

        res.status(200).json({ success: true, data: related });
    } catch (error) {
        console.error("Error in getRelatedProducts:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getProductBundle = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Product Id" });
    }

    try {
        const product = await Product.findById(id).populate('complementaryItems.product');
        if (!product || product.isDeleted === true) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const items = product.complementaryItems
            .filter(ci => ci.product && !ci.product.isDeleted)
            .slice(0, 3);

        // product.controller.js  —  getProductBundle  (lines 366–371)

const bundleTotal = [product, ...items.map(i => i.product)]
    .reduce((sum, p) => sum + (Number(p?.price) || 0), 0);   // ← null-safe

const bundleDiscount = 0.1;
const bundlePrice = bundleTotal > 0
    ? +(bundleTotal * (1 - bundleDiscount)).toFixed(2)
    : 0;
const savings = bundleTotal > 0
    ? +(bundleTotal * bundleDiscount).toFixed(2)
    : 0;

        res.status(200).json({
            success: true,
            data: {
                mainProduct: product,
                items: items.map(ci => ({
                    product: ci.product,
                    reason: ci.reason
                })),
                bundleTotal,
                bundleDiscount,
                bundlePrice,
                savings
            }
        });
    } catch (error) {
        console.error("Error in fetching bundle:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Search products
export const searchProducts = async (req, res, next) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.status(400).json({ success: false, message: "Search query is required" });
    }

    try {
    const safeQuery = escapeRegex(q);
    const regex = new RegExp(safeQuery, 'i');
    const products = await Product.find({ name: regex, isDeleted: { $ne: true } });
    res.status(200).json({ success: true, data: products });
} catch (error) {
        next(error);
    }
};
