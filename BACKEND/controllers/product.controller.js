import Product from '../models/product.model.js';
import mongoose from "mongoose";

export const getProducts = async ( req, res ) =>
{
    try
    {
        const products = await Product.find( {} );
        res.status( 200 ).json( { success: true, data: products } );
    } catch ( error )
    {
        console.log( "error in fetching products:", error.message );
        res.status( 500 ).json( { success: false, message: "Server Error" } );
    }
};

export const createProduct = async ( req, res ) =>
{
    const product = req.body;

    if ( !product.name || !product.price || !product.image )
    {
        return res.status( 400 ).json( { success: false, message: "Please provide all fields" } );
    }

    // const newProduct = new Product( product );
    // async ( req, res ) =>
    // {
    //     const product = req.body;

    //     if ( !product.name || !product.price || !product.image )
    //     {
    //         return res.status( 400 ).json( { success: false, message: "Please provide all fields" } );
    //     }

        const newProduct = new Product(product);

        try
        {
            await newProduct.save();
            res.status( 201 ).json( { success: true, data: newProduct } );
        } catch ( error )
        {
            console.error( "Error in Create product:", error.message );
            res.status( 500 ).json( { success: false, message: "Server Error" } );
        }
    };
    // try
    // {
    //     await newProduct.save();
    //     res.status( 201 ).json( { success: true, data: newProduct } );
    // } catch ( error )
    // {
    //     console.error( "Error in Create product:", error.message );
    //     res.status( 500 ).json( { success: false, message: "Server Error" } );
    // }


export const updateProduct = async ( req, res ) =>
{

    const { id } = req.params;
    const product = req.body;
    console.log( "PUT Request ID:", id );
    console.log( "PUT Request Body:", product );

    if ( !mongoose.Types.ObjectId.isValid( id ) )
    {
        return res.status( 404 ).json( { success: false, message: "Invalid Product Id" } );
    }

    try
    {
        const updatedProduct = await Product.findByIdAndUpdate( id, product, { new: true } );
        res.status( 200 ).json( { success: true, data: updatedProduct } );
    } catch ( error )
    {
        console.error( "Update error:", error );
        res.status( 500 ).json( { success: false, message: "Server Error" } );
    }
};

export const deleteProduct = async ( req, res ) =>
{
    const { id } = req.params;

    if ( !mongoose.Types.ObjectId.isValid( id ) )
    {
        return res.status( 404 ).json( { success: false, message: "Invalid Product Id" } );
    }


    try
    {
        await Product.findByIdAndDelete( id );
        res.status( 200 ).json( { success: true, message: "Product deleted" } );
    } catch ( error )
    {
        console.log( "error in deleting product:", error.message );
        res.status( 500 ).json( { success: false, message: "Server Error" } );
    }
};

export const getProductById = async ( req, res ) =>
{
    const { id } = req.params;

    if ( !mongoose.Types.ObjectId.isValid( id ) )
    {
        return res.status( 404 ).json( { success: false, message: "Invalid Product Id" } );
    }

    try
    {
        const product = await Product.findById( id );
        if ( !product )
        {
            return res.status( 404 ).json( { success: false, message: "Product not found" } );
        }
        res.status( 200 ).json( { success: true, data: product } );
    } catch ( error )
    {
        console.log( "error in fetching product:", error.message );
        res.status( 500 ).json( { success: false, message: "Server Error" } );
    }
};

export const getRelatedProducts = async ( req, res ) =>
{
    const { id } = req.params;

    if ( !mongoose.Types.ObjectId.isValid( id ) )
    {
        return res.status( 404 ).json( { success: false, message: "Invalid Product Id" } );
    }

    try
    {
        const product = await Product.findById( id );
        if ( !product )
        {
            return res.status( 404 ).json( { success: false, message: "Product not found" } );
        }

        // Tokenize product name into keywords for similarity matching
        const stopWords = new Set( [ "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "of" ] );
        const words = product.name
            .toLowerCase()
            .split( /\s+/ )
            .map( w => w.replace( /[^a-z0-9]/g, "" ) )
            .filter( w => w.length > 1 && !stopWords.has( w ) );

        let related = [];
        if ( words.length > 0 )
        {
            const regexes = words.map( word => new RegExp( word, 'i' ) );
            related = await Product.find( {
                _id: { $ne: product._id },
                name: { $in: regexes }
            } ).limit( 5 );
        }

        // Pad if less than 4 related products are found
        if ( related.length < 4 )
        {
            const excludeIds = [ product._id, ...related.map( p => p._id ) ];
            const padding = await Product.find( {
                _id: { $nin: excludeIds }
            } ).limit( 5 - related.length );
            related = [ ...related, ...padding ];
        }

        res.status( 200 ).json( { success: true, data: related.slice( 0, 5 ) } );
    } catch ( error )
    {
        console.error( "Error in fetching related products:", error.message );
        res.status( 500 ).json( { success: false, message: "Server Error" } );
    }
};