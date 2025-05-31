import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const connectDB = async () =>{
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
       console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1);//process code 1 means exit with failure,0 means success
    }
}