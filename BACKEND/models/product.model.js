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
  variants: [variantSchema]
}, { timestamps: true });

// Indexes for common query patterns and performance optimization
productSchema.index({ isDeleted: 1, category: 1, price: 1 });
productSchema.index({ isDeleted: 1, createdAt: -1 });
productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
