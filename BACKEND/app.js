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

dotenv.config({ path: path.join(__dirname, ".env") });

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);

if(process.env.NODE_ENV === "production") {
   app.use(express.static(path.join(__dirname,"..","FRONTEND","dist")));

   app.get("/*",(req,res) =>{
      res.sendFile(path.join(__dirname,"..","FRONTEND","dist","index.html"));
   });
}

export default app;