import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    userName: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5']
    },
    comment: {
        type: String,
        required: [true, 'Comment is required'],
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    }
}, { timestamps: true });

// Prevent the same name from reviewing the same product twice
reviewSchema.index({ product: 1, userName: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
