//const express = require('express');
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";


// These are necessary in ES modules to get __dirname
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

dotenv.config( { path: path.join( __dirname, ".env" ) } );

connectDB();

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

// const __dirname = path.resolve();
app.use(express.json());//allows us to accept JSON data in the req.body

//console.log( "✅ Routes loaded: /api/products" );

app.use("/api/products", productRoutes);

if(process.env.NODE_ENV === "production") {
   app.use(express.static(path.join(__dirname,"..","FRONTEND","dist")));


   app.get("/*",(req,res) =>{
      res.sendFile(path.join(__dirname,"..","FRONTEND","dist","index.html"));
   });
}

app.listen(PORT, () =>{
   console.log("Server started at http://localhost:"+ PORT);

});

//eCmt3eVLwxNL3r1y