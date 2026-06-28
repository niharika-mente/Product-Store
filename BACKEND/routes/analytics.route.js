import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import {
  getSummary,
  getMonthlyRevenue,
  getTopProducts,
  getUserGrowth,
  exportAnalytics,
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get('/summary', getSummary);
router.get('/revenue', getMonthlyRevenue);
router.get('/top-products', getTopProducts);
router.get('/user-growth', getUserGrowth);
router.get('/export', exportAnalytics);

export default router;
