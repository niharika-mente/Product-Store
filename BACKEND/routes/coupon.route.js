import express from 'express';
import { validateCoupon, createCoupon, listCoupons, deactivateCoupon } from '../controllers/coupon.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admins only' });
  next();
};

const router = express.Router();

// Public: validate a coupon during checkout
router.post('/validate', validateCoupon);

// Admin: manage coupons
router.post('/', authMiddleware, isAdmin, createCoupon);
router.get('/', authMiddleware, isAdmin, listCoupons);
router.patch('/:code/deactivate', authMiddleware, isAdmin, deactivateCoupon);

export default router;
