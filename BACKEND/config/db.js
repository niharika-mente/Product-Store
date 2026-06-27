import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

let mongoServer;

export const connectDB = async () => {
    try {
        // Check if MONGO_URI is provided in environment
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            // Start in-memory MongoDB for development/testing
            console.log("Starting MongoDB in-memory server...");
            mongoServer = await MongoMemoryServer.create();
            const memoryUri = mongoServer.getUri();
            await mongoose.connect(memoryUri);
            console.log(`MongoDB In-Memory Connected: Development Mode`);
            
            try {
                const Product = (await import("../models/product.model.js")).default;
                const count = await Product.countDocuments();
                if (count === 0) {
                    await Product.create([
                        { name: "Gaming Laptop Pro", price: 1299, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500", stock: 15, category: "Electronics", brand: "TechBrand" },
                        { name: "Wireless Mouse", price: 49, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500", stock: 50, category: "Electronics", brand: "TechBrand" }
                    ]);
                    console.log(`MongoDB In-Memory Seeded with mock data.`);
                }
            } catch (seedErr) {
                console.error("Failed to seed in-memory DB:", seedErr.message);
            }
        } else {
            // Connect to the provided MongoDB URI
            const conn = await mongoose.connect(mongoURI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        }
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);//process code 1 means exit with failure,0 means success
    }
}

