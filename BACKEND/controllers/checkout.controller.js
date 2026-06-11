import Product from '../models/product.model.js';
import mongoose from 'mongoose';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const createCheckoutSession = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
        }

        const lineItems = [];

        for (const item of items) {
            if (!mongoose.Types.ObjectId.isValid(item._id)) {
                return res.status(400).json({ success: false, message: `Invalid Product Id: ${item._id}` });
            }

            const product = await Product.findById(item._id);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
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
                quantity: item.quantity || 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_URL}/cancel`,
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
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).json({ success: false, message: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`Payment successful for session: ${session.id}`);
    }

    res.json({ received: true });
};
