import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () =>{
    try {
      let mongoUri = process.env.MONGO_URI;

      console.log( "🔌 Attempting to connect to MongoDB..." );
      console.log( `📍 MONGO_URI exists: ${mongoUri ? 'YES' : 'NO'}` );

      if ( !mongoUri )
      {
         console.log( "⚠️  No MONGO_URI environment variable set. Starting mongodb-memory-server..." );
         const { MongoMemoryServer } = await import( "mongodb-memory-server" );
         const mongoServer = await MongoMemoryServer.create();
         mongoUri = mongoServer.getUri();
         console.log( `💾 In-memory MongoDB started at: ${ mongoUri }` );
      }

      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📦 Database name: ${conn.connection.name}`);
    } catch(error){
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);//process code 1 means exit with failure,0 means success
    }
}