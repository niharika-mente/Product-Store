import Product from "../models/product.model.js";
import mongoose from "mongoose";
import { AppError } from "../middleware/errorMiddleware.js";

// @desc    Get all products (with sorting, filtering deleted products)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
    try {
        const { sort } = req.query;

        let sortOption = {};

        if (sort === "price_asc") {
            sortOption = { price: 1 };
        } else if (sort === "price_desc") {
            sortOption = { price: -1 };
        } else if (sort === "newest") {
            sortOption = { createdAt: -1 };
        }

        // Query: Find all products where isDeleted is NOT true (handles both missing and false)
        const products = await Product.find({
            isDeleted: { $ne: true }
        }).sort(sortOption);
        
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Public
export const createProduct = async (req, res, next) => {
    const product = req.body;

    // Basic validation - Missing fields
    if (!product.name || !product.price || !product.image) {
        return next(new AppError("Please provide all fields: name, price, image", 400));
    }

    const newProduct = new Product(product);

    try
    {
        await newProduct.save();
        res.status( 201 ).json( { success: true, data: newProduct } );
    } catch ( error )
    {
        console.error( "Error in Create product:", error.message );
        if ( error.name === 'ValidationError' )
        {
            const messages = Object.values( error.errors ).map( err => err.message );
            return res.status( 400 ).json( { success: false, message: messages.join( ', ' ) } );
        }
        res.status( 500 ).json( { success: false, message: "Server Error" } );
    }
};

    const newProduct = new Product(product);

export const updateProduct = async ( req, res ) =>
{
    const { id } = req.params;
    const product = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid Product Id format", 404));
    }

    if ( !product || Object.keys( product ).length === 0 )
    {
        return res.status( 400 ).json( { success: false, message: "No update fields provided" } );
    }

    try
    {
        const updatedProduct = await Product.findByIdAndUpdate( id, product, { new: true, runValidators: true } );
        if ( !updatedProduct )
        {
            return res.status( 404 ).json( { success: false, message: "Product not found" } );
        }
        res.status( 200 ).json( { success: true, data: updatedProduct } );
    } catch ( error )
    {
        console.error( "Error in Update product:", error.message );
        if ( error.name === 'ValidationError' )
        {
            const messages = Object.values( error.errors ).map( err => err.message );
            return res.status( 400 ).json( { success: false, message: messages.join( ', ' ) } );
        }
        res.status( 500 ).json( { success: false, message: "Server Error" } );
    }
};

// @desc    Delete a product (soft delete - set isDeleted to true)
// @route   DELETE /api/products/:id
// @access  Public
export const deleteProduct = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid Product Id format", 404));
    }

    try {
        const deletedProduct = await Product.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );

        if (!deletedProduct) {
            return next(new AppError("Product not found with this ID", 404));
        }

        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid Product Id format", 404));
    }

    try
    {
        // Query: Find by ID and ensure NOT deleted (handles both missing and false values)
        const product = await Product.findOne({ _id: id, isDeleted: { $ne: true } });
        
        if ( !product )
        {
            return res.status( 404 ).json( { success: false, message: "Product not found" } );
        }
        res.status( 200 ).json( { success: true, data: product } );
    } catch ( error )
    {
        console.error( "Error in fetching product:", error.message );
        res.status( 500 ).json( { success: false, message: "Server Error" } );
    }
};

// @desc    Get related products based on name keywords
// @route   GET /api/products/:id/related
// @access  Public
export const getRelatedProducts = async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid Product Id format", 404));
    }

    try {
        const product = await Product.findById(id);
        
        if (!product || product.isDeleted === true) {
            return next(new AppError("Product not found", 404));
        }

        // Tokenize product name into keywords for similarity matching
        const stopWords = new Set(["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "of"]);
        const words = product.name
            .toLowerCase()
            .split(/\s+/)
            .map(w => w.replace(/[^a-z0-9]/g, ""))
            .filter(w => w.length > 1 && !stopWords.has(w));

        let related = [];
        
        if (words.length > 0) {
            const regexes = words.map(word => new RegExp(word, 'i'));
            related = await Product.find({
                _id: { $ne: product._id },
                name: { $in: regexes },
                isDeleted: { $ne: true }
            } ).limit( 5 );
        }

        // Pad if less than 4 related products are found
        if ( related.length < 4 )
        {
            const excludeIds = [ product._id, ...related.map( p => p._id ) ];
            const padding = await Product.find( {
                _id: { $nin: excludeIds },
                isDeleted: { $ne: true }
            } ).limit( 5 - related.length );
            related = [ ...related, ...padding ];
        }

        res.status(200).json({ success: true, data: related.slice(0, 5) });
    } catch (error) {
        next(error);
    }
};