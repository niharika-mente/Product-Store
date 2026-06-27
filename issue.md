# Undiscovered Project Issues & Architectural Flaws

This report details critical, high, and medium severity bugs discovered during a deep-dive architectural audit of the `Product-Store` project. These issues have not yet been reported on GitHub and will cause severe functional or financial impact in production.

## 🚨 Critical Severity

### 1. Silent Payment Failure & Overselling (Stripe Webhook)
- **Location:** `BACKEND/controllers/checkout.controller.js` (`stripeWebhook` & `createCheckoutSession`)
- **Issue:** The `createCheckoutSession` endpoint checks if stock is available but **does not reserve it**. If two users simultaneously begin checkout for the last item in stock, both receive a valid Stripe session.
- **The Catastrophe:** If both users pay, the first user's webhook decrements the stock to 0. When the second user's webhook fires, `findOneAndUpdate` fails (because `baseStock` is now 0), and the code does this:
  ```javascript
  if (!updated) {
    console.error(`Checkout webhook: stock changed during fulfillment...`);
    await restoreStock(deductions);
    return res.json({ received: true }); // <--- SILENT FAILURE
  }
  ```
- **Impact:** The second user's credit card is successfully charged by Stripe, but **no order is ever created in MongoDB**, and the backend simply swallows the error. The business effectively steals the customer's money.
- **Fix:** The webhook must issue an automated Stripe Refund (`stripe.refunds.create`) if fulfillment fails, and notify the user. Alternatively, temporarily reserve stock in Redis upon session creation.

### 2. 

## 🔴 High Severity

### 3. Coupon Max-Uses Race Condition
- **Location:** `BACKEND/controllers/checkout.controller.js`
- **Issue:** `couponDoc.usedCount` is only incremented inside the asynchronous `stripeWebhook` after a successful payment.
- **Impact:** If a coupon has `maxUses = 10`, 100 users can apply it on the checkout page simultaneously because the limit is checked during session creation. All 100 users will successfully receive the discount.
- **Fix:** Coupons should be "reserved" in a Redis lock when the session is created, or the count should be validated in a pre-payment webhook/synchronous step.

### 4. 

## 🟡 Medium Severity

### 5. 

### 6. 
