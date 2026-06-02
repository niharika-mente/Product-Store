import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () =>{
    try {
      let mongoUri = process.env.MONGO_URI;

      if ( !mongoUri )
      {
         console.log( "No MONGO_URI environment variable set. Starting mongodb-memory-server..." );
         const { MongoMemoryServer } = await import( "mongodb-memory-server" );
         const mongoServer = await MongoMemoryServer.create();
         mongoUri = mongoServer.getUri();
         console.log( `In-memory MongoDB started at: ${ mongoUri }` );
      }

      const conn = await mongoose.connect(mongoUri);
       console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1);//process code 1 means exit with failure,0 means success
    }
}