import express from "express";
import upload, { handleUploadError } from "../middleware/upload.js";
import { createProduct, deleteProduct, getProducts, updateProduct, getProductById, getRelatedProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/related/:id", getRelatedProducts);

router.get("/:id", getProductById);

router.post("/", upload.single("image"), handleUploadError, createProduct);

router.put("/:id", upload.single("image"), handleUploadError, updateProduct);

router.delete("/:id", deleteProduct);

export default router;
