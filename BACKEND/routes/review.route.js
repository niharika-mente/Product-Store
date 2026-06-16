import express from 'express';
import { addReview, getReviews, updateReview, deleteReview } from '../controllers/review.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', getReviews);
router.post('/', addReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

// Only authenticated users can add reviews
router.post('/', authMiddleware, addReview);

export default router;