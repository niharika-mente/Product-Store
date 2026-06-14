import Product from '../models/product.model.js';
import mongoose from 'mongoose';

export const processCheckout = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
        }

        // Validate quantities and IDs before hitting the DB
        for (const item of items) {
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                return res.status(400).json({ success: false, message: "Item quantity must be a positive integer" });
            }
            if (!mongoose.Types.ObjectId.isValid(item._id)) {
                return res.status(400).json({ success: false, message: `Invalid Product Id: ${item._id}` });
            }
        }

        // Batch fetch all products to avoid N+1 queries; exclude soft-deleted items
        const ids = items.map((item) => item._id);
        const products = await Product.find({ _id: { $in: ids }, isDeleted: { $ne: true } });
        const productMap = new Map(products.map((p) => [p._id.toString(), p]));

        let calculatedTotal = 0;

        // Calculate total on the server to ensure accuracy
        for (const item of items) {
            const product = productMap.get(item._id.toString());
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
            }

            if (item.quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            calculatedTotal += product.price * item.quantity;
        }

        // Mock a successful payment
        res.status(200).json({
            success: true,
            message: "Payment successful",
            total: calculatedTotal
        });
    } catch (error) {
        console.error("Error in checkout:", error.message);
        res.status(500).json({ success: false, message: "Server Error during checkout" });
    }
};
