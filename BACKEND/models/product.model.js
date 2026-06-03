import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
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
    isDeleted: {
        type: Boolean,
        default: false
    }
},{
   timestamps: true //createdAt,updatedAt
});

const Product = mongoose.model("Product", productSchema);

export default Product;