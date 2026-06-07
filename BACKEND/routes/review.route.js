import express from 'express';
import { addReview, getReviews } from '../controllers/review.controller.js';

const router = express.Router({ mergeParams: true });

router.get('/', getReviews);
router.post('/', addReview);

export default router;
