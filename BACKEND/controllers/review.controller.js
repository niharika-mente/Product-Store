import mongoose from 'mongoose';
import Review from '../models/review.model.js';
import Product from '../models/product.model.js';

const recalcProductRating = async (productId) => {
    const reviews = await Review.find({ product: productId });
    const count = reviews.length;
    const avg = count > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10) / 10
        : 0;
    await Product.findByIdAndUpdate(productId, { averageRating: avg, reviewCount: count });
};

export const addReview = async (req, res) => {
    const { id } = req.params;
    const { userName, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: 'Invalid product ID' });
    }

    if (!userName || !rating || !comment) {
        return res.status(400).json({ success: false, message: 'Name, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await Review.findOne({ product: id, userName: userName.trim() });
    if (existing) {
        return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    try {
        const review = await Review.create({ product: id, userName, rating, comment });
        await recalcProductRating(id);
        return res.status(201).json({ success: true, data: review });
    } catch (error) {
        console.error('Error adding review:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getReviews = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: 'Invalid product ID' });
    }

    try {
        const reviews = await Review.find({ product: id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        console.error('Error fetching reviews:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};
