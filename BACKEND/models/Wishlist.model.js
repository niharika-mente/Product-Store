import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    // Each wishlist belongs to exactly one user. The unique index guarantees a
    // single wishlist per user and prevents the previous "global wishlist" bug.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Wishlist", wishlistSchema);