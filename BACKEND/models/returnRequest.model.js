import mongoose from "mongoose";

const returnItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  reason: {
    type: String,
    required: true,
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
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [returnItemSchema],
  status: {
    type: String,
    enum: ["Requested", "Under Review", "Approved", "Rejected", "Refund Initiated", "Completed"],
    default: "Requested",
  },
  adminComments: {
    type: String,
    default: "",
  },
  refundAmount: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

// Indexes
returnRequestSchema.index({ orderId: 1 });
returnRequestSchema.index({ userId: 1 });

const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
export default ReturnRequest;
