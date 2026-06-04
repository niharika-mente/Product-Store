import express from "express";

import { createProduct, deleteProduct, getProducts, updateProduct, getProductById, getRelatedProducts, searchProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.get( "/", getProducts );

router.get( "/related/:id", getRelatedProducts );
//routes for search product
router.get("/search",searchProducts);

router.get( "/:id", getProductById );

router.post( "/", createProduct );

router.put( "/:id", updateProduct );

router.delete( "/:id", deleteProduct );




export default router;