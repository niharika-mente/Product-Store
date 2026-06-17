import express from "express";
import upload, { handleUploadError } from "../middleware/upload.js";
import { createProduct, deleteProduct, getProducts, getProductCategories, updateProduct, getProductById, getRelatedProducts, searchProducts, getProductBundle } from "../controllers/product.controller.js";
import reviewRoutes from './review.route.js';  // ← YEH LINE ADD KARO

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getProductCategories);
router.get("/related/:id", getRelatedProducts);
router.get("/search", searchProducts);
router.get("/:id/bundle", getProductBundle);
router.get("/:id", getProductById);
router.post("/", upload.array("images", 5), handleUploadError, createProduct);
router.put("/:id", upload.array("images", 5), handleUploadError, updateProduct);
router.delete("/:id", deleteProduct);


router.use('/:productId/reviews', reviewRoutes);

export default router;