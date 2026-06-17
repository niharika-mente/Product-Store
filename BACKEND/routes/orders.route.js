import express from 'express';
import { getMyOrders, updateOrderStatus } from '../controllers/orders.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyOrders);
// TODO: Use admin middleware for this route when available
router.put('/:orderId/status', protect, updateOrderStatus);

export default router;
