import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "Home" },
    fullName: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, default: "" },
    line1: { type: String, trim: true, required: true },
    line2: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, required: true },
    country: { type: String, trim: true, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      minlength: 6,
      // Keeping it visible to avoid breaking login flow
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    githubId: {
      type: String,
      unique: true,
      sparse: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    provider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // Two-factor authentication (TOTP / authenticator app).
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // The confirmed TOTP secret. select:false so it is never returned by
    // default queries and can't leak through endpoints that echo the user.
    twoFactorSecret: {
      type: String,
      default: null,
      select: false,
    },

    // Holds the secret between "setup" and the first successful "verify". Kept
    // separate from twoFactorSecret so an unconfirmed re-setup can't disable an
    // already-active second factor.
    twoFactorTempSecret: {
      type: String,
      default: null,
      select: false,
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const User = mongoose.model("User", userSchema);

export default User;