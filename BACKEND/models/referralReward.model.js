import mongoose from "mongoose";

const referralRewardSchema = new mongoose.Schema(
  {
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rewardType: {
      type: String,
      required: true,
    },
    rewardValue: {
      type: Number,
      required: true,
    },
    redeemed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

referralRewardSchema.index({ user: 1 });
referralRewardSchema.index({ referral: 1 });

const ReferralReward = mongoose.model("ReferralReward", referralRewardSchema);

export default ReferralReward;
