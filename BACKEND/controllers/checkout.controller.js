import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import mongoose from 'mongoose';
import Stripe from 'stripe';

let stripe;
if (process.env.NODE_ENV === 'test') {
  stripe = {
    checkout: {
      sessions: {
        create: async () => ({ url: 'https://checkout.stripe.com/test-url' })
      }
    }
  };
} else {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn("WARNING: Missing STRIPE_SECRET_KEY environment variable");
  }
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
}
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const createCheckoutSession = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
        }

        const lineItems = [];

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

        for (const item of items) {
            const product = productMap.get(item._id.toString());
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
            }

            if (item.quantity > product.stock) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
            }

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        images: product.image ? [product.image] : [],
                    },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: item.quantity,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/cancel`,
            metadata: {
                items: JSON.stringify(
                  items.map((item) => ({ _id: item._id, quantity: item.quantity }))
                ),
                userId: req.user?._id?.toString() || '',
            },
        });

        res.status(200).json({ success: true, url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error.message);
        res.status(500).json({ success: false, message: "Server Error during checkout" });
    }
};

export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const existingOrder = await Order.findOne({ stripeSessionId: session.id });
        if (existingOrder) {
          return res.json({ received: true });
        }

        let cartItems;
        try {
          cartItems = JSON.parse(session.metadata?.items || "[]");
        } catch {
          cartItems = [];
        }

        const orderItems = [];
        for (const item of cartItems) {
          const product = await Product.findById(item._id);
          if (product) {
            orderItems.push({
              product: product._id,
              name: product.name,
              price: product.price,
              quantity: item.quantity,
              image: product.image || "",
            });
            await Product.findByIdAndUpdate(product._id, {
              $inc: { stock: -item.quantity },
            });
          }
        }

        await Order.create({
          user: session.metadata?.userId || null,
          items: orderItems,
          totalAmount: session.amount_total / 100,
          stripeSessionId: session.id,
          paymentStatus: "completed",
        });
    }

    res.json({ received: true });
};
