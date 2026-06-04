import Product from '../models/product.model.js';
import mongoose from 'mongoose';

export const processCheckout = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
        }

        let calculatedTotal = 0;

        // Calculate total on the server to ensure accuracy
        for (const item of items) {
            if (!mongoose.Types.ObjectId.isValid(item._id)) {
                return res.status(400).json({ success: false, message: `Invalid Product Id: ${item._id}` });
            }

            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
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
