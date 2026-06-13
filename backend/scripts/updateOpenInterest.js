import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';

dotenv.config();

const updateOpenInterest = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create "Open Interest" category
    let category = await CourseCategory.findOne({ name: 'Open Interest' });
    if (!category) {
      category = await CourseCategory.create({
        name: 'Open Interest',
        description: 'Learn how open interest reveals capital flow and trend strength.',
        icon: '📈',
        difficulty: 'Medium',
        estimatedHours: 5,
        order: 4
      });
      console.log('Created "Open Interest" category');
    } else {
      console.log('Found existing "Open Interest" category');
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
        title: 'OI Basics',
        description: 'Learn the fundamentals of open interest and how it works.',
        category: category._id,
        icon: '📊',
        content: `
<h2>OI Basics</h2>
<ul>
  <li>Represents the total number of active, unsettled derivative contracts (like futures and options) currently in the market.</li>
  <li>Increases strictly when a brand-new contract is established between a new buyer and a new seller.</li>
  <li>Acts as a barometer for capital flow, clearly showing if money is entering or exiting a specific asset.</li>
  <li>Expanding OI indicates growing market participation, while shrinking OI suggests traders are closing positions.</li>
  <li>Serves as a necessary metric for validating the strength and conviction behind any ongoing market trend.</li>
</ul>
        `,
        keyTakeaways: [
          'Open Interest = number of active, unsettled contracts',
          'New contract (new buyer + new seller) → OI increases',
          'OI shows capital flow and trend strength'
        ],
        examples: [{
          title: 'OI Example',
          description: 'If 10 new contracts are created between new buyers and sellers, OI increases by 10.'
        }],
        estimatedTime: '10 min',
        order: 1
      },
      {
        title: 'Long Build Up',
        description: 'Learn to identify long build up and what it signals.',
        category: category._id,
        icon: '📈',
        content: `
<h2>Long Build Up</h2>
<ul>
  <li>Identified when both the price of an underlying asset and its open interest rise concurrently.</li>
  <li>Signals that new buyers are actively entering the market with fresh capital to establish bullish positions.</li>
  <li>Validates upward momentum, indicating that buyers are confidently in control of the market direction.</li>
  <li>Serves as a strong confirmation for traders that an uptrend is fundamentally strong and likely to continue.</li>
  <li>Represents a classic accumulation phase where the overall market sentiment is decisively positive.</li>
</ul>
        `,
        keyTakeaways: [
          'Long Build Up = Price + OI both up',
          'New buyers entering = fresh bullish capital',
          'Confirms strong uptrend'
        ],
        examples: [{
          title: 'Long Build Up Example',
          description: 'Stock up 5% and OI up 15% → strong long build up signal.'
        }],
        estimatedTime: '10 min',
        order: 2
      },
      {
        title: 'Short Build Up',
        description: 'Learn to identify short build up and what it signals.',
        category: category._id,
        icon: '📉',
        content: `
<h2>Short Build Up</h2>
<ul>
  <li>Occurs when the price of an asset steadily declines while the open interest simultaneously increases.</li>
  <li>Demonstrates aggressive entry by new sellers who are initiating fresh short positions to bet on further price drops.</li>
  <li>Confirms strong bearish momentum driven by high conviction and the addition of new capital backing the decline.</li>
  <li>Interpreted as a robust downtrend, signaling to traders that it is generally risky to attempt "buying the dip."</li>
  <li>Illustrates a market environment heavily dominated by bears who are dictating the current price action.</li>
</ul>
        `,
        keyTakeaways: [
          'Short Build Up = Price down + OI up',
          'New sellers entering = fresh bearish capital',
          'Confirms strong downtrend'
        ],
        examples: [{
          title: 'Short Build Up Example',
          description: 'Stock down 4% and OI up 12% → strong short build up signal.'
        }],
        estimatedTime: '10 min',
        order: 3
      },
      {
        title: 'Long Unwinding',
        description: 'Learn to identify long unwinding and what it signals.',
        category: category._id,
        icon: '📉',
        content: `
<h2>Long Unwinding</h2>
<ul>
  <li>Characterized by a declining asset price paired with a steadily decreasing open interest.</li>
  <li>Happens when existing buyers (longs) sell off their positions to lock in profits or mitigate their losses.</li>
  <li>Lacks long-term bearish conviction since the price drop is fueled by traders exiting rather than new short sellers entering.</li>
  <li>Represents a natural, healthy correction or temporary pause rather than a total structural trend reversal.</li>
  <li>Signals a period of market exhaustion where previous bullish momentum is temporarily cooling off.</li>
</ul>
        `,
        keyTakeaways: [
          'Long Unwinding = Price down + OI down',
          'Longs exiting = no new bearish capital',
          'Temporary correction, not reversal'
        ],
        examples: [{
          title: 'Long Unwinding Example',
          description: 'Stock down 3% and OI down 8% → long unwinding, likely a correction.'
        }],
        estimatedTime: '10 min',
        order: 4
      },
      {
        title: 'Short Covering',
        description: 'Learn to identify short covering and what it signals.',
        category: category._id,
        icon: '📈',
        content: `
<h2>Short Covering</h2>
<ul>
  <li>Manifests when an asset's price begins to rise while the overall open interest simultaneously decreases.</li>
  <li>Driven by traders who previously bet against the market (shorts) scrambling to buy back the asset to close out losing positions.</li>
  <li>Considered a weak or artificial bounce because it relies on panic liquidation rather than fresh, confident bullish capital.</li>
  <li>Creates sharp, rapid rallies often called "short squeezes" that frequently struggle to sustain themselves once trapped shorts exit.</li>
  <li>Reminds traders that not all upward price movements are supported by genuine, lasting buyer confidence.</li>
</ul>
        `,
        keyTakeaways: [
          'Short Covering = Price up + OI down',
          'Shorts exiting = panic buying, no fresh bullish capital',
          'Weak bounce, often temporary'
        ],
        examples: [{
          title: 'Short Covering Example',
          description: 'Stock up 6% and OI down 10% → short covering, potential short squeeze.'
        }],
        estimatedTime: '10 min',
        order: 5
      }
    ];

    // Insert new topics
    const createdTopics = await Topic.insertMany(topicsData);
    console.log(`Created ${createdTopics.length} topics`);

    // Define quiz questions
    const quizData = [
      {
        title: 'Open Interest Q1',
        question: 'What does "Open Interest" represent in the market?',
        options: ['The total number of shares traded in a day.', 'The total number of outstanding derivative contracts that have not been settled.', 'The total profit made by traders in a session.', 'The number of buy orders currently sitting in the order book.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Open Interest is the count of active, unsettled derivative contracts.'
      },
      {
        title: 'Open Interest Q2',
        question: 'In a "Long Build Up" scenario, what typically happens to Price and Open Interest?',
        options: ['Price increases; OI decreases.', 'Price decreases; OI increases.', 'Price increases; OI increases.', 'Price decreases; OI decreases.'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Long Build Up = Price and Open Interest both increasing.'
      },
      {
        title: 'Open Interest Q3',
        question: 'If the Price is falling while Open Interest is rising, this indicates:',
        options: ['Long Build Up', 'Short Build Up', 'Short Covering', 'Long Unwinding'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Short Build Up = Price down + OI up.'
      },
      {
        title: 'Open Interest Q4',
        question: '"Short Covering" is generally characterized by:',
        options: ['Price rising and OI falling.', 'Price falling and OI rising.', 'Price falling and OI falling.', 'Price rising and OI rising.'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Short Covering = Price up + OI down.'
      },
      {
        title: 'Open Interest Q5',
        question: 'When traders close out their profitable long positions, resulting in a drop in both Price and OI, it is called:',
        options: ['Short Build Up', 'Long Unwinding', 'Short Covering', 'Bullish Reversal'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Long Unwinding = Price down + OI down.'
      },
      {
        title: 'Open Interest Q6',
        question: 'True or False: Open Interest and Volume are the same thing.',
        options: ['True', 'False'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Volume counts trades per day; Open Interest counts active contracts.'
      },
      {
        title: 'Open Interest Q7',
        question: 'What happens to Open Interest when a new buyer and a new seller enter into a new contract?',
        options: ['It stays the same.', 'It decreases by one.', 'It increases by one.', 'It doubles.'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'New buyer + new seller = new contract = OI increases by 1.'
      },
      {
        title: 'Open Interest Q8',
        question: 'Which of the following is considered a Bearish signal?',
        options: ['Long Build Up', 'Short Covering', 'Short Build Up', 'Price neutral with rising OI'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Short Build Up is a bearish signal.'
      },
      {
        title: 'Open Interest Q9',
        question: 'If both Price and OI are decreasing, the market is likely experiencing:',
        options: ['Liquidation of long positions (Long Unwinding).', 'Aggressive new selling.', 'A strong bullish trend.', 'High market volatility.'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'Price down + OI down = Long Unwinding (liquidation of longs).'
      },
      {
        title: 'Open Interest Q10',
        question: 'Open Interest is most commonly used to analyze which type of financial instruments?',
        options: ['Cash Stocks', 'Futures and Options', 'Real Estate', 'Fixed Deposits'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Open Interest applies to derivatives like Futures and Options.'
      }
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log('Successfully updated "Open Interest" content!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating "Open Interest":', error);
    process.exit(1);
  }
};

updateOpenInterest();
