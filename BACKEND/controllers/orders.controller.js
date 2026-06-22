import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import { generateInvoice } from '../services/invoice.service.js';

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Error fetching orders:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
};

export const downloadInvoice = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId).lean();

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if user is the owner (assuming roles are handled in middleware, if not we just check ownership)
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Forbidden: You don't have access to this invoice" });
        }

        const user = await User.findById(order.user).lean();

        const invoiceData = {
            order,
            user
        };

        await generateInvoice(invoiceData, res);
    } catch (error) {
        console.error("GENERATE INVOICE ERROR:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Invoice Generation Failed" });
        }
    }
};
