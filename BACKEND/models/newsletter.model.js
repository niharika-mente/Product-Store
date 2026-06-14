import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

export default Newsletter;
