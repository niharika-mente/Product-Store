import express from 'express';
import { addReview, getReviews, updateReview, deleteReview } from '../controllers/review.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/', getReviews);
router.post('/', addReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);

export default router;
