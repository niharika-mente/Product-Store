import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "test") {
  const envTestPath = path.join(__dirname, ".env.test");
  if (fs.existsSync(envTestPath)) {
    dotenv.config({ path: envTestPath });
  }
} else {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
