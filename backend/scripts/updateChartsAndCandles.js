import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';

dotenv.config();

const updateChartsAndCandles = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create "Charts & Candles" category
    let category = await CourseCategory.findOne({ name: 'Charts & Candles' });
    if (!category) {
      category = await CourseCategory.create({
        name: 'Charts & Candles',
        description: 'Learn to read and interpret candlestick charts and patterns.',
        icon: '📊',
        difficulty: 'Beginner',
        estimatedHours: 6,
        order: 2
      });
      console.log('Created "Charts & Candles" category');
    } else {
      console.log('Found existing "Charts & Candles" category');
    }

    // Delete existing topics for this category
    const deletedTopics = await Topic.deleteMany({ category: category._id });
    console.log(`Deleted ${deletedTopics.deletedCount} existing topics`);

    // Delete existing quiz questions for this category
    const deletedQuizzes = await Quiz.deleteMany({ category: category.name });
    console.log(`Deleted ${deletedQuizzes.deletedCount} existing quiz questions`);

    // Define new topics with the provided content
    const topicsData = [
      {
        title: 'Candlestick Basics',
        description: 'Learn the fundamental parts of a candlestick chart.',
        category: category._id,
        icon: '🕯️',
        content: `
<h2>Candlestick Basics</h2>
<ul>
  <li>Every single candlestick maps out four critical price points: the open, high, low, and close.</li>
  <li>The solid colored section is called the real body, which shows the distance between the open and close.</li>
  <li>The thin lines sticking out of the top and bottom are called wicks, representing price extremes.</li>
  <li>A green candle means the price closed higher than it opened, signaling a bullish session.</li>
  <li>A red candle means the price closed lower than it opened, signaling a bearish session.</li>
</ul>
        `,
        keyTakeaways: [
          'Understand the four critical price points: open, high, low, close',
          'Know the difference between real body and wicks',
          'Recognize green (bullish) and red (bearish) candles'
        ],
        examples: [{
          title: 'Candlestick Example',
          description: 'A green candle with a long lower wick means buyers fought back after a drop.'
        }],
        estimatedTime: '10 min',
        order: 1
      },
      {
        title: 'Doji',
        description: 'Learn about the indecisive Doji candlestick pattern.',
        category: category._id,
        icon: '✚',
        content: `
<h2>Doji</h2>
<ul>
  <li>A Doji forms when a financial asset opens and closes at virtually the identical price level.</li>
  <li>It looks like a cross or a plus sign because the real body is exceptionally thin.</li>
  <li>This specific structure tells you that buyers and sellers are trapped in total indecision.</li>
  <li>While it shows a pause, a Doji at the end of an extended trend warns of a potential reversal.</li>
  <li>Traders never buy a Doji immediately; they always wait for the next candle to confirm direction.</li>
</ul>
        `,
        keyTakeaways: [
          'Doji = equal (or nearly equal) open and close',
          'Signals market indecision',
          'Watch for confirmation after a Doji at trend extremes'
        ],
        examples: [{
          title: 'Doji Example',
          description: 'A Doji at the bottom of a big drop might mean buyers are coming in.'
        }],
        estimatedTime: '10 min',
        order: 2
      },
      {
        title: 'Hammer',
        description: 'Learn the bullish Hammer reversal pattern.',
        category: category._id,
        icon: '🔨',
        content: `
<h2>Hammer</h2>
<ul>
  <li>A Hammer is a single-candle bullish reversal pattern that only forms at the bottom of a downtrend.</li>
  <li>It features a small real body at the top and a very long lower wick extending downward.</li>
  <li>The lower wick must be at least two to three times larger than the size of the body.</li>
  <li>It proves that sellers aggressively pushed the price down, but buyers fought back to force a recovery.</li>
  <li>While the candle body can be red or green, a green Hammer provides a stronger buy signal.</li>
</ul>
        `,
        keyTakeaways: [
          'Forms at the bottom of a downtrend',
          'Long lower wick = 2-3x body size',
          'Green Hammer = stronger bullish signal'
        ],
        examples: [{
          title: 'Hammer Example',
          description: 'A green Hammer after a 10% drop = strong potential reversal.'
        }],
        estimatedTime: '10 min',
        order: 3
      },
      {
        title: 'Shooting Star',
        description: 'Learn the bearish Shooting Star reversal pattern.',
        category: category._id,
        icon: '🌟',
        content: `
<h2>Shooting Star</h2>
<ul>
  <li>A Shooting Star is a bearish reversal candle that appears strictly at the peak of an uptrend.</li>
  <li>It has a small real body at the bottom and a very long upper wick pointing upward.</li>
  <li>The long upper wick proves that buyers pushed prices high but failed miserably to sustain them.</li>
  <li>Sellers took complete control of the session by the closing bell, driving the price back down.</li>
  <li>It warns traders that the upward momentum is exhausted and a downward turn is likely coming.</li>
</ul>
        `,
        keyTakeaways: [
          'Forms at the peak of an uptrend',
          'Long upper wick = failed buyer attempt',
          'Signals potential downward reversal'
        ],
        examples: [{
          title: 'Shooting Star Example',
          description: 'A Shooting Star after a strong rally = take profits or consider shorting.'
        }],
        estimatedTime: '10 min',
        order: 4
      },
      {
        title: 'Engulfing Pattern',
        description: 'Learn the two-candle Engulfing reversal pattern.',
        category: category._id,
        icon: '🌀',
        content: `
<h2>Engulfing Pattern</h2>
<ul>
  <li>This is a highly reliable two-candle trend reversal pattern that shows an aggressive shift in power.</li>
  <li>A Bullish Engulfing pattern starts with a small red candle followed by a massive green candle.</li>
  <li>The body of the second candle must completely overlap or "swallow" the body of the first.</li>
  <li>A Bearish Engulfing pattern flips this, showing a small green candle swallowed by a huge red candle.</li>
  <li>It indicates that the previous trend has completely lost its momentum to the opposing side.</li>
</ul>
        `,
        keyTakeaways: [
          'Two-candle reversal pattern',
          'Second candle must completely engulf first',
          'Shows clear shift in market power'
        ],
        examples: [{
          title: 'Engulfing Example',
          description: 'A red candle swallowed by a huge green candle = strong bullish signal.'
        }],
        estimatedTime: '10 min',
        order: 5
      },
      {
        title: 'Morning Star',
        description: 'Learn the three-candle Morning Star bullish reversal pattern.',
        category: category._id,
        icon: '⭐',
        content: `
<h2>Morning Star</h2>
<ul>
  <li>The Morning Star is a powerful three-candle bullish reversal pattern found inside downtrends.</li>
  <li>The first candle is long and bearish, showing that sellers are firmly in control of the market.</li>
  <li>The second candle has a very tiny body, signaling that the downward momentum is stalling out.</li>
  <li>The third candle is long and bullish, closing deeply into the territory of the very first candle.</li>
  <li>This visual sequence confirms that the bears have lost control and an uptrend is beginning.</li>
</ul>
        `,
        keyTakeaways: [
          'Three-candle bullish reversal',
          'Small middle candle = trend stall',
          'Long third green candle = new uptrend'
        ],
        examples: [{
          title: 'Morning Star Example',
          description: 'Long red, small Doji, long green = classic Morning Star reversal.'
        }],
        estimatedTime: '10 min',
        order: 6
      }
    ];

    // Insert new topics
    const createdTopics = await Topic.insertMany(topicsData);
    console.log(`Created ${createdTopics.length} topics`);

    // Define quiz questions
    const quizData = [
      {
        title: 'Charts & Candles Q1',
        question: 'Which part of a candlestick represents the absolute highest price reached during a trading session?',
        options: ['The open price', 'The upper shadow (wick)', 'The real body', 'The lower shadow (wick)'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'The upper shadow (wick) shows the highest price reached during the session.'
      },
      {
        title: 'Charts & Candles Q2',
        question: 'If a candlestick has a very long real green body, what does it tell you about market momentum?',
        options: ['Sellers are completely dominating the session', 'Buyers are strongly dominating the session', 'The market is trapped in heavy indecision', 'Trading volume has hit zero'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'A long green body means buyers pushed the price up significantly from open to close.'
      },
      {
        title: 'Charts & Candles Q3',
        question: 'What defines a standard Doji candlestick pattern?',
        options: ['Its body is twice as large as its wicks', 'It has no wicks on either side', 'The opening and closing prices are virtually equal', 'It always points straight downward'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'A Doji has (nearly) identical open and close prices.'
      },
      {
        title: 'Charts & Candles Q4',
        question: 'A Doji forming in the middle of a choppy, sideways trading range provides a highly reliable trend reversal signal.',
        options: ['True', 'False'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'Dojis are most reliable at trend extremes, not in sideways ranges.'
      },
      {
        title: 'Charts & Candles Q5',
        question: 'Where must a valid Hammer candlestick pattern always appear to be a valid signal?',
        options: ['At the absolute peak of a strong uptrend', 'Right in the middle of a flat consolidation range', 'At the bottom of a defined downtrend', 'Only when a stock drops on a Sunday morning'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Hammers form at the bottom of downtrends and signal a bullish reversal.'
      },
      {
        title: 'Charts & Candles Q6',
        question: 'What is the strict structural rule regarding a Hammer\'s lower wick?',
        options: ['It must be shorter than the real body', 'It must be at least two to three times the length of the real body', 'It must be completely non-existent', 'It must match the length of the upper wick perfectly'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Hammer\'s lower wick must be at least 2-3x the size of its body.'
      },
      {
        title: 'Charts & Candles Q7',
        question: 'What does the long upper shadow of a Shooting Star reveal?',
        options: ['Buyers pushed prices high but failed to maintain them by the close', 'Sellers tried to push prices down but failed completely', 'Buyers successfully held the highest price until the closing bell', 'The market has run out of available shares to trade'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'The long upper wick means buyers failed to hold highs, sellers took over.'
      },
      {
        title: 'Charts & Candles Q8',
        question: 'If the very next candle breaks and closes above the high wick of a Shooting Star, the bearish reversal signal is strictly invalidated.',
        options: ['True', 'False'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Hard',
        explanation: 'A close above the Shooting Star\'s high wick invalidates the bearish signal.'
      },
      {
        title: 'Charts & Candles Q9',
        question: 'In a Bullish Engulfing pattern, what part of the first candle must the second green candle completely swallow?',
        options: ['Just the bottom lower wick', 'The entire real body of the first candle', 'The trading volume bar beneath the chart', 'The opening price only'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'The second candle\'s body must completely engulf the first candle\'s body.'
      },
      {
        title: 'Charts & Candles Q10',
        question: 'What type of market signal is a Morning Star pattern?',
        options: ['A bearish continuation signal', 'A bearish reversal signal', 'A bullish reversal signal', 'A sideways consolidation signal'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Morning Star is a bullish reversal pattern.'
      }
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log('Successfully updated "Charts & Candles" content!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating "Charts & Candles":', error);
    process.exit(1);
  }
};

updateChartsAndCandles();
