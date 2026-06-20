import express from 'express';
import { getMyOrders, updateOrderStatus } from '../controllers/orders.controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyOrders);
router.put('/:orderId/status', protect, admin, updateOrderStatus);

export default router;
