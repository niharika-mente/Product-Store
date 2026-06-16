import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "../../config/db.js"; 
import productRoutes from "./routes/product.route.js";
import wishlistRoutes from "./routes/wishlist.route.js";
import reviewRoutes from "./routes/review.route.js";
import { notFoundHandler, errorHandler } from "../../middleware/errorMiddleware.js";
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
// Target Microservice Routes
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);
const PORT = process.env.PRODUCT_SERVICE_PORT || 5001;
connectDB();
app.listen(PORT, () => {
    console.log(`🚀 Product Microservice running cleanly on port ${PORT}`);
});
