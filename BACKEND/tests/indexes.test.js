import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  await Product.init();
  await Order.init();
  await User.init();
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

describe('Database Indexes Edge Cases with Custom Data', () => {
  beforeEach(async () => {
    await Product.deleteMany({});
    await Order.deleteMany({});
    await User.deleteMany({});
  });

  test('should use text index for product search', async () => {
    await Product.insertMany([
      { name: 'Apple iPhone 15 Pro', description: 'Latest smartphone from Apple', price: 999 },
      { name: 'Samsung Galaxy S24 Ultra', description: 'Flagship Android device', price: 1199 },
      { name: 'Old Nokia Phone', description: 'Classic phone', price: 50 },
    ]);

    const results = await Product.find({ $text: { $search: 'iPhone' } }).explain('executionStats');
    
    // Check that we got the right document
    const docs = await Product.find({ $text: { $search: 'iPhone' } });
    expect(docs).toHaveLength(1);
    expect(docs[0].name).toBe('Apple iPhone 15 Pro');
    
    // Check if the query planner used the text index
    const indexUsed = results.queryPlanner.winningPlan.inputStage.indexName || 
                      (results.queryPlanner.winningPlan.inputStage.inputStage && results.queryPlanner.winningPlan.inputStage.inputStage.indexName) ||
                      results.queryPlanner.winningPlan.stage; // fallback
                      
    expect(indexUsed).toBeDefined();
    // TEXT indices have a specific inputStage or stage like TEXT
    const stageStr = JSON.stringify(results.queryPlanner.winningPlan);
    expect(stageStr).toContain('TEXT');
  });

  test('should use compound index { isDeleted: 1, category: 1, price: 1 } for filtering products', async () => {
    // Note: isDeleted and category were missing from schema but let's test if MongoDB handles dynamic fields or strict mode
    // We update schema locally or just see if the index works with strict: false if we have to.
    // By default Mongoose strict mode strips fields not in schema. 
    // Wait, since Mongoose strict mode strips them, the index on those fields might not be hit if we can't insert them.
    // Let's insert them using collection.insertMany to bypass Mongoose strict mode and test the raw index.
    
    await Product.collection.insertMany([
      { name: 'Product A', description: 'A', price: 100, isDeleted: false, category: 'Electronics' },
      { name: 'Product B', description: 'B', price: 200, isDeleted: false, category: 'Electronics' },
      { name: 'Product C', description: 'C', price: 300, isDeleted: true, category: 'Electronics' },
      { name: 'Product D', description: 'D', price: 150, isDeleted: false, category: 'Furniture' },
    ]);

    // Ensure index exists
    const indexes = await Product.collection.indexes();
    const hasCompound = indexes.some(idx => idx.name === 'isDeleted_1_category_1_price_1');
    expect(hasCompound).toBe(true);

    const query = { isDeleted: false, category: 'Electronics' };
    const sort = { price: 1 };
    
    const results = await Product.collection.find(query).sort(sort).explain('executionStats');
    const docs = await Product.collection.find(query).sort(sort).toArray();
    
    expect(docs).toHaveLength(2);
    expect(docs[0].name).toBe('Product A'); // price 100
    expect(docs[1].name).toBe('Product B'); // price 200
    
    const stageStr = JSON.stringify(results.queryPlanner.winningPlan);
    expect(stageStr).toContain('isDeleted_1_category_1_price_1');
  });

  test('should use compound index { isDeleted: 1, createdAt: -1 }', async () => {
    await Product.collection.insertMany([
      { name: 'Product A', description: 'A', price: 100, isDeleted: false, createdAt: new Date('2023-01-01') },
      { name: 'Product B', description: 'B', price: 200, isDeleted: false, createdAt: new Date('2023-01-02') },
      { name: 'Product C', description: 'C', price: 300, isDeleted: true, createdAt: new Date('2023-01-03') },
    ]);

    const results = await Product.collection.find({ isDeleted: false }).sort({ createdAt: -1 }).explain('executionStats');
    const docs = await Product.collection.find({ isDeleted: false }).sort({ createdAt: -1 }).toArray();
    
    expect(docs).toHaveLength(2);
    expect(docs[0].name).toBe('Product B'); // most recent
    expect(docs[1].name).toBe('Product A');
    
    const stageStr = JSON.stringify(results.queryPlanner.winningPlan);
    expect(stageStr).toContain('isDeleted_1_createdAt_-1');
  });

  test('should use stripeSessionId index for Order lookup', async () => {
    const user1 = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      postalCode: '123',
      country: 'US'
    });

    await Order.create([
      { user: user1._id, stripeSessionId: 'sess_123', totalAmount: 100, items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }] },
      { user: user1._id, stripeSessionId: 'sess_456', totalAmount: 200, items: [{ product: new mongoose.Types.ObjectId(), name: 'Test 2', price: 200, quantity: 1 }] },
    ]);

    const results = await Order.find({ stripeSessionId: 'sess_456' }).explain('executionStats');
    const docs = await Order.find({ stripeSessionId: 'sess_456' });
    
    expect(docs).toHaveLength(1);
    expect(docs[0].totalAmount).toBe(200);

    const stageStr = JSON.stringify(results.queryPlanner.winningPlan);
    expect(stageStr).toContain('stripeSessionId_1');
  });
  
  test('should use createdAt index for Order sort', async () => {
    const user1 = await User.create({
      name: 'Test User 2',
      email: 'test2@example.com',
      postalCode: '123',
      country: 'US'
    });

    await Order.create([
      { user: user1._id, stripeSessionId: 'sess_111', totalAmount: 100, items: [{ product: new mongoose.Types.ObjectId(), name: 'Test', price: 100, quantity: 1 }], createdAt: new Date('2023-01-01') },
      { user: user1._id, stripeSessionId: 'sess_222', totalAmount: 200, items: [{ product: new mongoose.Types.ObjectId(), name: 'Test 2', price: 200, quantity: 1 }], createdAt: new Date('2023-02-01') },
    ]);

    const results = await Order.find().sort({ createdAt: -1 }).limit(1).explain('executionStats');
    const docs = await Order.find().sort({ createdAt: -1 }).limit(1);
    
    expect(docs).toHaveLength(1);
    expect(docs[0].stripeSessionId).toBe('sess_222');

    const stageStr = JSON.stringify(results.queryPlanner.winningPlan);
    expect(stageStr).toContain('createdAt_-1');
  });
});
