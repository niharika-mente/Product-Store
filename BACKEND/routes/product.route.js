import express from "express";

import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controller.js";

const router = express.Router();

router.get( "/", getProducts );

router.post( "/", createProduct );

router.put( "/:id", updateProduct );

router.delete( "/:id", deleteProduct );
//console.log( "📦 product.route.js loaded" );

export default router;