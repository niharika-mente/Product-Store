import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { escapeRegex } from '../utils/escapeRegex.js';
import cloudinary from '../config/cloudinary.js';
import { AppError } from "../middleware/errorMiddleware.js";
import { indexProduct, deleteProductFromIndex, searchProductsES } from '../services/elasticsearch.service.js';
import redis from '../config/redis.js';

const CACHE_TTL = 300; // seconds

function buildCacheKey(query) {
    const sorted = Object.keys(query).sort().reduce((acc, k) => { acc[k] = query[k]; return acc; }, {});
    return `products:list:${JSON.stringify(sorted)}`;
}

async function invalidateProductCache() {
    if (!redis) return;
    try {
        const keys = await redis.keys('products:*');
        if (keys.length) await redis.del(...keys);
    } catch (err) {
        console.warn('[Redis] Cache invalidation error:', err.message);
    }
}

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

// @desc    Get all products
export const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const { sort, category, minPrice, maxPrice, brand, minRating, inStock } = req.query;

        if (page < 1 || limit < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid pagination parameters. page and limit must be positive integers.",
            });
        }

        // Check Redis cache first
        const cacheKey = buildCacheKey(req.query);
        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    return res.status(200).json(JSON.parse(cached));
                }
            } catch (err) {
                console.warn('[Redis] Cache read error:', err.message);
            }
        }

        let sortOption = {};
        if (sort === "price_asc") {
            sortOption = { price: 1 };
        } else if (sort === "price_desc") {
            sortOption = { price: -1 };
        } else if (sort === "newest") {
            sortOption = { createdAt: -1 };
        }

        const filter = { isDeleted: { $ne: true } };
        if (category) filter.category = category;

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }
        if (brand) {
            // Case-insensitive brand search
            filter.brand = { $regex: new RegExp(brand, 'i') };
        }
        if (minRating) {
            filter.averageRating = { $gte: Number(minRating) };
        }
        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        }

        const skip = (page - 1) * limit;
        const totalProducts = await Product.countDocuments(filter);
        const products = await Product.find(filter).sort(sortOption).skip(skip).limit(limit);
        const totalPages = totalProducts > 0 ? Math.ceil(totalProducts / limit) : 0;

        const result = {
            success: true,
            currentPage: page,
            totalPages,
            totalProducts,
            limit,
            data: products,
        };

        // Store in Redis cache
        if (redis) {
            try {
                await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
            } catch (err) {
                console.warn('[Redis] Cache write error:', err.message);
            }
        }

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// @desc    Get distinct product categories
export const getProductCategories = async (req, res, next) => {
    try {
        const categories = await Product.distinct('category', { isDeleted: { $ne: true }, category: { $ne: '' } });
        res.status(200).json({ success: true, data: categories.sort() });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product
export const createProduct = async (req, res, next) => {
    const { name, price, image: imageUrl, description, category, brand, stock, originalPrice, discount } = req.body;

    if (!name || price === undefined || price === null || price === '' || isNaN(Number(price))) {
        return next(new AppError("Please provide all fields", 400));
    }

    if (Number(price) < 0) {
        return next(new AppError("Price cannot be negative", 400));
    }

    let finalImageUrl = imageUrl || '';

    if (req.file) {
        if (!cloudinaryConfigured()) {
            return next(new AppError("File uploads are not configured. Please use an image URL instead.", 503));
        }
        try {
            const result = await uploadToCloudinary(req.file.buffer);
            finalImageUrl = result.secure_url;
        } catch (error) {
            return next(new AppError("Image upload failed", 500));
        }
    }

    if (!finalImageUrl) {
        return next(new AppError("Please provide a product image", 400));
    }

    const newProduct = new Product({
        name,
        price: Number(price),
        image: finalImageUrl,
        images: Array.isArray(req.body.images) ? req.body.images : [],
        description,
        category,
        brand,
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
        ...(discount !== undefined && { discount: Number(discount) }),
    });

    try {
        await newProduct.save();
        await indexProduct(newProduct);
        await invalidateProductCache();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a product
export const updateProduct = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid Product Id format", 404));
    }

    if ((!req.body || Object.keys(req.body).length === 0) && !req.file) {
        return next(new AppError("No update fields provided", 400));
    }

    let existing;
    try {
        existing = await Product.findById(id);
    } catch (error) {
        return next(error);
    }
    if (!existing) {
        return next(new AppError("Product not found", 404));
    }

    const { name, price, image: imageUrl, description, category, brand, stock, originalPrice, discount } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) {
        if (price === '' || isNaN(Number(price))) {
            return next(new AppError("Invalid price value", 400));
        }
        updateData.price = Number(price);
    }
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (req.body.images !== undefined) updateData.images = Array.isArray(req.body.images) ? req.body.images : [];
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (discount !== undefined) updateData.discount = Number(discount);

    if (req.file) {
        if (!cloudinaryConfigured()) {
            return next(new AppError("File uploads are not configured. Please use an image URL instead.", 503));
        }
        try {
            const result = await uploadToCloudinary(req.file.buffer);
            updateData.image = result.secure_url;

        } catch (error) {
            return next(new AppError("Image upload failed", 500));
        }
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!updatedProduct) {
            return next(new AppError("Product not found", 404));
        }
        if (req.file){
            const oldPublicId = extractCloudinaryPublicId(existing.image);
                if (oldPublicId) {
                    cloudinary.uploader.destroy(oldPublicId).catch((err) => {
                        console.warn("Old image cleanup failed:", err.message);
                    });
                }
        }

        await indexProduct(updatedProduct);
        await invalidateProductCache();

        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        next(error);
    }
};

// @desc    Restock a product by incrementing its stock
export const restockProduct = async (req, res, next) => {
    const { id } = req.params;
    const { amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid Product Id format", 404));
    }

    if (typeof amount !== 'number' || !Number.isInteger(amount) || amount <= 0) {
        return next(new AppError("Restock amount must be a positive integer", 400));
    }

    try {
        const product = await Product.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            { $inc: { stock: amount } },
            { new: true, runValidators: true }
        );
        if (!product) return next(new AppError("Product not found", 404));
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a product (soft delete)
export const deleteProduct = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    try {
        const product = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        await deleteProductFromIndex(id);
        await invalidateProductCache();
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.log("error in deleting product:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get product by ID
export const getProductById = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid Product Id format", 404));
    }

    try {
        const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } });
        if (!product) {
            return next(new AppError("Product not found", 404));
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        next(error);
    }
};

const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "of"]);

function tokenize(text) {
    return text
        .toLowerCase()
        .split(/\s+/)
        .map(w => w.replace(/[^a-z0-9]/g, ""))
        .filter(w => w.length > 1 && !stopWords.has(w));
}

export const getRelatedProducts = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Product Id format" });
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
                    if (targetTags.has(tag.toLowerCase())) {
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

        const bundleTotal = [product, ...items.map(i => i.product)]
            .reduce((sum, p) => sum + p.price, 0);

        const bundleDiscount = 0.1;
        const bundlePrice = +(bundleTotal * (1 - bundleDiscount)).toFixed(2);
        const savings = +(bundleTotal * bundleDiscount).toFixed(2);

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
        // Try Elasticsearch first
        const esProducts = await searchProductsES(q);
        if (esProducts) {
            return res.status(200).json({ success: true, data: esProducts });
        }

        // Fallback to MongoDB regex search
        const safeQuery = escapeRegex(q);
        const regex = new RegExp(safeQuery, 'i');
        const products = await Product.find({ name: regex, isDeleted: { $ne: true } });
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        next(error);
    }
};
