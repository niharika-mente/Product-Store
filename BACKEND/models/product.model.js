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
      validate: {
        validator: function (v) {
          const urlPattern =
            /^(https?:\/\/)([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          const imagePattern = /\.(jpg|jpeg|png|gif|webp|bmp)$/i;
          return urlPattern.test(v) && imagePattern.test(v);
        },
        message:
          "Please enter a valid image URL (must end with .jpg, .png, .gif, etc.)",
      },
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);
export default Product;