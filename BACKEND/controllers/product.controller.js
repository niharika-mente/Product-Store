import Product from "../models/product.model.js";
import mongoose from "mongoose";
import cloudinary from '../config/cloudinary.js';

const cloudinaryConfigured = () =>
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'product-store' },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

const extractCloudinaryPublicId = (url) => {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    const parts = url.split('/');
    const uploadIdx = parts.indexOf('upload');
    if (uploadIdx === -1) return null;
    const afterUpload = parts.slice(uploadIdx + 1);
    if (afterUpload[0] && /^v\d+$/.test(afterUpload[0])) afterUpload.shift();
    return afterUpload.join('/').replace(/\.[^.]+$/, '');
};

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

        const products = await Product.find({ isDeleted: { $ne: true } }).sort(sortOption);

        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error("Error in fetching products:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

export const createProduct = async (req, res) => {
    const { name, price, image: imageUrl, description, category, brand, stock, originalPrice, discount } = req.body;

    if (!name || price === undefined || price === null || price === '' || isNaN(Number(price))) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    let finalImageUrl = imageUrl || '';

    if (req.file) {
        if (!cloudinaryConfigured()) {
            return res.status(503).json({ success: false, message: "File uploads are not configured. Please use an image URL instead." });
        }
        try {
            const result = await uploadToCloudinary(req.file.buffer);
            finalImageUrl = result.secure_url;
        } catch (error) {
            console.error("Cloudinary upload error:", error.message);
            return res.status(500).json({ success: false, message: "Image upload failed" });
        }
    }

    if (!finalImageUrl) {
        return res.status(400).json({ success: false, message: "Please provide a product image" });
    }

    const newProduct = new Product({
        name,
        price: Number(price),
        image: finalImageUrl,
        description,
        category,
        brand,
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
        ...(discount !== undefined && { discount: Number(discount) }),
    });

    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error("Error in Create product:", error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    if ((!req.body || Object.keys(req.body).length === 0) && !req.file) {
        return res.status(400).json({ success: false, message: "No update fields provided" });
    }

    let existing;
    try {
        existing = await Product.findById(id);
    } catch (error) {
        console.error("Error fetching product:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
    if (!existing) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }

    const { name, price, image: imageUrl, description, category, brand, stock, originalPrice, discount } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) {
        if (price === '' || isNaN(Number(price))) {
            return res.status(400).json({ success: false, message: "Invalid price value" });
        }
        updateData.price = Number(price);
    }
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (discount !== undefined) updateData.discount = Number(discount);

    if (req.file) {
        if (!cloudinaryConfigured()) {
            return res.status(503).json({ success: false, message: "File uploads are not configured. Please use an image URL instead." });
        }
        try {
            const result = await uploadToCloudinary(req.file.buffer);
            updateData.image = result.secure_url;

            const oldPublicId = extractCloudinaryPublicId(existing.image);
            if (oldPublicId) {
                cloudinary.uploader.destroy(oldPublicId).catch((err) => {
                    console.warn("Old image cleanup failed:", err.message);
                });
            }
        } catch (error) {
            console.error("Cloudinary upload error:", error.message);
            return res.status(500).json({ success: false, message: "Image upload failed" });
        }
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error("Update error:", error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    try {
        const product = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error in deleting product:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    try {
        const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Error in fetching product:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getRelatedProducts = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    try {
        const product = await Product.findById(id);
        if (!product || product.isDeleted === true) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "of"]);
        const words = product.name
            .toLowerCase()
            .split(/\s+/)
            .map(w => w.replace(/[^a-z0-9]/g, ""))
            .filter(w => w.length > 1 && !stopWords.has(w));

        let related = [];
        if (words.length > 0) {
            const regexes = words.map(word => new RegExp(word, 'i'));
            related = await Product.find({
                _id: { $ne: product._id },
                name: { $in: regexes },
                isDeleted: { $ne: true }
            }).limit(5);
        }

        if (related.length < 4) {
            const excludeIds = [product._id, ...related.map(p => p._id)];
            const padding = await Product.find({
                _id: { $nin: excludeIds },
                isDeleted: { $ne: true }
            }).limit(5 - related.length);
            related = [...related, ...padding];
        }

        res.status(200).json({ success: true, data: related.slice(0, 5) });
    } catch (error) {
        console.error("Error in fetching related products:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const searchProducts = async (req, res) => {
    const { q } = req.query;
    try {
        const regex = new RegExp(q, 'i');
        const products = await Product.find({ name: regex });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error in searching products:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
