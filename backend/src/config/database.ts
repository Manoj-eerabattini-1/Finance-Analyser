import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

const connectDB = async (): Promise<void> => {
  try {
    let mongoURI = process.env.MONGODB_URI;
    console.log("ENV URI:", process.env.MONGODB_URI);
    console.log("Connected DB:", mongoose.connection.name);
    
    // If MongoDB Atlas URI fails, try local MongoDB
    if (!mongoURI) {
      console.warn("⚠️ MONGODB_URI not found in .env, using local MongoDB...");
      mongoURI = "mongodb://localhost:27017/financePlanner";
    }

    console.log("📡 Attempting MongoDB connection...");
    console.log(`Connection string: ${mongoURI.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB'}`);

    const conn = await mongoose.connect(mongoURI, {
      retryWrites: true,
      w: "majority",
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("⚠️ MongoDB connection failed:", errorMessage);
    
    
    // Don't crash the server - continue without database
    console.log("\n🚀 Server will start without database. Connect MongoDB later.");
  }
};

export { connectDB, isConnected };
