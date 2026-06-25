import Product from '../models/product.model.js';
import {
  buildListCacheKey,
  getCachedList,
  setCachedList,
  invalidateProductCache,
} from '../services/productCache.js';

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
    // A new product invalidates every cached catalog page.
    await invalidateProductCache();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const { sort, minPrice, maxPrice } = req.query;

    // Serve from the Redis cache when a matching entry exists. The key is
    // derived from the exact pagination/filter combination so each variant is
    // cached separately. A miss (or disabled/unreachable cache) falls through
    // to MongoDB below.
    const cacheKey = buildListCacheKey({ page, limit, sort, minPrice, maxPrice });
    const cached = await getCachedList(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const filter = {};
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.basePrice = {};
      if (minPrice !== undefined) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.basePrice.$lte = Number(maxPrice);
    }

    const sortMap = {
      price_asc: { basePrice: 1 },
      price_desc: { basePrice: -1 },
      newest: { createdAt: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const totalProducts = await Product.countDocuments(filter);
    const data = await Product.find(filter)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);

    const response = {
      data,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts,
      limit,
    };

    // Populate the cache so subsequent identical requests skip MongoDB.
    await setCachedList(cacheKey, response);

    res.status(200).json(response);
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
