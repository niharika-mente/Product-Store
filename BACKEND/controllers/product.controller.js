import Product from '../models/product.model.js';
import mongoose from "mongoose";

export const getProducts = async ( req, res ) =>
{
    try
    {
        // Parse page and limit from query parameters and apply defaults.
        const page = parseInt( req.query.page, 10 ) || 1;
        const limit = parseInt( req.query.limit, 10 ) || 10;

        // Validate that page and limit are positive integers.
        if ( page < 1 || limit < 1 )
        {
            return res.status( 400 ).json( {
                success: false,
                message: "Invalid pagination parameters. page and limit must be positive integers.",
            } );
        }

        // Calculate the number of documents to skip for this page.
        const skip = ( page - 1 ) * limit;

        // Count all products so the frontend can render pagination metadata.
        const totalProducts = await Product.countDocuments( {} );

        // Fetch only the requested page using skip and limit.
        const products = await Product.find( {} ).skip( skip ).limit( limit );

        const totalPages = totalProducts > 0 ? Math.ceil( totalProducts / limit ) : 0;

        res.status( 200 ).json( {
            success: true,
            currentPage: page,
            totalPages,
            totalProducts,
            limit,
            data: products,
        } );
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