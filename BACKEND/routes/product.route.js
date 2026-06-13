/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Create a new product
 *     description: Add a new product to the database
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 * 
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 * 
 * /api/products/{id}/bundle:
 *   get:
 *     summary: Get frequently bought together bundle
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID to get bundle for
 *     responses:
 *       200:
 *         description: Bundle data with complementary items and discount
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mainProduct:
 *                   $ref: '#/components/schemas/Product'
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *                       reason:
 *                         type: string
 *                 bundleTotal:
 *                   type: number
 *                 bundleDiscount:
 *                   type: number
 *                 bundlePrice:
 *                   type: number
 *                 savings:
 *                   type: number
 *       404:
 *         description: Product not found
 * 
 * /api/products/related/{id}:
 *   get:
 *     summary: Get related products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: List of related products
 * 
 * /api/products/search:
 *   get:
 *     summary: Search products
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of matching products
 */

import express from "express";
import upload, { handleUploadError } from "../middleware/upload.js";
import { createProduct, deleteProduct, getProducts, updateProduct, getProductById, getRelatedProducts, searchProducts, getProductBundle } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/related/:id", getRelatedProducts);
router.get("/search", searchProducts);
router.get("/:id/bundle", getProductBundle);
router.get("/:id", getProductById);
router.post("/", upload.single("image"), handleUploadError, createProduct);
router.put("/:id", upload.single("image"), handleUploadError, updateProduct);
router.delete("/:id", deleteProduct);

export default router;
