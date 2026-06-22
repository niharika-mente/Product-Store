import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referralCode: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "registered", "qualified", "rewarded", "rejected"],
      default: "pending",
    },
    rewardType: {
      type: String,
      enum: ["store_credit", "coupon", "loyalty_points"],
      default: "store_credit",
    },
    rewardAmount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster lookups
referralSchema.index({ referrer: 1 });
referralSchema.index({ referredUser: 1 });
referralSchema.index({ referralCode: 1 });

const Referral = mongoose.model("Referral", referralSchema);

export default Referral;
