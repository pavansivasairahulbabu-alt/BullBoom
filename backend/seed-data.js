import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './src/models/Course.model.js';
import Quiz from './src/models/Quiz.model.js';
import Achievement from './src/models/Achievement.model.js';

dotenv.config();

const sampleCourses = [
  {
    title: "Master Options Trading",
    description: "Learn advanced options strategies, Greeks, and risk management from industry experts.",
    category: "Options Trading",
    instructor: "Rahul Sharma",
    thumbnail: "",
    duration: "12 Hours",
    difficulty: "Advanced",
    price: "Free",
    rating: 4.9,
    students: 20000,
    lessons: [
      { title: "Introduction to Options", duration: "45 min" },
      { title: "Understanding the Greeks", duration: "1 hour" },
      { title: "Options Strategies", duration: "1.5 hours" }
    ]
  },
  {
    title: "Technical Analysis Masterclass",
    description: "Master chart patterns, indicators, and technical analysis tools for successful trading.",
    category: "Technical Analysis",
    instructor: "Priya Patel",
    thumbnail: "",
    duration: "15 Hours",
    difficulty: "Intermediate",
    price: "₹1,499",
    rating: 4.8,
    students: 35000,
    lessons: [
      { title: "Chart Patterns 101", duration: "50 min" },
      { title: "Moving Averages", duration: "1 hour" },
      { title: "RSI and MACD", duration: "1.2 hours" }
    ]
  },
  {
    title: "Swing Trading Pro",
    description: "Learn to capture medium-term trends with proven swing trading strategies.",
    category: "Swing Trading",
    instructor: "Amit Kumar",
    thumbnail: "",
    duration: "10 Hours",
    difficulty: "Beginner",
    price: "₹999",
    rating: 4.7,
    students: 15000,
    lessons: [
      { title: "What is Swing Trading?", duration: "30 min" },
      { title: "Identifying Trends", duration: "45 min" },
      { title: "Entry and Exit Points", duration: "1 hour" }
    ]
  },
  {
    title: "Risk Management 101",
    description: "Learn how to protect your capital and manage risk effectively in trading.",
    category: "Risk Management",
    instructor: "Sneha Singh",
    thumbnail: "",
    duration: "6 Hours",
    difficulty: "Beginner",
    price: "Free",
    rating: 4.9,
    students: 12000,
    lessons: [
      { title: "Position Sizing", duration: "40 min" },
      { title: "Stop Loss Strategies", duration: "50 min" },
      { title: "Diversification", duration: "35 min" }
    ]
  }
];

const sampleQuizzes = [
  {
    title: "Options Basics Quiz",
    question: "What is the Delta of an At-The-Money option?",
    options: ["0.25", "0.50", "0.75", "1.00"],
    correctAnswer: 1,
    category: "Options Trading",
    difficulty: "Easy"
  },
  {
    title: "Technical Analysis Quiz",
    question: "Which pattern indicates a potential trend reversal?",
    options: ["Flag", "Head & Shoulders", "Triangle", "Cup & Handle"],
    correctAnswer: 1,
    category: "Technical Analysis",
    difficulty: "Medium"
  },
  {
    title: "Risk Management Quiz",
    question: "What is the maximum risk in buying a Call option?",
    options: ["Strike Price", "Premium Paid", "Unlimited", "Market Price"],
    correctAnswer: 1,
    category: "Risk Management",
    difficulty: "Easy"
  }
];

const sampleAchievements = [
  { name: "First Course", description: "Enroll in your first course", icon: "📚", pointsRequired: 0 },
  { name: "Quick Learner", description: "Complete 5 lessons", icon: "⚡", pointsRequired: 50 },
  { name: "Quiz Master", description: "Score 100% on 3 quizzes", icon: "🏆", pointsRequired: 100 },
  { name: "Options Expert", description: "Complete all options courses", icon: "🎯", pointsRequired: 200 },
  { name: "Trading Pro", description: "Complete 10 courses", icon: "👑", pointsRequired: 500 }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bullboom');
    console.log('Connected to MongoDB');

    await Course.deleteMany({});
    await Quiz.deleteMany({});
    await Achievement.deleteMany({});

    await Course.insertMany(sampleCourses);
    await Quiz.insertMany(sampleQuizzes);
    await Achievement.insertMany(sampleAchievements);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
