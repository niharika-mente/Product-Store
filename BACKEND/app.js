import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import authRoutes from "./routes/auth.routes.js";
import checkoutRoutes from "./routes/checkout.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import reviewRoutes from "./routes/review.route.js";
import passport from "./config/passport.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';

// Import error handlers
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js";
import { validateEnv } from "./config/env.js";

// These are necessary in ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
if (process.env.NODE_ENV !== 'test') {
    validateEnv();
}
const missingCloudinary = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    .filter((key) => !process.env[key]);
if (missingCloudinary.length > 0) {
    console.warn(`Cloudinary credentials not configured (${missingCloudinary.join(', ')}). File uploads will be unavailable; URL-based images still work.`);
}
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

const app = express();
app.use(helmet());
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
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
app.use(passport.initialize());
app.use("/api", limiter);

// ============= API ROUTES =============
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products/:productId/reviews", reviewRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/wishlist", wishlistRoutes);

// ============= PRODUCTION STATIC FILES & REACT APP =============
if (process.env.NODE_ENV === "production") {
  // Serve static files from FRONTEND/dist
  app.use(express.static(path.join(__dirname, "..", "FRONTEND", "dist")));

  // Catch-all route for React app (client-side routing)
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "FRONTEND", "dist", "index.html"));
  });
}

// ============= ERROR HANDLERS (ALWAYS AT THE BOTTOM) =============
// 404 handler for unmatched routes (API routes that don't exist)
app.use(notFoundHandler);
// Global error handler
app.use(errorHandler);

export default app;