import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label:      { type: String, trim: true, default: 'Home' },
  fullName:   { type: String, trim: true, required: true },
  phone:      { type: String, trim: true, default: '' },
  line1:      { type: String, trim: true, required: true },
  line2:      { type: String, trim: true, default: '' },
  city:       { type: String, trim: true, required: true },
  state:      { type: String, trim: true, default: '' },
  postalCode: { type: String, trim: true, required: true },
  country:    { type: String, trim: true, required: true },
  isDefault:  { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
      // Not required because OAuth users won't have a password initially
    },

    googleId: {
      type: String,
    },

    githubId: {
      type: String,
    },

    phone: {
      type: String,
      trim: true,
      default: '',
    },

    avatar: {
      type: String,
      default: '',
    },

    addresses: {
      type: [addressSchema],
      default: [],
    },

    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
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
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
