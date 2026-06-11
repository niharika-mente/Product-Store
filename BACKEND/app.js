import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import checkoutRoutes from "./routes/checkout.route.js";
import reviewRoutes from "./routes/review.route.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

// These are necessary in ES modules to get __dirname
const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

dotenv.config({ path: path.join(__dirname, ".env") });

if (process.env.NODE_ENV === 'production') {
    const REQUIRED_ENV = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
    const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        console.error(`Missing required environment variables: ${missing.join(', ')}`);
        console.error('Add them to your .env file. See .env.example for reference.');
        process.exit(1);
    }
}

if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();
app.use(helmet());
app.set("trust proxy", 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again later."
});
const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error("CORS Policy Error: Origin not allowed"));
    },
    credentials: true
}));
app.use(express.json());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", limiter);


app.use("/api/products", productRoutes);
app.use("/api/products/:productId/reviews", reviewRoutes);
app.use("/api/checkout", checkoutRoutes);

app.use("/api/*", (req, res) => {
    res.status(404).json({ success: false, message: "API route not found" });
});

if(process.env.NODE_ENV === "production") {
   app.use(express.static(path.join(__dirname,"..","FRONTEND","dist")));

   app.get("/*",(req,res) =>{
      res.sendFile(path.join(__dirname,"..","FRONTEND","dist","index.html"));
   });
}

export default app;