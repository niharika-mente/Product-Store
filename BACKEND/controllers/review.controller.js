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
    const { productId: id } = req.params;
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
    const { productId: id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: 'Invalid product ID' });
    }

    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 5;
        const sort = req.query.sort || 'newest';
        const star = parseInt(req.query.star, 10);

        if (page < 1 || limit < 1 || limit > 50) {
            return res.status(400).json({
                success: false,
                message: 'Invalid pagination parameters. page and limit must be positive integers (limit max 50).',
            });
        }

        const filter = { product: id };
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
                { $match: { product: new mongoose.Types.ObjectId(id) } },
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
        console.error('Error fetching reviews:', error.message);
        return res.status(500).json({ success: false, message: 'Server Error' });
    }
};
