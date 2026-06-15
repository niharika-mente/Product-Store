import express from 'express';
import { getMyOrders } from '../controllers/orders.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyOrders);

export default router;
