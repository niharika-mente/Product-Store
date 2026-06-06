import express from "express";
import { 
    createProduct, 
    deleteProduct, 
    getProducts, 
    updateProduct, 
    getProductById, 
    getRelatedProducts 
} from "../controllers/product.controller.js";

const router = express.Router();

router.get( "/", getProducts );

router.get( "/related/:id", getRelatedProducts );

router.get( "/:id", getProductById );

router.post( "/", createProduct );

router.put( "/:id", updateProduct );

router.delete( "/:id", deleteProduct );

export default router;