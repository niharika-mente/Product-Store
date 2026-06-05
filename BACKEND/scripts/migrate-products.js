import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import Product from '../models/product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * Migration Script: Add default values for new optional fields
 * 
 * This script updates all existing products to include the new optional fields:
 * - description, category, brand, stock, originalPrice, discount
 * 
 * Run: node BACKEND/scripts/migrate-products.js
 */

async function migrateProducts() {
  try {
    console.log('🔄 Starting product migration...\n');
    
    // Connect to database
    await connectDB();
    
    // Find all products missing the new fields
    const products = await Product.find({});
    
    console.log(`📦 Found ${products.length} products in database\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const product of products) {
      const updates = {};
      let needsUpdate = false;
      
      // Add missing fields with defaults
      if (product.description === undefined) {
        updates.description = '';
        needsUpdate = true;
      }
      
      if (product.category === undefined) {
        updates.category = '';
        needsUpdate = true;
      }
      
      if (product.brand === undefined) {
        updates.brand = '';
        needsUpdate = true;
      }
      
      if (product.stock === undefined) {
        updates.stock = 0;
        needsUpdate = true;
      }
      
      if (product.originalPrice === undefined) {
        updates.originalPrice = null;
        needsUpdate = true;
      }
      
      if (product.discount === undefined) {
        updates.discount = 0;
        needsUpdate = true;
      }
      
      if (product.isDeleted === undefined) {
        updates.isDeleted = false;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await Product.updateOne({ _id: product._id }, { $set: updates });
        console.log(`✅ Updated: ${product.name} (ID: ${product._id})`);
        updated++;
      } else {
        console.log(`⏭️  Skipped: ${product.name} (already migrated)`);
        skipped++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   Total products: ${products.length}`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log('\n🎉 Migration completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateProducts();
