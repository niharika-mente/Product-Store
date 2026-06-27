import "./loadEnv.js";
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
import newsletterRoutes from "./routes/newsletter.route.js";
import ordersRoutes from "./routes/orders.route.js";
import userRoutes from "./routes/user.route.js";
import couponRoutes from "./routes/coupon.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import referralRoutes from "./routes/referral.route.js";
import returnRoutes from "./routes/return.route.js";
import savedForLaterRoutes from "./routes/savedForLater.route.js";
import passport from "./config/passport.js";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import { stripeWebhook } from "./controllers/checkout.controller.js";
import { expressMiddleware } from "@as-integrations/express4";
import { apolloServer } from "./graphql/server.js";
import { optionalProtect } from "./middleware/auth.js";

// Import error handlers
import { notFoundHandler, errorHandler } from "./middleware/errorMiddleware.js";
import { validateEnv } from "./config/env.js";

// These are necessary in ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// dotenv.config is handled conditionally in loadEnv.js
if (process.env.NODE_ENV !== 'test') {
    validateEnv();
}
const missingCloudinary = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    .filter((key) => !process.env[key]);
if (missingCloudinary.length > 0) {
    console.warn(`Cloudinary credentials not configured (${missingCloudinary.join(', ')}). File uploads will be unavailable; URL-based images still work.`);
}
if (process.env.NODE_ENV !== 'test' || process.env.MONGO_URI) {
    connectDB();
}

const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

const scriptSrc = isDev
  ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
  : ["'self'"];

const connectSrc = ["'self'", "ws:"];
if (isDev) {
  connectSrc.push("http://localhost:5000");
}
if (process.env.VITE_API_URL) {
  connectSrc.push(process.env.VITE_API_URL);
}

// In development Apollo serves its embedded sandbox at GET /graphql from these
// CDNs. Allow them so the sandbox keeps working now that helmet also covers the
// /graphql route; production keeps the strict default-src 'self' policy.
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: isDev
    ? [...scriptSrc, "https://embeddable-sandbox.cdn.apollographql.com"]
    : scriptSrc,
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
  imgSrc: [
    "'self'", "data:", "blob:",
    "https://res.cloudinary.com", "https://via.placeholder.com",
    ...(isDev ? ["https://apollo-server-landing-page.cdn.apollographql.com"] : []),
  ],
  connectSrc: isDev
    ? [...connectSrc, "https://sandbox.embed.apollographql.com"]
    : connectSrc,
  workerSrc: ["'self'", "blob:"],
  ...(isDev
    ? {
        frameSrc: ["'self'", "https://sandbox.embed.apollographql.com"],
        manifestSrc: ["'self'", "https://apollo-server-landing-page.cdn.apollographql.com"],
      }
    : {}),
};

const app = express();
await apolloServer.start();

// Register helmet BEFORE the routes (including /graphql) so every response —
// API and GraphQL alike — carries the hardened security headers.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives,
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  "/graphql",
  express.json(),
  optionalProtect,
  expressMiddleware(apolloServer, {
    context: async ({ req }) => ({
      user: req.user || null,
    }),
  })
);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
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
app.use(passport.initialize());

// Stripe webhook needs raw body — must be registered before express.json()
app.post("/api/checkout/webhook", express.raw({ type: 'application/json' }), stripeWebhook);

app.use("/api", limiter);

app.use(express.json());

// ============= API ROUTES =============

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/user", userRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/saved-for-later", savedForLaterRoutes);


// ============= ERROR HANDLERS =============
// Must come before the production catch-all so unmatched /api/* routes
// get a JSON 404 instead of index.html
app.use(notFoundHandler);
app.use(errorHandler);

// ============= PRODUCTION STATIC FILES & REACT APP =============
// notFoundHandler calls next() for non-API paths, which falls through here
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "..", "FRONTEND", "dist")));
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




