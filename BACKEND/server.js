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

app.listen(PORT, () =>{
   console.log("Server started at http://localhost:"+ PORT);

});

//eCmt3eVLwxNL3r1y