import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';

dotenv.config();

const updateTradingStrategies = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create "Trading Strategies" category
    let category = await CourseCategory.findOne({ name: 'Trading Strategies' });
    if (!category) {
      category = await CourseCategory.create({
        name: 'Trading Strategies',
        description: 'Learn popular options trading strategies for different market conditions.',
        icon: '🎯',
        difficulty: 'Medium',
        estimatedHours: 6,
        order: 5
      });
      console.log('Created "Trading Strategies" category');
    } else {
      console.log('Found existing "Trading Strategies" category');
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
        title: 'Straddle',
        description: 'Learn the straddle strategy for high volatility scenarios.',
        category: category._id,
        icon: '📊',
        content: `
<h2>Straddle</h2>
<ul>
  <li>Involves simultaneously buying both a call and a put option for the same underlying asset.</li>
  <li>Requires both options contracts to share the exact same strike price and expiration date.</li>
  <li>Highly effective when you anticipate massive price volatility but are unsure of the market's specific direction.</li>
  <li>Carries a relatively high upfront premium cost compared to other strategies because you are purchasing two separate contracts.</li>
</ul>
        `,
        keyTakeaways: [
          'Buy call + put, same strike/expiration',
          'For high volatility, uncertain direction',
          'Higher upfront cost'
        ],
        examples: [{
          title: 'Straddle Example',
          description: 'Buy $100 call and $100 put expiring in 30 days for a stock you expect big moves in.'
        }],
        estimatedTime: '10 min',
        order: 1
      },
      {
        title: 'Strangle',
        description: 'Learn the strangle strategy as a lower-cost alternative to straddle.',
        category: category._id,
        icon: '📈',
        content: `
<h2>Strangle</h2>
<ul>
  <li>Involves buying a call and a put option, but at different strike prices that are typically out-of-the-money.</li>
  <li>Serves as a significantly lower-cost alternative to a straddle for capitalizing on high market volatility.</li>
  <li>Requires the underlying asset to experience a much larger price swing than a straddle for the trade to become profitable.</li>
  <li>Ideal for traders who expect major price movements but want to keep their initial capital outlay to a minimum.</li>
</ul>
        `,
        keyTakeaways: [
          'Buy OTM call + OTM put, different strikes',
          'Lower cost than straddle',
          'Needs bigger price move to profit'
        ],
        examples: [{
          title: 'Strangle Example',
          description: 'Buy $105 call and $95 put for a $100 stock to bet on big moves with lower cost.'
        }],
        estimatedTime: '10 min',
        order: 2
      },
      {
        title: 'Iron Condor',
        description: 'Learn the iron condor market-neutral strategy for low volatility.',
        category: category._id,
        icon: '🦅',
        content: `
<h2>Iron Condor</h2>
<ul>
  <li>An advanced, market-neutral strategy designed to generate consistent profit during periods of very low volatility.</li>
  <li>Constructed by simultaneously holding a bull put spread and a bear call spread, involving four different strike prices.</li>
  <li>Achieves maximum profit if the asset's price closes somewhere between the middle strike prices at expiration.</li>
  <li>Strictly caps overall risk from the very beginning, making it a favorite for generating income in flat or sideways markets.</li>
</ul>
        `,
        keyTakeaways: [
          'Market-neutral, low volatility strategy',
          'Combine bull put spread + bear call spread',
          'Capped risk, profit from range-bound price'
        ],
        examples: [{
          title: 'Iron Condor Example',
          description: 'For $100 stock, sell $90 put, buy $85 put, sell $110 call, buy $115 call.'
        }],
        estimatedTime: '10 min',
        order: 3
      },
      {
        title: 'Bull Call Spread',
        description: 'Learn the bull call spread for moderate bullish outlooks.',
        category: category._id,
        icon: '📈',
        content: `
<h2>Bull Call Spread</h2>
<ul>
  <li>A strategic approach used when a trader has a moderately bullish outlook on a specific underlying asset.</li>
  <li>Involves buying a call option at a lower strike price while simultaneously selling a call option at a higher strike price.</li>
  <li>The premium collected from selling the higher strike call helps offset and reduce the cost of buying the lower strike call.</li>
  <li>Effectively lowers overall risk and upfront cost, but strictly caps maximum potential profit if the stock surges significantly.</li>
</ul>
        `,
        keyTakeaways: [
          'Buy lower strike call, sell higher strike call',
          'Moderate bullish outlook',
          'Lower cost/risk, capped profit'
        ],
        examples: [{
          title: 'Bull Call Spread Example',
          description: 'Buy $95 call, sell $100 call for a $100 stock you expect to rise but not skyrocket.'
        }],
        estimatedTime: '10 min',
        order: 4
      },
      {
        title: 'Bear Put Spread',
        description: 'Learn the bear put spread for moderate bearish outlooks.',
        category: category._id,
        icon: '📉',
        content: `
<h2>Bear Put Spread</h2>
<ul>
  <li>Actively deployed when an investor strongly expects a moderate, steady decline in the price of an underlying asset.</li>
  <li>Involves purchasing a put option at a specific strike price while simultaneously selling another put option at a lower strike price.</li>
  <li>The premium collected from selling the lower put significantly reduces the total capital cost of the trade.</li>
  <li>Lowers risk compared to buying a standalone put, but caps maximum profit if the asset's price drops below the lower strike price.</li>
</ul>
        `,
        keyTakeaways: [
          'Buy higher strike put, sell lower strike put',
          'Moderate bearish outlook',
          'Lower cost/risk, capped profit'
        ],
        examples: [{
          title: 'Bear Put Spread Example',
          description: 'Buy $105 put, sell $100 put for a $100 stock you expect to drop but not crash.'
        }],
        estimatedTime: '10 min',
        order: 5
      },
      {
        title: 'Covered Call',
        description: 'Learn the covered call strategy for income generation.',
        category: category._id,
        icon: '📊',
        content: `
<h2>Covered Call</h2>
<ul>
  <li>A popular income-generating strategy for investors who already own shares of the underlying stock or asset.</li>
  <li>Involves selling a call option directly against your existing long position to collect the options premium upfront.</li>
  <li>Best utilized when you have a neutral or only slightly bullish expectation for the stock's short-term price movement.</li>
  <li>Provides immediate income but requires you to be entirely willing to sell your shares if the price exceeds the strike price before expiration.</li>
</ul>
        `,
        keyTakeaways: [
          'Own stock, sell call against it',
          'Income generation, neutral/bullish outlook',
          'Potentially obligated to sell shares'
        ],
        examples: [{
          title: 'Covered Call Example',
          description: 'Own 100 shares of $100 stock, sell $105 call expiring in 30 days to collect premium.'
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
        title: 'Trading Strategies Q1',
        question: 'Which strategy involves buying both a call and a put option with the same strike price and expiration date?',
        options: ['Strangle', 'Straddle', 'Iron Condor', 'Bull Call Spread'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Straddle = buy call + put, same strike/expiration.'
      },
      {
        title: 'Trading Strategies Q2',
        question: 'A "Strangle" is different from a "Straddle" because it uses:',
        options: ['Different expiration dates', 'Different underlying assets', 'Different strike prices for the call and put', 'Only sell positions'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Strangle uses different, out-of-the-money strike prices.'
      },
      {
        title: 'Trading Strategies Q3',
        question: 'Which strategy is a market-neutral strategy that involves selling both a call spread and a put spread simultaneously?',
        options: ['Bull Call Spread', 'Bear Put Spread', 'Iron Condor', 'Straddle'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Iron Condor = bull put spread + bear call spread.'
      },
      {
        title: 'Trading Strategies Q4',
        question: 'In a "Bull Call Spread," an investor:',
        options: ['Sells a call with a lower strike and buys one with a higher strike', 'Buys a call with a lower strike and sells one with a higher strike', 'Sells both a call and a put', 'Buys a call and a put at different strikes'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Bull Call Spread = buy lower strike call, sell higher strike call.'
      },
      {
        title: 'Trading Strategies Q5',
        question: 'A "Bear Put Spread" is typically used when a trader expects:',
        options: ['A massive price increase', 'High volatility in either direction', 'A moderate decrease in the asset price', 'No price movement at all'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Bear Put Spread is for moderate bearish expectations.'
      },
      {
        title: 'Trading Strategies Q6',
        question: 'A "Covered Call" involves:',
        options: ['Buying a call and a put simultaneously', 'Selling a call option while owning the underlying stock', 'Selling a call without owning the underlying stock', 'Buying a call option with a very high strike price'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Covered Call = own stock + sell call against it.'
      },
      {
        title: 'Trading Strategies Q7',
        question: 'Which strategy is generally "cheaper" to enter due to buying Out-of-the-Money (OTM) options?',
        options: ['Straddle', 'Strangle', 'Long Stock', 'Iron Condor'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Strangle uses cheaper OTM options compared to Straddle\'s ATM options.'
      },
      {
        title: 'Trading Strategies Q8',
        question: 'What is the primary goal of an Iron Condor strategy?',
        options: ['To profit from a massive stock breakout', 'To profit from the stock staying within a specific price range', 'To eliminate all risk of loss', 'To bet on the stock price going to zero'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'Iron Condor profits from range-bound, low volatility price action.'
      },
      {
        title: 'Trading Strategies Q9',
        question: 'If you expect high volatility but are unsure of the direction, which strategy is most appropriate?',
        options: ['Covered Call', 'Iron Condor', 'Straddle', 'Bull Call Spread'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Straddle is ideal for high volatility, uncertain direction.'
      },
      {
        title: 'Trading Strategies Q10',
        question: 'In a "Covered Call," the "covered" part refers to:',
        options: ['Insurance against all losses', 'The fact that the trader owns the underlying shares to deliver if assigned', 'A secret trading technique', 'Using a stop-loss order'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: '"Covered" means you own the underlying shares to deliver if called.'
      }
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log('Successfully updated "Trading Strategies" content!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating "Trading Strategies":', error);
    process.exit(1);
  }
};

updateTradingStrategies();
