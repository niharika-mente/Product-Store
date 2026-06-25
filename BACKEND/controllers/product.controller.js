import Product from '../models/product.model.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, basePrice, baseStock, hasVariants, variants } = req.body;
    const newProduct = new Product({
      name,
      description,
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
export const searchProducts = async (req, res) => res.status(501).json({ message: "Not implemented" });
export const getProductBundle = async (req, res) => res.status(501).json({ message: "Not implemented" });
export const restockProduct = async (req, res) => res.status(501).json({ message: "Not implemented" });
