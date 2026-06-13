
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import watchlistRoutes from './src/routes/watchlistRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import positionRoutes from './src/routes/positionRoutes.js';
import educationRoutes from './src/routes/educationRoutes.js';
import CourseCategory from './src/models/CourseCategory.model.js';
import Topic from './src/models/Topic.model.js';
import Quiz from './src/models/Quiz.model.js';
import Achievement from './src/models/Achievement.model.js';
import nodemailer from 'nodemailer';

const validateEnv = () => {
  const requiredVars = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL', 'EMAIL_USER', 'EMAIL_PASS', 'NODE_ENV'];
  const missing = requiredVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  console.log('✅ All environment variables are set');
};

const verifySMTP = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.verify();
    console.log('✅ SMTP Connected');
    return transporter;
  } catch (error) {
    console.error('❌ SMTP Failed:', error.message);
    return null;
  }
};

const autoSeedLearningData = async () => {
  try {
    const categoryCount = await CourseCategory.countDocuments();
    
    if (categoryCount === 0) {
      console.log('🌱 No learning data found, auto-seeding database...');
      
      const categoriesData = [
        { name: 'Options Basics', description: 'Learn the fundamentals of options trading, including calls, puts, strike prices, and premiums.', icon: '🎯', difficulty: 'Beginner', estimatedHours: 8, order: 1 },
        { name: 'Charts & Candles', description: 'Master technical analysis with candlestick patterns, chart types, and price action strategies.', icon: '📊', difficulty: 'Beginner', estimatedHours: 6, order: 2 },
        { name: 'Option Greeks', description: 'Understand Delta, Gamma, Theta, Vega, and Rho—the Greeks that drive option pricing.', icon: '📈', difficulty: 'Intermediate', estimatedHours: 10, order: 3 },
        { name: 'Open Interest', description: 'Learn how to analyze open interest and volume to predict market movements.', icon: '📉', difficulty: 'Intermediate', estimatedHours: 5, order: 4 },
        { name: 'Trading Strategies', description: 'Discover advanced options strategies like straddles, strangles, and iron condors.', icon: '⚡', difficulty: 'Advanced', estimatedHours: 12, order: 5 },
        { name: 'Risk Management', description: 'Protect your capital with position sizing, stop losses, and risk-reward analysis.', icon: '🛡️', difficulty: 'Beginner', estimatedHours: 7, order: 6 },
        { name: 'Trading Psychology', description: 'Master your emotions, develop discipline, and build a winning trading mindset.', icon: '🧠', difficulty: 'Intermediate', estimatedHours: 6, order: 7 },
        { name: 'Swing Trading', description: 'Learn swing trading techniques to profit from medium-term market trends.', icon: '📅', difficulty: 'Intermediate', estimatedHours: 8, order: 8 },
        { name: 'Intraday Trading', description: 'Master day trading strategies including scalping, momentum, and VWAP-based trades.', icon: '🕒', difficulty: 'Advanced', estimatedHours: 10, order: 9 },
        { name: 'Futures & Options', description: 'Complete guide to futures and options trading from basics to advanced strategies.', icon: '💰', difficulty: 'Advanced', estimatedHours: 15, order: 10 }
      ];

      const createdCategories = await CourseCategory.insertMany(categoriesData);
      console.log('✅ Created ' + createdCategories.length + ' categories');

      const topicsData = [];
      topicsData.push(
        { category: createdCategories[0]._id, title: 'What are Options?', description: 'An introduction to options contracts and how they work.', icon: '📚', content: '<p>Options are financial derivatives that give buyers the right, but not the obligation, to buy or sell an underlying asset at a specified price on or before a specified date.</p>', keyTakeaways: ['Options give rights, not obligations', 'Calls = right to buy, Puts = right to sell', 'Every option has a limited lifespan'], examples: [{ title: 'Everyday Analogy', description: 'Think of an option like a rain check at a store: you pay a small fee to lock in a price, but you can choose not to use it.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '10 min', order: 1 },
        { category: createdCategories[0]._id, title: 'Call Option', description: 'Everything you need to know about call options.', icon: '📈', content: '<p>A call option is a contract that gives the buyer the right to buy an underlying asset at a predetermined strike price before expiration.</p>', keyTakeaways: ['Calls profit from upward price movements', 'Buyer risk limited to premium', 'Seller has theoretically unlimited risk'], examples: [{ title: 'Reliance Call Example', description: 'Buy Reliance 2500 Call at ₹50. Profit starts when Reliance crosses ₹2550.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12 min', order: 2 }
      );

      await Topic.insertMany(topicsData);

      const achievementsData = [
        { name: 'Beginner Trader', description: 'Complete your first learning topic!', icon: '📚', pointsRequired: 10, order: 1 },
        { name: 'Options Explorer', description: 'Finish all Options Basics topics.', icon: '🎯', pointsRequired: 70, order: 2 },
        { name: 'Quiz Champion', description: 'Score 80%+ on any category quiz.', icon: '🏆', pointsRequired: 100, order: 3 },
        { name: 'Consistency Master', description: 'Complete topics 5 days in a row.', icon: '🔥', pointsRequired: 50, order: 4 },
        { name: 'Risk Manager', description: 'Finish all Risk Management topics.', icon: '🛡️', pointsRequired: 50, order: 5 },
        { name: 'Technical Analyst', description: 'Master Charts & Candles.', icon: '📊', pointsRequired: 60, order: 6 },
        { name: 'Psychology Expert', description: 'Complete Trading Psychology.', icon: '🧠', pointsRequired: 50, order: 7 },
        { name: 'Swing Trader', description: 'Finish Swing Trading module.', icon: '📅', pointsRequired: 50, order: 8 },
        { name: 'Intraday Expert', description: 'Master Intraday Trading.', icon: '🕒', pointsRequired: 50, order: 9 },
        { name: 'Bull Boom Legend', description: 'Complete ALL topics! You are a legend.', icon: '🚀', pointsRequired: 500, order: 10 }
      ];

      await Achievement.insertMany(achievementsData);

      console.log('✅ Auto-seeding complete');
    } else {
      console.log('📚 Learning data already present, skipping auto-seed');
    }
  } catch (error) {
    console.error('❌ Auto-seeding error:', error);
  }
};

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.CLIENT_URL
    ],
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/api/health', async (req, res) => {
  res.status(200).json({
    success: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    email: process.env.EMAIL_USER ? 'configured' : 'not configured',
    environment: process.env.NODE_ENV
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/education', educationRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found'
  });
});

const gracefulShutdown = async (signal) => {
  console.log('\nReceived ' + signal + ', shutting down gracefully...');
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();
    await autoSeedLearningData();
    const smtpStatus = await verifySMTP();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Bull Boom Server Started');
    console.log('🌐 Environment:', process.env.NODE_ENV);
    console.log('📡 Port:', process.env.PORT || 5000);
    console.log('🔗 Client URL:', process.env.CLIENT_URL);
    console.log('🗄️  MongoDB Connected');
    console.log('📧 SMTP:', smtpStatus ? 'Connected' : 'Not Connected');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log('Server listening on port ' + PORT);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('━━━━━━━━━━━━━━━━━━');
        console.log('❌ Port ' + PORT + ' is already occupied');
        console.log('Please stop the existing process or change PORT in .env');
        console.log('━━━━━━━━━━━━━━━━━━');
      } else if (err.code === 'EACCES') {
        console.log('━━━━━━━━━━━━━━━━━━');
        console.log('❌ Port ' + PORT + ' requires elevated privileges');
        console.log('Please run with appropriate permissions or change PORT');
        console.log('━━━━━━━━━━━━━━━━━━');
      } else {
        console.error('❌ Server error:', err);
      }
      gracefulShutdown('serverError');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    gracefulShutdown('startError');
  }
};

startServer();
