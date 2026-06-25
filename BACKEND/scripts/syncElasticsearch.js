import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.model.js';
import client from '../config/elasticsearch.js';

dotenv.config();

const INDEX_NAME = 'products';

const syncProducts = async () => {
    if (!client) {
        console.error("Elasticsearch client is not configured. Exiting.");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        const exists = await client.indices.exists({ index: INDEX_NAME });
        if (!exists) {
            console.log(`Creating index ${INDEX_NAME}...`);
            await client.indices.create({ index: INDEX_NAME });
            console.log("Index created.");
        }

        const products = await Product.find({ isDeleted: { $ne: true } });
        console.log(`Found ${products.length} products to sync.`);

        if (products.length === 0) {
            console.log("No products to sync. Exiting.");
            process.exit(0);
        }

        const operations = products.flatMap(doc => [
            { index: { _index: INDEX_NAME, _id: doc._id.toString() } },
            {
                name: doc.name,
                description: doc.description,
                category: doc.category,
                brand: doc.brand,
                tags: doc.tags,
                price: doc.price,
                isDeleted: doc.isDeleted,
                image: doc.image,
                averageRating: doc.averageRating,
                reviewCount: doc.reviewCount
            }
        ]);

        const bulkResponse = await client.bulk({ refresh: true, operations });

        if (bulkResponse.errors) {
            console.error("Some documents failed to sync.");
        } else {
            console.log("Successfully synced all products to Elasticsearch.");
        }

    } catch (error) {
        console.error("Error during sync:", error.message);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
};

syncProducts();
