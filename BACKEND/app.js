import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import checkoutRoutes from "./routes/checkout.route.js";

// These are necessary in ES modules to get __dirname
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

dotenv.config({ path: path.join(__dirname, ".env") });

connectDB();

const app = express();

app.set("trust proxy", 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
});
// Configure trusted origins for CORS
const allowedOrigins = [
   "http://localhost:5173",
   process.env.FRONTEND_URL
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS Policy Error: Origin not allowed"));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use("/api", limiter);

app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);

if(process.env.NODE_ENV === "production") {
   app.use(express.static(path.join(__dirname,"..","FRONTEND","dist")));

   app.get("/*",(req,res) =>{
      res.sendFile(path.join(__dirname,"..","FRONTEND","dist","index.html"));
   });
}

export default app;