import mongoose from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

let mongoServer;

export const connectDB = async () =>{
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
        } else {
            // Connect to the provided MongoDB URI
            const conn = await mongoose.connect(mongoURI);
            console.log(`MongoDB Connected: ${conn.connection.host}`);
        }
    } catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1);//process code 1 means exit with failure,0 means success
    }
}

// Graceful shutdown
export const disconnectDB = async () => {
    if (mongoServer) {
        await mongoServer.stop();
    }
    await mongoose.disconnect();
};
