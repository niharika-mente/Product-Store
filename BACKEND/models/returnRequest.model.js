import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required"],
  },
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true, // ✅ Trim whitespace
    maxlength: [100, "Product name cannot exceed 100 characters"], // ✅ Maxlength
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"], // ✅ Min validation
  },
  quantity: {
    type: Number,
    required: [true, "Quantity is required"],
    min: 1,
  },
  reason: {
    type: String,
    required: [true, "Return reason is required"],
    trim: true, // ✅ Trim whitespace
    maxlength: [500, "Reason cannot exceed 500 characters"], // ✅ Maxlength
  },
  condition: {
    type: String,
    enum: ["Opened", "Unopened", "Damaged", "Defective", "Other"],
    default: "Other",
  }
}, { _id: false });

const returnRequestSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: [true, "Order ID is required"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  items: {
    type: [returnItemSchema],
    required: [true, "At least one return item is required"],
    validate: { 
      validator: function (v: any[]) {
        return v && v.length > 0;
      },
      message: "Items array cannot be empty",
    },
  },
  status: {
    type: String,
    enum: ["Requested", "Under Review", "Approved", "Rejected", "Refund Initiated", "Completed"],
    default: "Requested",
  },
  adminComments: {
    type: String,
    default: "",
    trim: true, // ✅ Trim whitespace
    maxlength: [1000, "Comments cannot exceed 1000 characters"], // ✅ Maxlength
  },
  refundAmount: {
    type: Number,
    required: [true, "Refund amount is required"],
    min: [0, "Refund amount cannot be negative"],
  },
}, { timestamps: true });

returnRequestSchema.index({ orderId: 1 });

returnRequestSchema.index({ userId: 1 });

returnRequestSchema.index({ userId: 1, status: 1 });

const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
export default ReturnRequest;