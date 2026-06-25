import express from 'express';
import {
  createReturnRequest,
  getMyReturnRequests,
  getAllReturnRequests,
  updateReturnStatus,
} from '../controllers/return.controller.js';
import { protect, adminProtect } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', protect, createReturnRequest);
router.get('/my-returns', protect, getMyReturnRequests);

// Admin routes
router.get('/', protect, adminProtect, getAllReturnRequests);
router.put('/:id/status', protect, adminProtect, updateReturnStatus);

export default router;
