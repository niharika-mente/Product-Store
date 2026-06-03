import express from "express";
import upload from "../middleware/upload.js";
import { createProduct, deleteProduct, getProducts, updateProduct, getProductById, getRelatedProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/related/:id", getRelatedProducts);

router.get("/:id", getProductById);

router.post("/", upload.single("image"), createProduct);

router.put("/:id", upload.single("image"), updateProduct);

router.delete("/:id", deleteProduct);

export default router;
