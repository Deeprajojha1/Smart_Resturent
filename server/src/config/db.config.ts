import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in your .env file");
    }

    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown MongoDB connection error";
    console.error(`MongoDB Connection Error: ${message}`);
    process.exit(1);
  }
};

export default connectDB;
