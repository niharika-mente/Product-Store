import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    // Required Fields
    name:{
      type: String,
      required: [true, "Product name is required"], // Custom error message
      trim: true,
      minlength: [3, "Product name must be at least 3 characters long"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [1000000, "Price cannot exceed 1,000,000"],
      validate: {
        validator: function (value) {
          return value !== null && value !== undefined && !isNaN(value);
        },
        message: "Price must be a valid number",
      },
    },

    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    
    // Optional Fields - Extra Product Details
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        trim: true,
        default: ''
    },
    brand: {
        type: String,
        trim: true,
        default: ''
    },
    tags: {
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    originalPrice: {
        type: Number,
        min: [0, 'Original price cannot be negative'],
        default: null
    },
    discount: {
        type: Number,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%'],
        default: 0
    },
    
    // Review Aggregates
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },

    // System Fields
    isDeleted: {
        type: Boolean,
        default: false
    },

    complementaryItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        reason: {
            type: String,
            trim: true,
            default: ''
        }
    }]
},{
   timestamps: true
});

const Product = mongoose.model("Product", productSchema);
export default Product;