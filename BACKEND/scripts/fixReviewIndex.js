import mongoose from "mongoose";
import Review from "../models/review.model.js";
import dotenv from "dotenv";

dotenv.config(); 

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  try {
    await Review.collection.dropIndex("product_1_userName_1");
    console.log("Old index dropped successfully");
  } catch (err) {
    console.log("Old index not found or already removed");
  }

  console.log("Done");
  process.exit();
};

run();