import express from 'express';
import { addReview, getReviews } from '../controllers/review.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', getReviews);

// Only authenticated users can add reviews
router.post('/', authMiddleware, addReview);

export default router;