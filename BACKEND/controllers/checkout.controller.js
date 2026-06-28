import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import Coupon from '../models/coupon.model.js';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { sendOrderConfirmationEmail } from '../services/email.service.js';
import { processReferralOnPurchase } from '../services/referral.service.js';
import { getIO } from '../socket.js';

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

// First variant image, if any — non-variant products carry no image of their own.
function productImage(product) {
  const img = product.variants?.[0]?.images?.[0];
  return img ? [img] : [];
}

async function restoreStock(deductions) {
  for (const { productId, quantity } of deductions) {
    await Product.findByIdAndUpdate(productId, { $inc: { baseStock: quantity } });
  }
}

export const createCheckoutSession = async (req, res) => {
    try {
        const { items, couponCode } = req.body;

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

            if (item.quantity > product.baseStock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Available: ${product.baseStock}, requested: ${item.quantity}`
                });
            }

            lineItems.push({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.name,
                        images: productImage(product),
                    },
                    unit_amount: Math.round(product.basePrice * 100),
                },
                quantity: item.quantity,
            });
        }

        // Validate and apply coupon discount if provided
        let couponDoc = null;
        let discountAmount = 0;
        if (couponCode) {
            const rawTotal = lineItems.reduce((sum, li) => sum + li.price_data.unit_amount * li.quantity, 0) / 100;
            couponDoc = await Coupon.findOne({ code: couponCode.trim().toUpperCase(), isActive: true });

            if (!couponDoc) {
                return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
            }
            if (couponDoc.expiresAt && new Date() > couponDoc.expiresAt) {
                return res.status(400).json({ success: false, message: 'This coupon has expired' });
            }
            if (couponDoc.maxUses !== null && couponDoc.usedCount >= couponDoc.maxUses) {
                return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
            }
            if (rawTotal < couponDoc.minOrderAmount) {
                return res.status(400).json({ success: false, message: `Minimum order of $${couponDoc.minOrderAmount.toFixed(2)} required` });
            }

            discountAmount = couponDoc.type === 'percentage'
                ? (rawTotal * couponDoc.value) / 100
                : Math.min(couponDoc.value, rawTotal);

            // Apply discount by scaling each line item's unit_amount proportionally
            const ratio = 1 - discountAmount / rawTotal;
            for (const li of lineItems) {
                li.price_data.unit_amount = Math.max(1, Math.round(li.price_data.unit_amount * ratio));
            }
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
                couponCode: couponDoc ? couponDoc.code : '',
                discountAmount: discountAmount.toFixed(2),
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

        const itemIds = cartItems.map((i) => i._id);
        const products = await Product.find({
          _id: { $in: itemIds },
          isDeleted: { $ne: true },
        });
        const productMap = new Map(products.map((p) => [p._id.toString(), p]));

        const orderItems = [];
        for (const item of cartItems) {
          const product = productMap.get(item._id.toString());
          if (!product) {
            console.error(`Checkout webhook: product not found or deleted: ${item._id}`);
            return res.json({ received: true });
          }
          if (item.quantity > product.baseStock) {
            console.error(`Checkout webhook: insufficient stock for ${product.name}`);
            return res.json({ received: true });
          }

          orderItems.push({
            product: product._id,
            name: product.name,
            price: product.basePrice,
            quantity: item.quantity,
            image: productImage(product)[0] || "",
          });
        }

        const deductions = [];
        for (const item of cartItems) {
          const updated = await Product.findOneAndUpdate(
            {
              _id: item._id,
              isDeleted: { $ne: true },
              baseStock: { $gte: item.quantity },
            },
            { $inc: { baseStock: -item.quantity } }
          );

          if (!updated) {
            console.error(`Checkout webhook: stock changed during fulfillment for ${item._id}`);
            await restoreStock(deductions);
            return res.json({ received: true });
          }

          // Emit real-time stock update
          getIO()?.emit("stockUpdate", {
            productId: item._id,
            newStock: updated.stock - item.quantity
          });

          deductions.push({ productId: item._id, quantity: item.quantity });
        }

        const order = await Order.create({
          user: session.metadata?.userId || null,
          items: orderItems,
          totalAmount: session.amount_total / 100,
          stripeSessionId: session.id,
          paymentStatus: "completed",
        });

        // Send confirmation email — non-blocking; failures never break fulfillment
        const customerEmail = session.customer_details?.email;
        if (customerEmail) {
          sendOrderConfirmationEmail(customerEmail, order).catch((err) =>
            console.error('[Email] Order confirmation failed:', err.message)
          );
        } else if (session.metadata?.userId) {
          User.findById(session.metadata.userId).select('email').lean().then((u) => {
            if (u?.email) {
              sendOrderConfirmationEmail(u.email, order).catch((err) =>
                console.error('[Email] Order confirmation failed:', err.message)
              );
            }
          }).catch(() => {});
        }

        // Increment coupon usage after successful fulfillment
        if (session.metadata?.couponCode) {
          await Coupon.findOneAndUpdate(
            { code: session.metadata.couponCode },
            { $inc: { usedCount: 1 } }
          );
        }

        // Trigger referral reward
        if (order.user) {
          processReferralOnPurchase(order._id).catch(err => {
            console.error("Referral process error on purchase:", err);
          });
        }
    }

    res.json({ received: true });
};
// Note: In production, you should verify the webhook signature and handle retries appropriately.