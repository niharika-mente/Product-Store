import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from './models/product.model.js';
import Order from './models/order.model.js';
import User from './models/user.model.js';

async function verifyIndexes() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Wait for indexes to build
  await Product.init();
  await Order.init();
  await User.init();

  const productIndexes = await Product.collection.indexes();
  const orderIndexes = await Order.collection.indexes();
  const userIndexes = await User.collection.indexes();

  console.log("=== Product Indexes ===");
  productIndexes.forEach(idx => console.log(idx.key));

  console.log("\n=== Order Indexes ===");
  orderIndexes.forEach(idx => console.log(idx.key));

  console.log("\n=== User Indexes ===");
  userIndexes.forEach(idx => console.log(idx.key));

  await mongoose.disconnect();
  await mongoServer.stop();
}

verifyIndexes().catch(console.error);
