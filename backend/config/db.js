import dns from "dns";

dns.setDefaultResultOrder("ipv4first");

import mongoose from "mongoose";

const connectDB = async () => {
  console.log("Attempting MongoDB connection...");

  const conn = await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB host:", conn.connection.host);
  console.log("MongoDB db:", conn.connection.name);

  return conn;
};

export default connectDB;
