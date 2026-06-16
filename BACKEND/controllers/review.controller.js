import mongoose from 'mongoose';
import Review from '../models/review.model.js';
import Product from '../models/product.model.js';

const recalcProductRating = async (productId) => {
    const reviews = await Review.find({ product: productId });

    const count = reviews.length;

    const avg = count > 0
        ? Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10
        ) / 10
        : 0;

    await Product.findByIdAndUpdate(productId, {
        averageRating: avg,
        reviewCount: count
    });
};

export const addReview = async (req, res) => {
    const { productId } = req.params;  // ← FIXED: productId instead of id
    const { rating, comment } = req.body;

    const userId = req.user.id;
    const userName = req.user.name;

    if (!mongoose.Types.ObjectId.isValid(productId)) {  // ← FIXED
        return res.status(404).json({
            success: false,
            message: 'Invalid product ID'
        });
    }

    if (!rating || !comment) {
        return res.status(400).json({
            success: false,
            message: 'Rating and comment are required'
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            message: 'Rating must be between 1 and 5'
        });
    }

    const product = await Product.findOne({
        _id: productId,  // ← FIXED
        isDeleted: { $ne: true }
    });

    if (!product) {
        return res.status(404).json({
            success: false,
            message: 'Product not found'
        });
    }

    const existing = await Review.findOne({
        product: productId,  // ← FIXED
        userId
    });

    if (existing) {
        return res.status(400).json({
            success: false,
            message: 'You have already reviewed this product'
        });
    }

    try {
        const review = await Review.create({
            product: productId,  // ← FIXED
            userId,
            userName,
            rating,
            comment
        });

        await recalcProductRating(productId);  // ← FIXED

        return res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error adding review:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

export const getReviews = async (req, res) => {
    const { productId } = req.params;  // ← FIXED: productId instead of id

    if (!mongoose.Types.ObjectId.isValid(productId)) {  // ← FIXED
        return res.status(404).json({
            success: false,
            message: 'Invalid product ID'
        });
    }

    try {
        const reviews = await Review.find({
            product: productId  // ← FIXED
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: reviews
        });
    } catch (error) {
        console.error('Error fetching reviews:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};