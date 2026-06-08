import Product from "../models/product.model.js";
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

export const createProduct = async (req, res) => {
  const product = req.body;

  if (!product.name || !product.price || !product.image) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }

  const newProduct = new Product(product);

  try {
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error in Create product:", error.message);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
      });
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


export const updateProduct = async ( req, res ) =>
{
    const { id } = req.params;
    const product = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(404)
            .json({ success: false, message: "Invalid Product Id" });
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

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res
            .status(404)
            .json({ success: false, message: "Invalid Product Id" });
    }

    try {
        await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.log("error in deleting product:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
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

export const getRelatedProducts = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    try {
        const product = await Product.findById(id);
        if (!product || product.isDeleted === true) {
            return res.status(404).json({ success: false, message: "Product not found" });
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
        console.error("Error in fetching related products:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const searchProducts=async(req,res)=>{
    const {q}=req.query;
    console.log("Search query:", q);

    try {
        const regex = new RegExp(q, 'i');
        console.log("Constructed regex:", regex); 
        const products=await Product.find({name:regex});
        res.status(200).json({success:true,data:products});
    } catch (error) {
        console.error("Error in searching products:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}