import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
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
    isDeleted: {
        type: Boolean,
        default: false
    }
},{
   timestamps: true //createdAt,updatedAt
});

const Product = mongoose.model("Product", productSchema);
export default Product;