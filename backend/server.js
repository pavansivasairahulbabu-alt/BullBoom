import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Load environment variables from this backend folder, regardless of cwd.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

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
import Position from "./src/models/Position.model.js";
import { executeAutoExitOrder } from "./src/services/trading.service.js";
import { getMarketData } from "./src/services/marketDataProvider.js";
import { v4 as uuidv4 } from "uuid";

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

// Auto-Exit Monitoring - Check positions every 3 seconds
const monitorPositionsForAutoExit = async () => {
  try {
    // Get all OPEN BUY positions
    const openPositions = await Position.find({
      orderType: 'BUY',
      status: 'OPEN',
      $or: [
        { targetPrice: { $exists: true, $ne: null } },
        { stopLossPrice: { $exists: true, $ne: null } }
      ]
    });

    for (const position of openPositions) {
      try {
        // Get current market price for the symbol
        const marketData = await getMarketData(position.symbol);
        const currentPrice = marketData.price;
        
        let exitReason = null;
        
        // Check target hit (for LONG positions, target is above entry)
        if (position.targetPrice && currentPrice >= position.targetPrice) {
          exitReason = 'TARGET HIT';
        }
        // Check stop loss hit
        else if (position.stopLossPrice && currentPrice <= position.stopLossPrice) {
          exitReason = 'STOP LOSS HIT';
        }

        if (exitReason) {
          console.log(`Auto-exit triggered for position ${position._id}, ${exitReason}`);
          await executeAutoExitOrder(position.userId, {
            symbol: position.symbol,
            exitPrice: currentPrice,
            exitReason: exitReason,
            executionId: uuidv4()
          });
        }
      } catch (err) {
        console.error(`Error checking position ${position._id}:`, err);
      }
    }
  } catch (error) {
    console.error('Error in auto-exit monitor:', error);
  }
};

// Start monitoring after DB connected
setTimeout(() => {
  console.log('🔍 Starting auto-exit position monitor...');
  setInterval(monitorPositionsForAutoExit, 3000);
}, 5000);
