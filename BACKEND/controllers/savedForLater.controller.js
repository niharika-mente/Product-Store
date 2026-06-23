import SavedForLater from "../models/savedForLater.model.js";
import { AppError } from "../middleware/errorMiddleware.js";

// ✅ Get Saved for Later
export const getSavedItems = async (req, res, next) => {
  try {
    let savedList = await SavedForLater.findOne({ user: req.user._id }).populate({
      path: "products",
      match: { isDeleted: { $ne: true } }
    });

    if (!savedList) {
      savedList = await SavedForLater.create({ user: req.user._id, products: [] });
    } else {
      savedList.products = savedList.products.filter(p => p != null);
    }

    res.status(200).json({ success: true, data: savedList });
  } catch (error) {
    next(error);
  }
};

// ✅ Add product to Saved for Later
export const addToSavedForLater = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return next(new AppError("Product ID is required", 400));
    }

    let savedList = await SavedForLater.findOne({ user: req.user._id });

    if (!savedList) {
      savedList = await SavedForLater.create({
        user: req.user._id,
        products: [productId],
      });
    } else {
      if (!savedList.products.includes(productId)) {
        savedList.products.push(productId);
        await savedList.save();
      }
    }

    await savedList.populate({
      path: "products",
      match: { isDeleted: { $ne: true } }
    });
    savedList.products = savedList.products.filter(p => p != null);
    res.status(200).json({ success: true, data: savedList });
  } catch (error) {
    next(error);
  }
};

// ✅ Remove product from Saved for Later
export const removeFromSavedForLater = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return next(new AppError("Product ID is required", 400));
    }
    let savedList = await SavedForLater.findOne({ user: req.user._id });

    if (!savedList) {
      return next(new AppError("Saved list not found", 404));
    }

    savedList.products = savedList.products.filter(
      (id) => id.toString() !== productId
    );

    await savedList.save();
    await savedList.populate({
      path: "products",
      match: { isDeleted: { $ne: true } }
    });
    savedList.products = savedList.products.filter(p => p != null);

    res.status(200).json({ success: true, data: savedList });
  } catch (error) {
    next(error);
  }
};

// ✅ Sync saved items (Merge guest items with user items)
export const syncSavedItems = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of product IDs from localStorage
    
    let savedList = await SavedForLater.findOne({ user: req.user._id });

    if (!savedList) {
      savedList = await SavedForLater.create({ user: req.user._id, products: [] });
    }

    if (items && Array.isArray(items)) {
      const existingProductIds = savedList.products.map(p => p.toString());
      
      let changed = false;
      items.forEach(productId => {
        if (productId && !existingProductIds.includes(productId.toString())) {
          savedList.products.push(productId);
          existingProductIds.push(productId.toString());
          changed = true;
        }
      });
      
      if (changed) {
        await savedList.save();
      }
    }

    await savedList.populate({
      path: "products",
      match: { isDeleted: { $ne: true } }
    });
    savedList.products = savedList.products.filter(p => p != null);
    res.status(200).json({ success: true, data: savedList });
  } catch (error) {
    next(error);
  }
};
