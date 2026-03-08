import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/smart-financial-goal";

    const conn = await mongoose.connect(mongoURI, {
      retryWrites: true,
      w: "majority",
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
