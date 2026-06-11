import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 6
    },
    googleId: {
        type: String
    },
    githubId: {
        type: String
    },
    avatar: {
        type: String,
        default: ''
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'github'],
        default: 'local'
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);
export default User;
