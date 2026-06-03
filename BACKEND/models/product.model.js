import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    // Required Fields
    name:{
      type: String,
      required: true,
      trim: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    image:{
        type: String,
        required: true,
        trim: true
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
    
    // System Fields
    isDeleted: {
        type: Boolean,
        default: false
    }
},{
   timestamps: true //createdAt,updatedAt
});

const Product = mongoose.model("Product", productSchema);

export default Product;