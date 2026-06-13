import express from 'express';
import { addReview, getReviews } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', getReviews);
router.post('/', protect, addReview);

export default router;
