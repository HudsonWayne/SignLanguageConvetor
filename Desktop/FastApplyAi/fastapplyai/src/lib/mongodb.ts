import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ Missing MONGODB_URI in environment variables");
}

export async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      // already connected
      return mongoose.connection;
    }
    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected");
    return mongoose.connection;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}
