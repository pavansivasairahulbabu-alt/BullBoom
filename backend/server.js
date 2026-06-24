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
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import mongoose from "mongoose";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import watchlistRoutes from "./src/routes/watchlistRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import positionRoutes from "./src/routes/positionRoutes.js";
import educationRoutes from "./src/routes/educationRoutes.js";
import triggerOrderRoutes from "./src/routes/triggerOrderRoutes.js";
import Position from "./src/models/Position.model.js";
import User from "./src/models/User.model.js";
import { executeAutoExitOrder } from "./src/services/trading.service.js";
import { getMarketData } from "./src/services/marketDataProvider.js";
import { monitorTriggerOrders, setSocketIO } from "./src/services/triggerOrder.service.js";
import { v4 as uuidv4 } from "uuid";

const app = express();

// ─── CORS origins ─────────────────────────────────────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://bullboom.onrender.com",
  "https://bull-boom.onrender.com",
  process.env.CLIENT_URL,
].filter(Boolean);

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── HTTP server + Socket.IO ──────────────────────────────────────────────────
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Inject Socket.IO into trigger order service
setSocketIO(io);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return next(new Error("Authentication error: no token"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch {
    next(new Error("Authentication error: invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  console.log(`[Socket.IO] User connected: ${userId}`);

  // Join a private room for this user
  socket.join(`user:${userId}`);

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] User disconnected: ${userId}`);
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Bull Boom Backend Running",
  });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/trigger-orders", triggerOrderRoutes);

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route Not Found" });
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
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

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log("━━━━━━━━━━━━━━━━━━");
      console.log("🚀 Bull Boom Server Started");
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📡 Port: ${PORT}`);
      console.log("🗄️  MongoDB Connected");
      console.log("🔌 Socket.IO Ready");
      console.log("━━━━━━━━━━━━━━━━━━");
    });

    httpServer.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`❌ Port ${PORT} is already occupied`);
      } else if (err.code === "EACCES") {
        console.log(`❌ Port ${PORT} requires elevated privileges`);
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

startServer();

// ─── Auto-Exit Position Monitor (existing feature) ───────────────────────────
const monitorPositionsForAutoExit = async () => {
  try {
    const openPositions = await Position.find({
      orderType: "BUY",
      status: "OPEN",
      $or: [
        { targetPrice: { $exists: true, $ne: null } },
        { stopLossPrice: { $exists: true, $ne: null } },
      ],
    });

    for (const position of openPositions) {
      try {
        const marketData = await getMarketData(position.symbol);
        const currentPrice = marketData.price;
        let exitReason = null;

        if (position.targetPrice && currentPrice >= position.targetPrice) {
          exitReason = "TARGET HIT";
        } else if (position.stopLossPrice && currentPrice <= position.stopLossPrice) {
          exitReason = "STOP LOSS HIT";
        }

        if (exitReason) {
          console.log(`Auto-exit triggered for position ${position._id}, ${exitReason}`);
          await executeAutoExitOrder(position.userId, {
            symbol: position.symbol,
            exitPrice: currentPrice,
            exitReason,
            executionId: uuidv4(),
          });
        }
      } catch (err) {
        console.error(`Error checking position ${position._id}:`, err);
      }
    }
  } catch (error) {
    console.error("Error in auto-exit monitor:", error);
  }
};

// ─── Start Monitors after DB connects ─────────────────────────────────────────
setTimeout(() => {
  console.log("🔍 Starting auto-exit position monitor...");
  setInterval(monitorPositionsForAutoExit, 3000);

  console.log("🎯 Starting trigger order monitor...");
  setInterval(monitorTriggerOrders, 2000); // Check every 2 seconds
}, 5000);

// ─── Broadcast live prices via Socket.IO every 2 seconds ──────────────────────
// This lets frontend components receive real-time price pushes when connected.
setTimeout(() => {
  setInterval(async () => {
    const symbols = [
      "NIFTY", "BANKNIFTY", "SENSEX", "RELIANCE", "INFY", "TCS",
      "HDFCBANK", "ICICIBANK", "SBIN", "AXISBANK", "KOTAKBANK",
      "TATAMOTORS", "MARUTI", "TITAN", "ASIANPAINT", "HINDUNILVR",
      "BAJAJFINSV", "BAJFINANCE", "LICI", "ADANIGREEN", "ADANIENT",
    ];
    const prices = {};
    for (const symbol of symbols) {
      try {
        const d = await getMarketData(symbol);
        prices[symbol] = { price: d.price, change: d.change, changePercent: d.changePercent };
      } catch { /* ignore */ }
    }
    io.emit("priceUpdate", prices);
  }, 2000);
}, 6000);
