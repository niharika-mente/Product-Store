import mongoose from 'mongoose';
import Review from '../models/review.model.js';
import Product from '../models/product.model.js';
import { AppError } from '../middleware/errorMiddleware.js';

const recalcProductRating = async (productId) => {
    const stats = await Review.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId)
            }
        },
        {
            $group: {
                _id: null,
                reviewCount: { $sum: 1 },
                averageRating: { $avg: '$rating' }
            }
        }
    ]);

    const reviewCount = stats[0]?.reviewCount || 0;

    const averageRating = stats[0]
        ? Math.round(stats[0].averageRating * 10) / 10
        : 0;

    await Product.findByIdAndUpdate(productId, {
        averageRating,
        reviewCount
    });
};

export const addReview = async (req, res, next) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const userId = req.user.id;
    const userName = req.user.name;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new AppError('Invalid product ID', 404));
    }

    if (!rating || !comment) {
        return next(new AppError('Rating and comment are required', 400));
    }

    if (rating < 1 || rating > 5) {
        return next(new AppError('Rating must be between 1 and 5', 400));
    }

    try {
        const product = await Product.findOne({
            _id: productId,
            isDeleted: { $ne: true }
        });

        if (!product) {
            return next(new AppError('Product not found', 404));
        }

        const existing = await Review.findOne({
            product: productId,
            userId
        });

        if (existing) {
            return next(new AppError('You have already reviewed this product', 400));
        }

        const review = await Review.create({
            product: productId,
            userId,
            userName,
            rating,
            comment
        });

        await recalcProductRating(productId);

        return res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        return next(error);
    }
};

export const updateReview = async (req, res, next) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return next(new AppError('Invalid review ID', 404));
    }

    try {
        const review = await Review.findById(reviewId);

        if (!review) {
            return next(new AppError('Review not found', 404));
        }

        if (review.userId.toString() !== req.user.id.toString()) {
            return next(new AppError('You can only edit your own reviews', 403));
        }

        if (rating && (rating < 1 || rating > 5)) {
            return next(new AppError('Rating must be between 1 and 5', 400));
        }

        const updated = await Review.findByIdAndUpdate(
            reviewId,
            { ...(rating && { rating }), ...(comment && { comment: comment.trim() }) },
            { new: true, runValidators: true }
        );

        await recalcProductRating(review.product);

        return res.status(200).json({ success: true, data: updated });
    } catch (error) {
        return next(error);
    }
};

export const deleteReview = async (req, res, next) => {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        return next(new AppError('Invalid review ID', 404));
    }

    try {
        const review = await Review.findById(reviewId);

        if (!review) {
            return next(new AppError('Review not found', 404));
        }

        if (review.userId.toString() !== req.user.id.toString()) {
            return next(new AppError('You can only delete your own reviews', 403));
        }

        await Review.findByIdAndDelete(reviewId);
        await recalcProductRating(review.product);

        return res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        return next(error);
    }
};

export const getReviews = async (req, res, next) => {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new AppError('Invalid product ID', 404));
    }

    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5;
        const sort = req.query.sort || 'newest';
        const star = parseInt(req.query.star, 10);

        if (page < 1 || limit < 1 || limit > 50) {
            return next(new AppError('Invalid pagination parameters. page and limit must be positive integers (limit max 50).', 400));
        }

        const filter = { product: productId };
        if (star >= 1 && star <= 5) {
            filter.rating = star;
        }

        let sortOption;
        if (sort === 'highest') sortOption = { rating: -1, createdAt: -1 };
        else if (sort === 'lowest') sortOption = { rating: 1, createdAt: -1 };
        else sortOption = { createdAt: -1 };

        const skip = (page - 1) * limit;

        const [reviews, totalReviews, distribution] = await Promise.all([
            Review.find(filter).sort(sortOption).skip(skip).limit(limit),
            Review.countDocuments(filter),
            Review.aggregate([
                { $match: { product: new mongoose.Types.ObjectId(productId) } },
                {
                    $group: {
                        _id: '$rating',
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const distMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach((d) => { distMap[d._id] = d.count; });

        const totalAll = Object.values(distMap).reduce((a, b) => a + b, 0);
        const averageRating = totalAll > 0
            ? Math.round(
                (Object.entries(distMap).reduce((sum, [star, count]) => sum + Number(star) * count, 0) / totalAll) * 10,
              ) / 10
            : 0;

        const totalPages = totalReviews > 0 ? Math.ceil(totalReviews / limit) : 0;

        return res.status(200).json({
            success: true,
            currentPage: page,
            totalPages,
            totalReviews,
            totalAll,
            limit,
            averageRating,
            distribution: distMap,
            data: reviews,
        });
    } catch (error) {
        return next(error);
    }
};
