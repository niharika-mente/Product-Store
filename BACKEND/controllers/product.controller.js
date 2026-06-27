import Product from '../models/product.model.js';

// Escapes user-supplied text before it is used inside a RegExp, so values like
// "a+b" are matched literally instead of being interpreted as regex syntax.
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createProduct = async (req, res) => {
  try {
    const { name, description, brand, basePrice, baseStock, hasVariants, variants } = req.body;
    const newProduct = new Product({
      name,
      description,
      brand,
      basePrice: hasVariants ? undefined : basePrice,
      baseStock: hasVariants ? undefined : baseStock,
      hasVariants,
      variants: hasVariants ? variants : []
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => res.status(501).json({ message: "Not implemented" });
export const getProductCategories = async (req, res) => res.status(501).json({ message: "Not implemented" });
export const updateProduct = async (req, res) => res.status(501).json({ message: "Not implemented" });
export const getRelatedProducts = async (req, res) => res.status(501).json({ message: "Not implemented" });
export const searchProducts = async (req, res) => {
  try {
    const filter = { isDeleted: { $ne: true } };

    // ?brands=Apple,Samsung — match products whose brand is ANY of the provided
    // values (case-insensitive, exact match per brand).
    if (req.query.brands !== undefined) {
      const brandList = String(req.query.brands)
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean);

      if (brandList.length > 0) {
        filter.brand = {
          $in: brandList.map((b) => new RegExp(`^${escapeRegExp(b)}$`, 'i')),
        };
      }
    }

    // Optional free-text query matched against the product name.
    if (req.query.q !== undefined && String(req.query.q).trim() !== '') {
      filter.name = { $regex: escapeRegExp(String(req.query.q).trim()), $options: 'i' };
    }

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getProductBundle = async (req, res) => res.status(501).json({ message: "Not implemented" });
export const restockProduct = async (req, res) => res.status(501).json({ message: "Not implemented" });
