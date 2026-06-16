import dotenv from "dotenv";
// Load environment variables FIRST before any other imports!
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import watchlistRoutes from "./src/routes/watchlistRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import positionRoutes from "./src/routes/positionRoutes.js";
import educationRoutes from "./src/routes/educationRoutes.js";

const app = express();

// Middleware
app.use(helmet()); // Add security headers
app.use(morgan("dev")); // Log HTTP requests
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://bullboom.onrender.com",
      "https://bull-boom.onrender.com",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  }),
);
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookies

// Health Check Route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bull Boom Backend Running",
  });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// User Routes
app.use("/api/user", userRoutes);

// Watchlist Routes
app.use("/api/watchlist", watchlistRoutes);

// Order Routes
app.use("/api/orders", orderRoutes);

// Position Routes
app.use("/api/positions", positionRoutes);

// Education Routes
app.use("/api/education", educationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("✅ MongoDB connection closed");
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server and connect to DB
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start Express server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log("━━━━━━━━━━━━━━━━━━");
      console.log("🚀 Bull Boom Server Started");
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📡 Port: ${PORT}`);
      console.log("🗄️ MongoDB Connected");
      console.log("━━━━━━━━━━━━━━━━━━");
    });

    // Handle server errors
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log("━━━━━━━━━━━━━━━━━━");
        console.log(`❌ Port ${PORT} is already occupied`);
        console.log("Please stop the existing process or change PORT in .env");
        console.log("━━━━━━━━━━━━━━━━━━");
      } else if (err.code === "EACCES") {
        console.log("━━━━━━━━━━━━━━━━━━");
        console.log(`❌ Port ${PORT} requires elevated privileges`);
        console.log("Please run with appropriate permissions or change PORT");
        console.log("━━━━━━━━━━━━━━━━━━");
      } else {
        console.error("❌ Server error:", err);
      }
      gracefulShutdown("serverError");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    gracefulShutdown("startError");
  }
};

// Initialize the server
startServer();
