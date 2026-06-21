import express from 'express';
import { getMyOrders, downloadInvoice } from '../controllers/orders.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyOrders);
router.get('/:id/invoice', protect, downloadInvoice);

export default router;
