import dotenv from "dotenv";
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
import CourseCategory from "./src/models/CourseCategory.model.js";
import Topic from "./src/models/Topic.model.js";
import Quiz from "./src/models/Quiz.model.js";
import Achievement from "./src/models/Achievement.model.js";
import { isBrevoConfigured } from "./src/services/emailService.js";
import emailRoutes from "./src/routes/emailRoutes.js";

const validateEnv = () => {
  const requiredVars = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL", "NODE_ENV"];
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:", missing);
    process.exit(1);
  }

  console.log("✅ All environment variables are set");
};

const autoSeedLearningData = async () => {
  try {
    const categoryCount = await CourseCategory.countDocuments();

    if (categoryCount === 0) {
      console.log("🌱 No learning data found, auto-seeding database...");

      const categoriesData = [
        {
          name: "Options Basics",
          description:
            "Learn the fundamentals of options trading, including calls, puts, strike prices, and premiums.",
          icon: "🎯",
          difficulty: "Beginner",
          estimatedHours: 8,
          order: 1,
        },
        {
          name: "Charts & Candles",
          description:
            "Master technical analysis with candlestick patterns, chart types, and price action strategies.",
          icon: "📊",
          difficulty: "Beginner",
          estimatedHours: 6,
          order: 2,
        },
        {
          name: "Option Greeks",
          description:
            "Understand Delta, Gamma, Theta, Vega, and Rho—the Greeks that drive option pricing.",
          icon: "📈",
          difficulty: "Intermediate",
          estimatedHours: 10,
          order: 3,
        },
        {
          name: "Open Interest",
          description:
            "Learn how to analyze open interest and volume to predict market movements.",
          icon: "📉",
          difficulty: "Intermediate",
          estimatedHours: 5,
          order: 4,
        },
        {
          name: "Trading Strategies",
          description:
            "Discover advanced options strategies like straddles, strangles, and iron condors.",
          icon: "⚡",
          difficulty: "Advanced",
          estimatedHours: 12,
          order: 5,
        },
        {
          name: "Risk Management",
          description:
            "Protect your capital with position sizing, stop losses, and risk-reward analysis.",
          icon: "🛡️",
          difficulty: "Beginner",
          estimatedHours: 7,
          order: 6,
        },
        {
          name: "Trading Psychology",
          description:
            "Master your emotions, develop discipline, and build a winning trading mindset.",
          icon: "🧠",
          difficulty: "Intermediate",
          estimatedHours: 6,
          order: 7,
        },
        {
          name: "Swing Trading",
          description:
            "Learn swing trading techniques to profit from medium-term market trends.",
          icon: "📅",
          difficulty: "Intermediate",
          estimatedHours: 8,
          order: 8,
        },
        {
          name: "Intraday Trading",
          description:
            "Master day trading strategies including scalping, momentum, and VWAP-based trades.",
          icon: "🕒",
          difficulty: "Advanced",
          estimatedHours: 10,
          order: 9,
        },
        {
          name: "Futures & Options",
          description:
            "Complete guide to futures and options trading from basics to advanced strategies.",
          icon: "💰",
          difficulty: "Advanced",
          estimatedHours: 15,
          order: 10,
        },
      ];

      const createdCategories = await CourseCategory.insertMany(categoriesData);
      console.log("✅ Created " + createdCategories.length + " categories");

      const topicsData = [];
      topicsData.push(
        {
          category: createdCategories[0]._id,
          title: "What are Options?",
          description:
            "An introduction to options contracts and how they work.",
          icon: "📚",
          content:
            "<p>Options are financial derivatives that give buyers the right, but not the obligation, to buy or sell an underlying asset at a specified price on or before a specified date.</p>",
          keyTakeaways: [
            "Options give rights, not obligations",
            "Calls = right to buy, Puts = right to sell",
            "Every option has a limited lifespan",
          ],
          examples: [
            {
              title: "Everyday Analogy",
              description:
                "Think of an option like a rain check at a store: you pay a small fee to lock in a price, but you can choose not to use it.",
            },
          ],
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration: "10 min",
          order: 1,
        },
        {
          category: createdCategories[0]._id,
          title: "Call Option",
          description: "Everything you need to know about call options.",
          icon: "📈",
          content:
            "<p>A call option is a contract that gives the buyer the right to buy an underlying asset at a predetermined strike price before expiration.</p>",
          keyTakeaways: [
            "Calls profit from upward price movements",
            "Buyer risk limited to premium",
            "Seller has theoretically unlimited risk",
          ],
          examples: [
            {
              title: "Reliance Call Example",
              description:
                "Buy Reliance 2500 Call at ₹50. Profit starts when Reliance crosses ₹2550.",
            },
          ],
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          duration: "12 min",
          order: 2,
        },
      );

      await Topic.insertMany(topicsData);
      console.log("✅ Topics seeded");

      // --- Define all categories with data ---
      const allCategories = [
        // Category 1: Option Basics
        {
          name: "Option Basics",
          description:
            "Learn the fundamentals of options trading from beginner level.",
          icon: "🎯",
          difficulty: "Beginner",
          estimatedHours: 5,
          order: 1,
          topics: [
            {
              title: "What are Options?",
              description:
                "Learn the fundamentals of options contracts, rights, obligations, and contract structure.",
              icon: "📚",
              content: `<h3>American vs. European Options</h3>
<ul>
  <li>American options allow exercise at any point up to the expiration date.</li>
  <li>European options can only be exercised at the exact moment of expiration.</li>
  <li>Most individual stock options are American-style.</li>
  <li>Most broad market index options (like SPX) are European-style.</li>
</ul>

<h3>Rights vs Obligations</h3>
<ul>
  <li>Option buyers pay a premium to obtain rights.</li>
  <li>Option buyers have no obligations; they choose whether to trade.</li>
  <li>Option sellers receive a premium and take on obligations.</li>
  <li>Sellers must fulfill the contract if the buyer decides to exercise.</li>
</ul>

<h3>Contract Size</h3>
<ul>
  <li>One standard equity option contract represents exactly 100 shares of stock.</li>
  <li>Premium prices are quoted per share, so multiply by 100 for the total cost.</li>
  <li>An option quoted at $2.00 actually costs $200 to purchase.</li>
  <li>All gains, losses, and risk calculations scale by this 100-share multiplier.</li>
</ul>`,
              videoUrl: "",
              estimatedTime: "10 min",
              order: 1,
            },
            {
              title: "Call Options",
              description:
                "Understand how traders use call options to profit from bullish market moves.",
              icon: "📈",
              content: `<h3>Buying Calls (Long Call)</h3>
<ul>
  <li>Traders buy calls when they have a bullish market outlook.</li>
  <li>It profits when the underlying stock price moves sharply upward.</li>
  <li>It offers a cheaper way to control shares without buying stock directly.</li>
  <li>It provides high leverage, magnifying percentage gains relative to the capital risked.</li>
</ul>

<h3>Breakeven Price</h3>
<ul>
  <li>Calculated as the Strike Price plus the Premium paid.</li>
  <li>If you buy a $50 strike call for $3, breakeven is $53.</li>
  <li>The stock must rise past this point at expiry to net a profit.</li>
  <li>Selling the option before expiry can yield profits below this line.</li>
</ul>

<h3>Maximum Risk</h3>
<ul>
  <li>The risk is strictly capped at the total premium paid plus commissions.</li>
  <li>You cannot lose more money than your initial trade entry cost.</li>
  <li>Maximum loss occurs if the stock finishes below the strike price at expiry.</li>
  <li>The option simply expires completely worthless, resulting in a 100% loss.</li>
</ul>`,
              videoUrl: "",
              estimatedTime: "12 min",
              order: 2,
            },
            {
              title: "Put Options",
              description:
                "Learn how put options help traders profit from falling markets and protect investments.",
              icon: "📉",
              content: `<h3>Puts vs. Short-Selling</h3>
<ul>
  <li>Buying puts has strictly capped risk (the premium paid).</li>
  <li>Shorting stock carries theoretically unlimited risk if the price spikes.</li>
  <li>Puts do not require borrowing shares from a broker.</li>
  <li>Puts do not incur daily stock borrowing fees or dividend obligations.</li>
</ul>

<h3>Flat Stock Movement Effect</h3>
<ul>
  <li>A stagnant stock price causes the put to lose value daily.</li>
  <li>This loss is caused by time decay (Theta) eating extrinsic value.</li>
  <li>Implied volatility drops can accelerate this value loss.</li>
  <li>Holding a flat option until expiry results in total loss of premium.</li>
</ul>

<h3>Married Puts (Insurance)</h3>
<ul>
  <li>A strategy combining buying 100 shares of stock and 1 put option.</li>
  <li>The put acts as an insurance policy against a severe market crash.</li>
  <li>It establishes a concrete price floor where you can sell your shares.</li>
  <li>It allows you to participate in upside gains while limiting maximum downside.</li>
</ul>`,
              videoUrl: "",
              estimatedTime: "12 min",
              order: 3,
            },
          ],
        },
      ];

      // --- Process each category ---
      for (const categoryData of allCategories) {
        const { topics, ...categoryFields } = categoryData;

        let category = await CourseCategory.findOne({
          name: categoryData.name,
        });
        if (!category) {
          category = await CourseCategory.create(categoryFields);
          console.log(`✅ Created category: ${category.name}`);
        }

        for (const topicData of topics) {
          const topicWithCategory = { ...topicData, category: category._id };
          const existingTopic = await Topic.findOne({
            category: category._id,
            title: topicData.title,
          });
          if (!existingTopic) {
            await Topic.create(topicWithCategory);
            console.log(`✅ Created topic: ${topicData.title}`);
          }
        }
      }

      // --- Quiz Questions ---
      const quizQuestions = [
        {
          category: "Option Basics",
          difficulty: "Easy",
          title: "Options Basics Q1",
          question:
            "What is the standard expiry day for weekly Index options (like Nifty 50) in India?",
          options: ["Every Friday", "Every Thursday", "Every Wednesday"],
          correctAnswer: 1,
          explanation: "Weekly Nifty options in India expire every Thursday.",
        },
        {
          category: "Option Basics",
          difficulty: "Easy",
          title: "Options Basics Q2",
          question:
            "Unlike individual stocks, Nifty and Bank Nifty index options in India are:",
          options: [
            "American-style (exercised anytime)",
            "European-style (exercised only at expiry)",
            "Cash-settled only before Wednesday",
          ],
          correctAnswer: 1,
          explanation:
            "Index options in India are European-style and can only be exercised at expiry.",
        },
        {
          category: "Option Basics",
          difficulty: "Easy",
          title: "Options Basics Q3",
          question:
            "In India, if you hold an In-the-Money (ITM) stock option through expiry, how is it settled?",
          options: [
            "Cash settlement of the profit difference",
            "Physical delivery (you must buy/deliver the actual shares)",
            "The contract is canceled with zero value",
          ],
          correctAnswer: 1,
          explanation:
            "ITM stock options in India are physically settled at expiry.",
        },
      ];

      await Quiz.deleteMany({});
      await Quiz.insertMany(quizQuestions);
      console.log("✅ Quiz questions seeded");

      // --- Achievements ---
      const achievementsData = [
        {
          name: "Beginner Trader",
          description: "Complete your first learning topic!",
          icon: "📚",
          pointsRequired: 10,
          order: 1,
        },
        {
          name: "Options Explorer",
          description: "Finish all Options Basics topics.",
          icon: "🎯",
          pointsRequired: 70,
          order: 2,
        },
        {
          name: "Quiz Champion",
          description: "Score 80%+ on any category quiz.",
          icon: "🏆",
          pointsRequired: 100,
          order: 3,
        },
        {
          name: "Consistency Master",
          description: "Complete topics 5 days in a row.",
          icon: "🔥",
          pointsRequired: 50,
          order: 4,
        },
        {
          name: "Risk Manager",
          description: "Finish all Risk Management topics.",
          icon: "🛡️",
          pointsRequired: 50,
          order: 5,
        },
        {
          name: "Technical Analyst",
          description: "Master Charts & Candles.",
          icon: "📊",
          pointsRequired: 60,
          order: 6,
        },
        {
          name: "Psychology Expert",
          description: "Complete Trading Psychology.",
          icon: "🧠",
          pointsRequired: 50,
          order: 7,
        },
        {
          name: "Swing Trader",
          description: "Finish Swing Trading module.",
          icon: "📅",
          pointsRequired: 50,
          order: 8,
        },
        {
          name: "Intraday Expert",
          description: "Master Intraday Trading.",
          icon: "🕒",
          pointsRequired: 50,
          order: 9,
        },
        {
          name: "Bull Boom Legend",
          description: "Complete ALL topics! You are a legend.",
          icon: "🚀",
          pointsRequired: 500,
          order: 10,
        },
      ];

      await Achievement.deleteMany({});
      await Achievement.insertMany(achievementsData);
      console.log("✅ Achievements seeded");
      console.log("✅ Auto-seeding complete");
    } else {
      console.log("📚 Learning data already present, skipping auto-seed");
    }
  } catch (error) {
    console.error("❌ Auto-seeding error:", error);
  }
};

const app = express();

// Configure allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://bull-boom.onrender.com",
    ];

// CORS configuration with dynamic origin check
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Check if origin is in allowedOrigins list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get("/api/health", async (req, res) => {
  const config = isBrevoConfigured();
  res.status(200).json({
    success: true,
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    email:
      config.apiKeyConfigured && config.senderConfigured
        ? "configured"
        : "not configured",
    environment: process.env.NODE_ENV,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/email", emailRoutes);

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
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

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

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();

    // Auto-seed learning data if needed
    await autoSeedLearningData();

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 Bull Boom Server Started");
    console.log("🌐 Environment:", process.env.NODE_ENV);
    console.log("📡 Port:", process.env.PORT || 5000);
    console.log("🔗 Client URL:", process.env.CLIENT_URL);
    console.log("🗄️  MongoDB Connected");
    const config = isBrevoConfigured();
    console.log(
      "📧 Email:",
      config.apiKeyConfigured && config.senderConfigured
        ? "Brevo API Configured"
        : "Not Configured",
    );
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log("━━━━━━━━━━━━━━━━━━");
        console.log(`❌ Port ${PORT} is already occupied`);
        console.log("Please stop the existing process or change PORT in .env");
        console.log("━━━━━━━━━━━━━━━━━━");
        gracefulShutdown("portInUse");
      } else if (err.code === "EACCES") {
        console.log("━━━━━━━━━━━━━━━━━━");
        console.log(`❌ Port ${PORT} requires elevated privileges`);
        console.log("Please run with appropriate permissions or change PORT");
        console.log("━━━━━━━━━━━━━━━━━━");
        gracefulShutdown("permissionError");
      } else {
        console.error("❌ Server error:", err);
        gracefulShutdown("serverError");
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    gracefulShutdown("startError");
  }
};

startServer();
