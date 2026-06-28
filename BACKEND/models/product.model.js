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
  brand: { type: String, trim: true, default: '' },
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
  variants: [variantSchema],
  // Soft-delete flag: queries exclude deleted products instead of removing rows.
  // Referenced by the checkout flow and the {isDeleted, ...} indexes below.
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

// Compound indexes ordered: equality fields first, then range/sort fields.
// Every catalog query starts with { isDeleted: { $ne: true } }, so isDeleted
// leads every compound index so MongoDB can skip deleted documents early.

// Default listing — sort by newest or price without any filter
productSchema.index({ isDeleted: 1, createdAt: -1 });
productSchema.index({ isDeleted: 1, price: 1 });

// Category + price-range filter (most common filter combination)
productSchema.index({ isDeleted: 1, category: 1, price: 1 });

// Brand filter — uses a case-insensitive collation so the index is
// used even when the controller queries with $regex: /brand/i.
productSchema.index(
  { isDeleted: 1, brand: 1 },
  { collation: { locale: 'en', strength: 2 } }
);

// In-stock filter (inStock=true → stock > 0)
productSchema.index({ isDeleted: 1, stock: 1 });

// Rating filter (minRating → averageRating >= N)
productSchema.index({ isDeleted: 1, averageRating: -1 });

// Text index for the search-by-name fallback in searchProducts
productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);
export default Product;
