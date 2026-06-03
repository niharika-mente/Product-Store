import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import { errorHandler,notFoundHandler } from "./middleware/errorMiddleware.js"; // ← ADD THIS LINE

// These are necessary in ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

connectDB();

const app = express();

app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(cors());
app.use(express.json());
app.use("/api", limiter);

app.use("/api/products", productRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "FRONTEND", "dist")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "FRONTEND", "dist", "index.html"));
  });
}

export default app;