import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [{ type: String }]
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  basePrice: { type: Number },
  baseStock: { type: Number },
  hasVariants: { type: Boolean, default: false },
  tags: {
    type: [{
      type: String,
      trim: true,
      lowercase: true,
      minlength: 1,
      maxlength: 30,
      match: /^[a-z0-9-]+$/
    }],
    default: [],
    validate: [{
      validator: function (value) {
        return Array.isArray(value) ? value.length <= 5 : true;
      },
      message: 'A product may have at most 5 tags.'
    }]
  },
  variants: [variantSchema]
}, { timestamps: true });

// Indexes for common query patterns and performance optimization
productSchema.index({ isDeleted: 1, category: 1, price: 1 });
productSchema.index({ isDeleted: 1, createdAt: -1 });
productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
