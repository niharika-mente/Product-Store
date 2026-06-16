import Order from '../models/order.model.js';

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
