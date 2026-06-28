import express from "express";
import upload, { handleUploadError } from "../middleware/upload.js";
import { createProduct, deleteProduct, getProducts, getProductCategories, updateProduct, getProductById, getRelatedProducts, searchProducts, getProductBundle, restockProduct } from "../controllers/product.controller.js";
import reviewRoutes from './review.route.js';
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { productCreateLimiter, productUpdateLimiter, productDeleteLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getProductCategories);
router.get("/related/:id", getRelatedProducts);
router.get("/search", searchProducts);
router.get("/:id/bundle", getProductBundle);
router.get("/:id", getProductById);
router.post("/", productCreateLimiter, authMiddleware, adminMiddleware, upload.single("image"), handleUploadError, createProduct);
router.put("/:id", productUpdateLimiter, authMiddleware, adminMiddleware, upload.single("image"), handleUploadError, updateProduct);
router.patch("/:id/restock", productUpdateLimiter, authMiddleware, adminMiddleware, restockProduct);
router.delete("/:id", productDeleteLimiter, authMiddleware, adminMiddleware, deleteProduct);

router.use('/:productId/reviews', reviewRoutes);

export default router;
