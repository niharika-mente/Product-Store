import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectDB } from "./config/db.js";
const PORT = process.env.PORT || 5000;

// Connect DB FIRST
connectDB();
app.listen(PORT, () => {
  console.log(`   Server started at http://localhost:${PORT}`);
});