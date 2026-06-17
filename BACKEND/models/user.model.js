import mongoose from "mongoose";

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

    avatar: {
      type: String,
      default: '',
    },

    provider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    emailPreferences: {
      orderUpdates: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
