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
    tags:{
        type: [String],
        default: [],
        validate: {
            validator: function (tags){
              return tags.length <= 5 && tags.every(tag => tag.length >= 2 && tag.length <= 30);
            },
            message: "Maximum 5 tags, each 2-30 characters"
        }
    }
},{
   timestamps: true //createdAt,updatedAt
});

const Product = mongoose.model("Product", productSchema);

export default Product;