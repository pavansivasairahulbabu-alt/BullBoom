import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../src/models/Course.model.js';
import Quiz from '../src/models/Quiz.model.js';
import Achievement from '../src/models/Achievement.model.js';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';

dotenv.config();

const categories = [
  {
    name: 'Options Basics',
    description: 'Learn the fundamentals of options trading including calls, puts, strike prices, and premiums.',
    icon: '🎯',
    difficulty: 'Beginner',
    order: 1,
  },
  {
    name: 'Charts & Candles',
    description: 'Master technical analysis with chart patterns, candlesticks, and indicators.',
    icon: '📊',
    difficulty: 'Beginner',
    order: 2,
  },
  {
    name: 'Option Greeks',
    description: 'Understand Delta, Gamma, Theta, Vega, and Rho and how they impact options pricing.',
    icon: '📈',
    difficulty: 'Intermediate',
    order: 3,
  },
  {
    name: 'Open Interest',
    description: 'Learn how open interest and volume can predict market movements.',
    icon: '📊',
    difficulty: 'Intermediate',
    order: 4,
  },
  {
    name: 'Trading Strategies',
    description: 'Discover advanced trading strategies for different market conditions.',
    icon: '⚡',
    difficulty: 'Advanced',
    order: 5,
  },
  {
    name: 'Risk Management',
    description: 'Protect your capital with proven risk management techniques.',
    icon: '🛡️',
    difficulty: 'Beginner',
    order: 6,
  },
  {
    name: 'Trading Psychology',
    description: 'Master your emotions and develop a winning trading mindset.',
    icon: '🧠',
    difficulty: 'Intermediate',
    order: 7,
  },
  {
    name: 'Swing Trading',
    description: 'Learn to capture medium-term trends with swing trading strategies.',
    icon: '📅',
    difficulty: 'Intermediate',
    order: 8,
  },
  {
    name: 'Intraday Trading',
    description: 'Master the art of day trading with real-time market analysis.',
    icon: '🕒',
    difficulty: 'Advanced',
    order: 9,
  },
  {
    name: 'Futures & Options',
    description: 'Complete guide to futures and options trading strategies.',
    icon: '📈',
    difficulty: 'Advanced',
    order: 10,
  },
  {
    name: 'Algorithmic Trading',
    description: 'Automate your trading with algorithms and backtesting.',
    icon: '🤖',
    difficulty: 'Advanced',
    order: 11,
  },
  {
    name: 'Crypto Trading',
    description: 'Learn to trade cryptocurrencies with confidence.',
    icon: '₿',
    difficulty: 'Intermediate',
    order: 12,
  },
];

const createTopics = (categoryId) => {
  const topicsByCategory = {
    'Options Basics': [
      {
        title: 'What are Options?',
        description: 'An introduction to options contracts.',
        estimatedTime: '5 min',
        icon: '📚',
        content: '<p>Options are financial derivatives that give buyers the right, but not the obligation, to buy or sell an underlying asset at a specified price on or before a specified date.</p>',
        examples: [
          {
            title: 'Call Option Example',
            description: 'You buy a call option for Reliance at ₹2500 strike price for ₹50 premium.'
          }
        ],
        keyTakeaways: ['Options give rights, not obligations', 'Calls give right to buy', 'Puts give right to sell'],
        quiz: [
          {
            question: 'What is an option?',
            options: ['A stock', 'A derivative contract', 'A bond', 'A commodity'],
            correctAnswer: 1,
            explanation: 'Options are financial derivatives.'
          }
        ]
      },
      {
        title: 'What is Call Option?',
        description: 'Learn about call options.',
        estimatedTime: '6 min',
        icon: '📈',
        keyTakeaways: ['Call = right to buy'],
        quiz: []
      },
      {
        title: 'What is Put Option?',
        description: 'Learn about put options.',
        estimatedTime: '6 min',
        icon: '📉',
        keyTakeaways: ['Put = right to sell'],
        quiz: []
      },
      {
        title: 'What is Strike Price?',
        description: 'Understand strike price concept.',
        estimatedTime: '5 min',
        icon: '🎯',
        keyTakeaways: ['Strike = agreed price'],
        quiz: []
      },
      {
        title: 'What is Premium?',
        description: 'Option premium basics.',
        estimatedTime: '5 min',
        icon: '💰',
        keyTakeaways: ['Premium = option price'],
        quiz: []
      },
      {
        title: 'What is Expiry?',
        description: 'Learn about expiry dates.',
        estimatedTime: '4 min',
        icon: '📅',
        keyTakeaways: ['Expiry = last trading day'],
        quiz: []
      },
      {
        title: 'What is Margin?',
        description: 'Margin requirements explained.',
        estimatedTime: '7 min',
        icon: '🔒',
        keyTakeaways: ['Margin = collateral'],
        quiz: []
      },
    ],
    'Charts & Candles': [
      {
        title: 'Introduction to Charts',
        description: 'Basics of stock charts.',
        estimatedTime: '5 min',
        icon: '📊',
        keyTakeaways: ['Charts show price action'],
        quiz: []
      },
      {
        title: 'Candlestick Patterns',
        description: 'Learn to read candlesticks.',
        estimatedTime: '10 min',
        icon: '🕯️',
        keyTakeaways: ['Candles show OHLC'],
        quiz: []
      },
    ],
  };
  return topicsByCategory[categoryId] || [];
};

const quizzes = [
  { title: 'Options Basics Quiz 1', question: 'What is the Delta of an ATM option?', options: ['0.25', '0.5', '0.75', '1.0'], correctAnswer: 1, category: 'Options Trading', difficulty: 'Easy' },
  { title: 'Options Basics Quiz 2', question: 'Which option gives right to buy?', options: ['Put', 'Call', 'Future', 'Warrant'], correctAnswer: 1, category: 'Options Trading', difficulty: 'Easy' },
  { title: 'Charts Quiz 1', question: 'What does OHLC stand for?', options: ['Open High Low Close', 'Order High Low Close', 'Open High Low Cost', 'Order High Low Cost'], correctAnswer: 0, category: 'Technical Analysis', difficulty: 'Easy' },
  { title: 'Risk Quiz 1', question: 'What is the max loss for option buyer?', options: ['Unlimited', 'Premium', 'Strike price', 'Market price'], correctAnswer: 1, category: 'Risk Management', difficulty: 'Easy' },
];

for (let i = 4; i < 20; i++) {
  quizzes.push({
    title: `Quiz ${i+1}`,
    question: `Sample question ${i+1} about trading?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: Math.floor(Math.random() * 4),
    category: ['Options Trading', 'Technical Analysis', 'Risk Management', 'Trading Psychology'][i % 4],
    difficulty: ['Easy', 'Medium', 'Hard'][i % 3],
  });
}

const achievements = [
  { name: 'Beginner Trader', description: 'Complete your first topic', icon: '📚', pointsRequired: 10 },
  { name: 'Options Explorer', description: 'Complete all Options Basics topics', icon: '🎯', pointsRequired: 100 },
  { name: 'Risk Manager', description: 'Complete Risk Management category', icon: '🛡️', pointsRequired: 150 },
  { name: 'Quiz Champion', description: 'Score 100% on 10 quizzes', icon: '🏆', pointsRequired: 200 },
  { name: 'Trading Expert', description: 'Complete 5 categories', icon: '💎', pointsRequired: 300 },
  { name: 'Bull Boom Pro', description: 'Complete all categories', icon: '🚀', pointsRequired: 500 },
  { name: 'Chart Reader', description: 'Complete Charts & Candles', icon: '📊', pointsRequired: 80 },
  { name: 'Swing Trader', description: 'Complete Swing Trading category', icon: '⚡', pointsRequired: 120 },
  { name: 'Day Trader', description: 'Complete Intraday Trading', icon: '🕒', pointsRequired: 180 },
  { name: 'Crypto Trader', description: 'Complete Crypto Trading', icon: '₿', pointsRequired: 140 },
];

const courses = [
  {
    title: 'Options Trading Basics',
    description: 'Start your options journey.',
    category: 'Options Trading',
    instructor: 'Rahul Sharma',
    duration: '8 Hours',
    difficulty: 'Beginner',
    price: 'Free',
    rating: 4.9,
    students: 15000,
    lessons: [],
  },
  {
    title: 'Technical Analysis Mastery',
    description: 'Become a chart expert.',
    category: 'Technical Analysis',
    instructor: 'Priya Patel',
    duration: '16 Hours',
    difficulty: 'Intermediate',
    price: '₹1,999',
    rating: 4.8,
    students: 28000,
    lessons: [],
  },
  {
    title: 'Risk Management Fundamentals',
    description: 'Protect your capital.',
    category: 'Risk Management',
    instructor: 'Sneha Singh',
    duration: '6 Hours',
    difficulty: 'Beginner',
    price: 'Free',
    rating: 4.9,
    students: 22000,
    lessons: [],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bullboom');
    console.log('Connected to MongoDB');

    await CourseCategory.deleteMany({});
    await Topic.deleteMany({});
    await Course.deleteMany({});
    await Quiz.deleteMany({});
    await Achievement.deleteMany({});

    const insertedCategories = await CourseCategory.insertMany(categories);
    console.log('Categories inserted:', insertedCategories.length);

    const topicsToInsert = [];
    for (const cat of insertedCategories) {
      const catTopics = createTopics(cat.name);
      for (const topic of catTopics) {
        topicsToInsert.push({ ...topic, category: cat._id, order: topicsToInsert.length });
      }
    }
    const insertedTopics = await Topic.insertMany(topicsToInsert);
    console.log('Topics inserted:', insertedTopics.length);

    await Course.insertMany(courses);
    await Quiz.insertMany(quizzes);
    await Achievement.insertMany(achievements);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
