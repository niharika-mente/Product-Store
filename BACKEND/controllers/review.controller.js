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

export const updateReview = async (req, res) => {
    const { reviewId } = req.params;
    const { userName, rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(404).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userName !== userName?.trim()) {
        return res.status(403).json({ success: false, message: 'You can only edit your own reviews' });
    }

    if (rating && (rating < 1 || rating > 5)) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    try {
        const updated = await Review.findByIdAndUpdate(
            reviewId,
            { ...(rating && { rating }), ...(comment && { comment: comment.trim() }) },
            { new: true, runValidators: true }
        );
        await recalcProductRating(review.product);
        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating review:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const deleteReview = async (req, res) => {
    const { reviewId } = req.params;
    const { userName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(404).json({ success: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.userName !== userName?.trim()) {
        return res.status(403).json({ success: false, message: 'You can only delete your own reviews' });
    }

    try {
        await Review.findByIdAndDelete(reviewId);
        await recalcProductRating(review.product);
        return res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error.message);
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
