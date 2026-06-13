import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    console.log("Attempting MongoDB connection...");

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB host:", conn.connection.host);
    console.log("MongoDB db:", conn.connection.name);

    return conn;
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;