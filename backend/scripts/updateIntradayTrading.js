import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';

dotenv.config();

const updateIntradayTrading = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create "Intraday Trading" category
    let category = await CourseCategory.findOne({ name: 'Intraday Trading' });
    if (!category) {
      category = await CourseCategory.create({
        name: 'Intraday Trading',
        description: 'Master the art of day trading with real-time market analysis.',
        icon: '🕒',
        difficulty: 'Advanced',
        estimatedHours: 5,
        order: 9
      });
      console.log('Created "Intraday Trading" category');
    } else {
      console.log('Found existing "Intraday Trading" category');
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
        title: 'Scalping',
        description: 'Learn high-speed scalping strategies for intraday trading.',
        category: category._id,
        icon: '⚡',
        content: `
<h2>Scalping</h2>
<ul>
  <li><strong>Definition:</strong> A high-speed day trading strategy aimed at capturing small, consistent profits from numerous trades throughout the day.</li>
  <li><strong>Timeframe:</strong> Trades are executed in rapid succession, with positions held for mere seconds to a few minutes, and never overnight.</li>
  <li><strong>Objective:</strong> Scalpers focus on exploiting the bid-ask spread and minor price fluctuations rather than waiting for large market shifts.</li>
  <li><strong>Requirements:</strong> This style demands intense focus, rapid reflexes, and absolute discipline to cut losses instantly if a trade turns against them.</li>
  <li><strong>Tools:</strong> Traders typically rely on 1-minute or tick charts, Level 2 market data, and order flow analysis to spot immediate opportunities.</li>
</ul>
        `,
        keyTakeaways: [
          'High-speed trading strategy',
          'Hold positions for seconds/minutes',
          'Exploit bid-ask spread',
          'Requires intense focus'
        ],
        examples: [{
          title: 'Scalping Example',
          description: 'Use 1-minute charts and Level 2 data to enter and exit trades quickly for small profits.'
        }],
        estimatedTime: '10 min',
        order: 1
      },
      {
        title: 'Momentum Trading',
        description: 'Learn how to trade stocks with strong momentum.',
        category: category._id,
        icon: '📈',
        content: `
<h2>Momentum Trading</h2>
<ul>
  <li><strong>Definition:</strong> A strategy based on finding stocks moving significantly in one direction on high volume and jumping on board to ride the wave.</li>
  <li><strong>Philosophy:</strong> It operates on the principle that "the trend is your friend," assuming that strong price movements will continue to push in the same direction for a while.</li>
  <li><strong>Catalysts:</strong> Momentum is usually sparked by external factors like earnings reports, breaking news, upgrades/downgrades, or broader market hype.</li>
  <li><strong>Indicators:</strong> Traders use technical indicators like the Relative Strength Index (RSI) or Moving Average Convergence Divergence (MACD) to measure the momentum's strength.</li>
  <li><strong>Risk Management:</strong> Because momentum can shift suddenly, entering near a peak is a major risk, making tight trailing stop-loss orders essential.</li>
</ul>
        `,
        keyTakeaways: [
          'Trade stocks with strong price moves',
          'Trend is your friend',
          'Use RSI/MACD indicators',
          'Use trailing stop-losses'
        ],
        examples: [{
          title: 'Momentum Trading Example',
          description: 'Enter a trade when a stock has a strong price move on high volume, confirming momentum.'
        }],
        estimatedTime: '10 min',
        order: 2
      },
      {
        title: 'VWAP (Volume Weighted Average Price)',
        description: 'Learn how to use VWAP for intraday trading.',
        category: category._id,
        icon: '📊',
        content: `
<h2>VWAP (Volume Weighted Average Price)</h2>
<ul>
  <li><strong>Definition:</strong> An intraday trading indicator that shows the average price a security has traded at throughout the day, factoring in both volume and price.</li>
  <li><strong>Visual Setup:</strong> It appears as a single dynamic line overlaid on a stock's intraday price chart.</li>
  <li><strong>Trend Identification:</strong> Generally, if the stock's current price is trading above the VWAP line, the intraday sentiment is considered bullish; if it's below, it's considered bearish.</li>
  <li><strong>Institutional Use:</strong> Large institutional buyers use VWAP to ensure they are getting a "fair" average price for the day without disrupting the market with massive orders.</li>
  <li><strong>Reset Cycle:</strong> VWAP is strictly a day-trading tool; its calculation resets entirely at the opening bell of each new trading session.</li>
</ul>
        `,
        keyTakeaways: [
          'Volume-weighted average price',
          'Price above = bullish, below = bearish',
          'Used by institutions',
          'Resets daily'
        ],
        examples: [{
          title: 'VWAP Example',
          description: 'Look for price to stay above VWAP for bullish intraday sentiment.'
        }],
        estimatedTime: '10 min',
        order: 3
      },
      {
        title: 'ORB Strategy (Opening Range Breakout)',
        description: 'Learn the Opening Range Breakout strategy.',
        category: category._id,
        icon: '🚀',
        content: `
<h2>ORB Strategy (Opening Range Breakout)</h2>
<ul>
  <li><strong>Definition:</strong> A strategy designed to capitalize on the surge of volatility and volume that typically occurs shortly after the stock market opens.</li>
  <li><strong>Establishing the Range:</strong> Traders observe the high and low prices created during the first 15 to 30 minutes of the trading day to define the "opening range."</li>
  <li><strong>The Trigger:</strong> A trade is executed when the price forcefully breaks out above the established high (triggering a buy) or drops below the low (triggering a short sell).</li>
  <li><strong>Volume Confirmation:</strong> For an ORB to be reliable, the breakout move must be accompanied by a noticeable spike in trading volume.</li>
  <li><strong>Managing Fakeouts:</strong> False breakouts are common; therefore, traders often place their stop-loss orders just inside the established opening range to minimize risk.</li>
</ul>
        `,
        keyTakeaways: [
          'Capitalize on opening volatility',
          'Define range first 15-30 mins',
          'Trade breakouts with volume',
          'Place stop-loss inside range'
        ],
        examples: [{
          title: 'ORB Example',
          description: 'Buy when price breaks above the first 15-minute high with volume confirmation.'
        }],
        estimatedTime: '10 min',
        order: 4
      },
      {
        title: 'Volume Analysis',
        description: 'Learn how to analyze volume for intraday trading.',
        category: category._id,
        icon: '📊',
        content: `
<h2>Volume Analysis</h2>
<ul>
  <li><strong>Definition:</strong> The practice of studying the number of shares or contracts traded during a specific period to gauge the actual strength behind a price movement.</li>
  <li><strong>Core Principle:</strong> "Volume precedes price." High volume validates a price trend, whereas low volume suggests a lack of market conviction in the move.</li>
  <li><strong>Validating Breakouts:</strong> If a stock breaks through a key resistance level on heavy volume, the breakout is considered highly legitimate and likely to continue.</li>
  <li><strong>Spotting Reversals:</strong> Unusually massive "climax" volume spikes after an extended uptrend or downtrend can indicate that buyers or sellers are exhausted, signaling a potential reversal.</li>
  <li><strong>Context is Key:</strong> Volume analysis is rarely effective on its own; it must always be cross-referenced with price action and other technical patterns to form a complete picture.</li>
</ul>
        `,
        keyTakeaways: [
          'Volume precedes price',
          'High volume validates trends',
          'Climax volume signals reversals',
          'Combine with price action'
        ],
        examples: [{
          title: 'Volume Analysis Example',
          description: 'Confirm a breakout with high volume to validate the price move.'
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
        title: 'Intraday Trading Q1',
        question: 'What is the primary goal of a scalping strategy?',
        options: ['Holding positions for several days to catch big trends.', 'Making numerous trades throughout the day for small profits.', 'Investing in companies for long-term growth.', 'Hedging against market volatility.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Scalping aims for numerous small profits throughout the day.'
      },
      {
        title: 'Intraday Trading Q2',
        question: 'Scalpers typically use which timeframe for faster entries and exits?',
        options: ['1-hour or 4-hour charts.', '15-minute or 30-minute charts.', '5-minute or 1-minute charts.', 'Weekly charts.'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Scalpers use 5-minute or 1-minute charts for fast entries/exits.'
      },
      {
        title: 'Intraday Trading Q3',
        question: 'In momentum trading, what is a trader looking for?',
        options: ['Stocks that are stationary and not moving.', 'Stocks with strong price movements in one direction.', 'Stocks that have hit their 52-week lows.', 'Dividend-paying stocks only.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Momentum traders look for stocks with strong price movements.'
      },
      {
        title: 'Intraday Trading Q4',
        question: 'What does the VWAP indicator represent?',
        options: ['The simple average price of a stock over a day.', 'The average price of a security weighted by volume.', 'The highest price a stock reached during the opening range.', 'The closing price of the previous trading session.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'VWAP is the average price weighted by volume.'
      },
      {
        title: 'Intraday Trading Q5',
        question: 'How is a rising VWAP generally interpreted by traders?',
        options: ['More sellers than buyers (bearish).', 'A sideways market with no trend.', 'More buyers than sellers (bullish).', 'A signal to immediately exit all positions.'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Rising VWAP means more buyers than sellers (bullish).'
      },
      {
        title: 'Intraday Trading Q6',
        question: 'VWAP is most commonly used for which type of trading?',
        options: ['Long-term retirement investing.', 'Swing trading over several weeks.', 'Intraday trading.', 'Fundamental analysis of balance sheets.'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'VWAP is used for intraday trading.'
      },
      {
        title: 'Intraday Trading Q7',
        question: 'What does the "ORB" strategy stand for?',
        options: ['Overall Return Benchmark.', 'Opening Range Breakout.', 'Order Run Balance.', 'Option Rate Bullishness.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'ORB stands for Opening Range Breakout.'
      },
      {
        title: 'Intraday Trading Q8',
        question: 'In an ORB strategy, a trade is typically triggered when:',
        options: ['The price breaks above or below the high/low of the first few minutes of trading.', 'The market closes for the day.', 'A stock hits a new all-time high.', 'The CEO of a company resigns.'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'ORB trades are triggered when price breaks the opening range high/low.'
      },
      {
        title: 'Intraday Trading Q9',
        question: 'When analyzing volume during a trend, what do traders prefer to see?',
        options: ['Volume decreasing as the price moves in the trade\'s direction.', 'Volume remaining completely flat and unchanged.', 'Volume expanding in the direction of the trade.', 'Volume only increasing during lunch hours.'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Traders prefer volume expanding in the trade direction.'
      },
      {
        title: 'Intraday Trading Q10',
        question: 'Why is volume analysis important for confirming a breakout?',
        options: ['It guarantees the trade will be 100% profitable.', 'It suggests there is significant institutional interest or strength behind the move.', 'It helps determine the company\'s next earnings date.', 'It is required by law for all trades.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Volume confirms institutional interest behind the move.'
      }
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log('Successfully updated "Intraday Trading" content!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating "Intraday Trading":', error);
    process.exit(1);
  }
};

updateIntradayTrading();
