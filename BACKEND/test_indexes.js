import mongoose from 'mongoose';
import Product from './models/product.model.js';
import Order from './models/order.model.js';
import User from './models/user.model.js';

async function testIndexesWithCustomData() {
  console.log('Starting custom data test...');
  await mongoose.connect('mongodb://127.0.0.1:27017/product_store_test_indexes');
  
  // Wait for indexes to build
  await Product.init();
  await Order.init();
  await User.init();
  
  // Clear collections
  await Product.deleteMany({});
  await Order.deleteMany({});
  await User.deleteMany({});
  
  console.log('Indexes built successfully. Inserting custom data...');
  
  // 1. Insert Custom Users
  const user1 = await User.create({
    name: 'Test User 1',
    email: 'test1@example.com',
    password: 'password123',
    postalCode: '12345',
    country: 'USA'
  });
  
  // 2. Insert Custom Products
  await Product.insertMany([
    { name: 'Apple iPhone 15 Pro', description: 'Latest smartphone from Apple', isDeleted: false, category: 'Electronics', price: 999, basePrice: 999 },
    { name: 'Samsung Galaxy S24 Ultra', description: 'Flagship Android device', isDeleted: false, category: 'Electronics', price: 1199, basePrice: 1199 },
    { name: 'Old Nokia Phone', description: 'Classic phone', isDeleted: true, category: 'Electronics', price: 50, basePrice: 50 },
    { name: 'Nike Running Shoes', description: 'Comfortable sports shoes', isDeleted: false, category: 'Apparel', price: 120, basePrice: 120 }
  ]);
  
  // 3. Insert Custom Orders
  await Order.create({
    user: user1._id,
    stripeSessionId: 'cs_test_123',
    totalAmount: 999,
    items: [{ product: new mongoose.Types.ObjectId(), name: 'Test item', price: 999, quantity: 1 }],
    createdAt: new Date('2023-01-01')
  });
  await Order.create({
    user: user1._id,
    stripeSessionId: 'cs_test_456',
    totalAmount: 1199,
    items: [{ product: new mongoose.Types.ObjectId(), name: 'Test item 2', price: 1199, quantity: 1 }],
    createdAt: new Date('2023-06-01')
  });
  
  console.log('Data inserted. Running test queries...');
  
  // Query 1: Text search on Product
  const searchResults = await Product.find({ $text: { $search: 'iPhone' } }).explain('executionStats');
  console.log('\n--- Text Search for "iPhone" ---');
  console.log(`Docs matched: ${searchResults.executionStats.nReturned}`);
  console.log(`Index used: ${searchResults.queryPlanner.winningPlan.inputStage.indexName}`);
  
  // Query 2: Compound index query on Product (isDeleted, category, price)
  // Note: the index is { isDeleted: 1, category: 1, price: 1 }, but schema doesn't have isDeleted or category!
  // Wait, I didn't add 'isDeleted', 'category', 'price' to the product schema in product.model.js? 
  // Let's test it first, Mongoose might strip them if not in schema if strict mode is true (default).
  const compoundResults = await Product.find({ isDeleted: false, category: 'Electronics' }).sort({ price: 1 }).explain('executionStats');
  console.log('\n--- Compound Query on Products ---');
  console.log(`Docs matched: ${compoundResults.executionStats.nReturned}`);
  console.log(`Index used: ${compoundResults.queryPlanner.winningPlan.inputStage.indexName || compoundResults.queryPlanner.winningPlan.inputStage.stage}`);
  
  // Query 3: Order search by stripeSessionId
  const orderResult = await Order.find({ stripeSessionId: 'cs_test_456' }).explain('executionStats');
  console.log('\n--- Order by Stripe Session ID ---');
  console.log(`Docs matched: ${orderResult.executionStats.nReturned}`);
  console.log(`Index used: ${orderResult.queryPlanner.winningPlan.inputStage.indexName}`);
  
  // Query 4: Order sorting by createdAt
  const orderSortResult = await Order.find().sort({ createdAt: -1 }).limit(1).explain('executionStats');
  console.log('\n--- Order Sort by createdAt ---');
  console.log(`Docs matched: ${orderSortResult.executionStats.nReturned}`);
  console.log(`Index used: ${orderSortResult.queryPlanner.winningPlan.inputStage.indexName || orderSortResult.queryPlanner.winningPlan.inputStage.stage}`);

  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  console.log('\nTesting completed successfully!');
}

testIndexesWithCustomData().catch(console.error);
