import express from 'express';
import { getDashboard, getLink, getHistory, getRewards, getAdminAnalytics } from '../controllers/referral.controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.get('/link', protect, getLink);
router.get('/history', protect, getHistory);
router.get('/rewards', protect, getRewards);
router.get('/admin/analytics', protect, admin, getAdminAnalytics);

export default router;
