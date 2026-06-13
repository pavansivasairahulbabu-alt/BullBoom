import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';

dotenv.config();

const updateSwingTrading = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create "Swing Trading" category
    let category = await CourseCategory.findOne({ name: 'Swing Trading' });
    if (!category) {
      category = await CourseCategory.create({
        name: 'Swing Trading',
        description: 'Learn to capture medium-term trends with swing trading strategies.',
        icon: '📅',
        difficulty: 'Intermediate',
        estimatedHours: 5,
        order: 8
      });
      console.log('Created "Swing Trading" category');
    } else {
      console.log('Found existing "Swing Trading" category');
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
        title: 'Trend Analysis',
        description: 'Learn how to identify and analyze market trends.',
        category: category._id,
        icon: '📈',
        content: `
<h2>Trend Analysis</h2>
<ul>
  <li><strong>Definition:</strong> Trend analysis involves determining the overall direction of the market or a specific asset's price over a specific timeframe.</li>
  <li><strong>Uptrends vs. Downtrends:</strong> Traders look for a series of higher highs and higher lows to confirm an uptrend, or lower highs and lower lows for a downtrend.</li>
  <li><strong>Tools Used:</strong> Moving averages and trendlines are fundamental tools used on charts to visualize and confirm the direction of the trend.</li>
  <li><strong>The Golden Rule:</strong> "The trend is your friend." Trading in the same direction as the dominant trend generally offers a much higher probability of success.</li>
</ul>
        `,
        keyTakeaways: [
          'Determine market direction',
          'Identify higher highs/lows',
          'Use moving averages and trendlines',
          'Trade with the trend'
        ],
        examples: [{
          title: 'Trend Analysis Example',
          description: 'Identify an uptrend by looking for consecutive higher highs and higher lows on the chart.'
        }],
        estimatedTime: '10 min',
        order: 1
      },
      {
        title: 'Swing Entry',
        description: 'Learn how to time your swing trade entries effectively.',
        category: category._id,
        icon: '🎯',
        content: `
<h2>Swing Entry</h2>
<ul>
  <li><strong>Timing the Market:</strong> This is the precise moment a trader decides to open a position, aiming to catch an upcoming "swing" or momentum shift in price.</li>
  <li><strong>Confirmation Signals:</strong> Successful entries rarely rely on guessing; they require confirmation from technical indicators (like RSI or MACD) or specific candlestick patterns.</li>
  <li><strong>Risk Assessment:</strong> Before entering, a trader calculates the risk-to-reward ratio to ensure the potential profit justifies the potential loss.</li>
  <li><strong>Protection:</strong> Setting a stop-loss order at the exact time of entry is vital to protect your capital if the market moves against your prediction.</li>
</ul>
        `,
        keyTakeaways: [
          'Time entries for momentum shifts',
          'Use confirmation signals',
          'Calculate risk-to-reward',
          'Always set stop-loss'
        ],
        examples: [{
          title: 'Swing Entry Example',
          description: 'Wait for RSI confirmation and a bullish candlestick pattern before entering a long position.'
        }],
        estimatedTime: '10 min',
        order: 2
      },
      {
        title: 'Swing Exit',
        description: 'Learn how to secure profits and cut losses effectively.',
        category: category._id,
        icon: '🛡️',
        content: `
<h2>Swing Exit</h2>
<ul>
  <li><strong>Securing Gains:</strong> The exit strategy dictates exactly when to close a trade to secure your profits or cut your losses before they grow.</li>
  <li><strong>Setting Targets:</strong> Profit targets are often pre-determined and placed near previous levels of resistance (when buying) or support (when selling short).</li>
  <li><strong>Trailing Stops:</strong> Traders often use a "trailing stop-loss," which moves up as the price rises, locking in profits while still giving the trade room to grow.</li>
  <li><strong>Avoiding Emotion:</strong> Emotionless execution of your pre-planned exit strategy is critical to avoid the common traps of holding onto losing trades out of hope, or selling winners out of fear.</li>
</ul>
        `,
        keyTakeaways: [
          'Secure gains with exit strategy',
          'Set profit targets',
          'Use trailing stops',
          'Avoid emotional decisions'
        ],
        examples: [{
          title: 'Swing Exit Example',
          description: 'Use a trailing stop-loss to lock in profits as the price moves in your favor.'
        }],
        estimatedTime: '10 min',
        order: 3
      },
      {
        title: 'Breakout Trading',
        description: 'Learn how to trade breakouts from support and resistance levels.',
        category: category._id,
        icon: '⚡',
        content: `
<h2>Breakout Trading</h2>
<ul>
  <li><strong>The Concept:</strong> Breakout trading involves entering a trade when the price moves forcefully outside a defined area of support or resistance.</li>
  <li><strong>Momentum:</strong> The underlying theory is that once a major price barrier is broken, the price will continue to surge strongly in that new direction.</li>
  <li><strong>Importance of Volume:</strong> High trading volume during the breakout is a necessary confirmation signal; low volume often leads to a "fakeout" (a false breakout where the price retreats).</li>
  <li><strong>Risk Management:</strong> Stop-loss orders are typically placed just inside the previous boundary level to immediately cut losses if the breakout fails.</li>
</ul>
        `,
        keyTakeaways: [
          'Enter on breakouts',
          'Look for momentum',
          'Confirm with volume',
          'Place stop-loss inside boundary'
        ],
        examples: [{
          title: 'Breakout Trading Example',
          description: 'Enter a trade when price breaks resistance with high volume to confirm the breakout.'
        }],
        estimatedTime: '10 min',
        order: 4
      },
      {
        title: 'Pullback Trading',
        description: 'Learn how to buy the dip and enter during pullbacks.',
        category: category._id,
        icon: '📉',
        content: `
<h2>Pullback Trading</h2>
<ul>
  <li><strong>Buying the Dip:</strong> This strategy involves entering a trade during a temporary reversal (a "dip" or "pullback") within a strong, ongoing larger trend.</li>
  <li><strong>Discounted Prices:</strong> The goal is to join a prevailing trend at a better, lower price rather than chasing the market when it is already overextended.</li>
  <li><strong>Finding Support:</strong> Traders use tools like Fibonacci retracement levels or key moving averages to identify zones where the pullback is likely to stop and reverse back into the main trend.</li>
  <li><strong>Waiting for the Bounce:</strong> It is crucial to wait for price action confirmation—showing that the pullback has ended and the main trend is resuming—before jumping into the trade.</li>
</ul>
        `,
        keyTakeaways: [
          'Buy the dip in trends',
          'Get discounted prices',
          'Identify support zones',
          'Wait for bounce confirmation'
        ],
        examples: [{
          title: 'Pullback Trading Example',
          description: 'Wait for a pullback to the 50-day moving average and confirmation of a bounce before entering.'
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
        title: 'Swing Trading Q1',
        question: 'What does a "Bull Market" signify?',
        options: ['Stock prices are falling', 'Stock prices are rising', 'Market is closed', 'No change in prices'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'A bull market means stock prices are rising.'
      },
      {
        title: 'Swing Trading Q2',
        question: 'In trading terminology, what is a "Long Position"?',
        options: ['Selling an asset you don\'t own', 'Closing all open trades', 'Buying an asset with the expectation that its price will rise', 'Holding a trade for more than a year'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'A long position is buying an asset expecting the price to rise.'
      },
      {
        title: 'Swing Trading Q3',
        question: 'What does "Market Capitalization" mean?',
        options: ['The total monthly income of a company', 'The total value of all outstanding shares of a company', 'The total amount of loans a company has', 'The number of employees in a company'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Market capitalization is the total value of all outstanding shares.'
      },
      {
        title: 'Swing Trading Q4',
        question: 'When a stock is described as "Volatile," it means:',
        options: ['It offers fixed, guaranteed returns', 'Its price changes unpredictably and frequently', 'It is a very safe, low-risk investment', 'Its price never moves'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Volatile means the price changes unpredictably and frequently.'
      },
      {
        title: 'Swing Trading Q5',
        question: 'What is the "Spread" in trading?',
        options: ['The difference between the highest buyer\'s price (Bid) and the lowest seller\'s price (Ask)', 'The total number of shares traded in a day', 'The profit made after closing a trade', 'The fee paid to the broker for every trade'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Spread is the difference between Bid and Ask prices.'
      },
      {
        title: 'Swing Trading Q6',
        question: 'Which order type is executed immediately at the best available current price?',
        options: ['Limit Order', 'Stop-Loss Order', 'Market Order', 'Post-Only Order'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Market orders execute immediately at the best available price.'
      },
      {
        title: 'Swing Trading Q7',
        question: 'According to common risk management rules (like the 7% rule), what should a trader do if a stock drops significantly below the purchase price?',
        options: ['Buy more to lower the average cost', 'Exit the position to limit further losses', 'Wait indefinitely for the price to recover', 'Ignore the drop if the company is well-known'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Exit the position to limit further losses.'
      },
      {
        title: 'Swing Trading Q8',
        question: 'What is "Short Selling"?',
        options: ['Selling shares you already own', 'Buying shares for a very short period', 'A strategy to profit when an asset\'s price drops', 'Trading only in small quantities'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Short selling profits when an asset\'s price drops.'
      },
      {
        title: 'Swing Trading Q9',
        question: 'In technical analysis, what does a "Breakout" refer to?',
        options: ['When a price moves through an identified level of support or resistance', 'When the market closes for the weekend', 'When a trader loses all their capital', 'When a company goes bankrupt'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Breakout is when price moves through support/resistance.'
      },
      {
        title: 'Swing Trading Q10',
        question: 'What is the purpose of a "Stop-Loss" order?',
        options: ['To automatically take profits at a specific price', 'To limit the potential loss on a trade by exiting at a pre-set price', 'To increase the leverage of a trading account', 'To hide your trades from other market participants'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Stop-loss limits potential loss by exiting at a pre-set price.'
      }
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log('Successfully updated "Swing Trading" content!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating "Swing Trading":', error);
    process.exit(1);
  }
};

updateSwingTrading();
