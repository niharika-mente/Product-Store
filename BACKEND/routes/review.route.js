import express from 'express';
import { addReview, getReviews, updateReview, deleteReview } from '../controllers/review.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', getReviews);
router.post('/', authMiddleware, addReview);
router.put('/:reviewId', authMiddleware, updateReview);
router.delete('/:reviewId', authMiddleware, deleteReview);

export default router;