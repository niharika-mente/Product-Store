import Order from '../models/order.model.js';
import { sendEmail, getOrderStatusTemplate } from '../utils/email.js';

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

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!['placed', 'shipped', 'delivered'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const order = await Order.findById(orderId).populate('user');

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.orderStatus = status;
        await order.save();

        // Send Email Notification
        if (order.user && order.user.email) {
            const sendNotification = order.user.emailPreferences?.orderUpdates !== false;
            if (sendNotification && ['shipped', 'delivered'].includes(status)) {
                const html = getOrderStatusTemplate(order, status);
                sendEmail({
                    to: order.user.email,
                    subject: `Order Status Update - ${status.toUpperCase()}`,
                    html
                });
            }
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Error updating order status:", error.message);
        res.status(500).json({ success: false, message: "Failed to update order status" });
    }
};
