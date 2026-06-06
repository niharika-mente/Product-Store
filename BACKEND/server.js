//const express = require('express');
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";


// Import the app configured in app.js and start the server
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const REQUIRED_ENV = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Add them to your .env file. See .env.example for reference.');
    process.exit(1);
}

app.listen(PORT, () =>{
   console.log("\n🚀 ================================");
   console.log(`   Server started at http://localhost:${PORT}`);
   console.log("   ================================\n");
});
