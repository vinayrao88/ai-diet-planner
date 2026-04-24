import mongoose from "mongoose";

const connectDB = async () => {
  const rawUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const mongoUri = rawUri?.trim().replace(/^['"]|['"]$/g, "");

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is missing. Set MONGO_URI (or MONGODB_URI) in environment variables."
    );
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });
  console.log("MongoDB connected");
};

export default connectDB;
