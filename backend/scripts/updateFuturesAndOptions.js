import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';

dotenv.config();

const updateFuturesAndOptions = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create "Futures & Options" category
    let category = await CourseCategory.findOne({ name: 'Futures & Options' });
    if (!category) {
      category = await CourseCategory.create({
        name: 'Futures & Options',
        description: 'Complete guide to futures and options trading strategies.',
        icon: '📈',
        difficulty: 'Advanced',
        estimatedHours: 5,
        order: 10
      });
      console.log('Created "Futures & Options" category');
    } else {
      console.log('Found existing "Futures & Options" category');
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
        title: 'Futures Basics',
        description: 'Learn the fundamentals of futures contracts.',
        category: category._id,
        icon: '📄',
        content: `
<h2>Futures Basics</h2>
<ul>
  <li><strong>Definition:</strong> A futures contract is a legally binding agreement to buy or sell a specific asset at a predetermined price on a specified date in the future.</li>
  <li><strong>Strict Obligation:</strong> Unlike options contracts, both the buyer and the seller in a futures contract are strictly obligated to fulfill the trade upon expiration, regardless of current market conditions.</li>
  <li><strong>Standardization:</strong> To ensure fair and fluid markets, these contracts are highly standardized by regulated exchanges (covering exact expiry dates, quality, and quantity).</li>
  <li><strong>Underlying Assets:</strong> Futures can be based on a wide variety of underlying assets, including individual stocks, stock market indices, commodities (like gold, oil, or agriculture), and currencies.</li>
  <li><strong>Dual Purpose:</strong> Market participants generally use futures for two main reasons: speculation (trying to profit from price movements) or hedging (protecting against price risks).</li>
</ul>
        `,
        keyTakeaways: [
          'Legally binding agreement',
          'Both parties obligated to fulfill',
          'Standardized by exchanges',
          'Used for speculation or hedging'
        ],
        examples: [{
          title: 'Futures Basics Example',
          description: 'A farmer can sell futures contracts to lock in a price for their crop before harvest.'
        }],
        estimatedTime: '10 min',
        order: 1
      },
      {
        title: 'Lot Size',
        description: 'Understand lot sizes in futures trading.',
        category: category._id,
        icon: '📊',
        content: `
<h2>Lot Size</h2>
<ul>
  <li><strong>Definition:</strong> A lot size is the minimum, fixed number of units (such as shares, barrels, or ounces) that make up a single futures contract.</li>
  <li><strong>Set by Exchanges:</strong> Exchanges pre-determine these lot sizes to standardize trading, make pricing straightforward, and ensure high market liquidity.</li>
  <li><strong>Calculating Contract Value:</strong> The total financial exposure of your position is calculated by multiplying the current market price of the asset by its designated lot size.</li>
  <li><strong>Indivisible Units:</strong> You cannot trade fractions of a lot. All futures trades must be executed in whole multiples of the lot size (e.g., 1 lot, 2 lots, 10 lots).</li>
  <li><strong>Crucial for Risk Management:</strong> Because one single contract controls a large batch of units, knowing the exact lot size is mandatory to calculate your potential risk and reward before entering a trade.</li>
</ul>
        `,
        keyTakeaways: [
          'Fixed minimum units per contract',
          'Set by exchanges',
          'Calculate contract value',
          'Only whole lots allowed'
        ],
        examples: [{
          title: 'Lot Size Example',
          description: 'If Gold futures lot size is 100 grams, 3 lots = 300 grams exposure.'
        }],
        estimatedTime: '10 min',
        order: 2
      },
      {
        title: 'Margin Requirements',
        description: 'Learn about margin in futures trading.',
        category: category._id,
        icon: '💰',
        content: `
<h2>Margin Requirements</h2>
<ul>
  <li><strong>The Upfront Deposit:</strong> Margin is a fraction of the total contract value that a trader must deposit with their broker in order to open a futures position.</li>
  <li><strong>The Power of Leverage:</strong> Margins provide leverage, allowing you to control a massive financial position using only a relatively small amount of your own capital.</li>
  <li><strong>Initial vs. Maintenance Margin:</strong> The "initial margin" is what you need to start the trade, while the "maintenance margin" is the minimum balance required in your account to keep that position open as prices fluctuate.</li>
  <li><strong>Margin Calls:</strong> If market prices move against you and your balance drops below the maintenance requirement, your broker will issue a "margin call," requiring you to immediately deposit more funds.</li>
  <li><strong>A Double-Edged Sword:</strong> While trading on margin can significantly amplify your profits, it equally magnifies your potential losses, making futures trading inherently high-risk.</li>
</ul>
        `,
        keyTakeaways: [
          'Upfront deposit for positions',
          'Provides leverage',
          'Initial vs maintenance margin',
          'Magnifies profits and losses'
        ],
        examples: [{
          title: 'Margin Example',
          description: 'Deposit initial margin to open a position, and maintain balance to avoid margin calls.'
        }],
        estimatedTime: '10 min',
        order: 3
      },
      {
        title: 'Futures Hedging',
        description: 'Learn how to hedge with futures contracts.',
        category: category._id,
        icon: '🛡️',
        content: `
<h2>Futures Hedging</h2>
<ul>
  <li><strong>Risk Reduction:</strong> Hedging is a defensive risk-management strategy used to minimize or offset potential losses in an existing investment portfolio or business operation.</li>
  <li><strong>Taking Opposite Positions:</strong> It typically involves taking a position in the futures market that is exactly opposite to the asset you currently own in the physical or cash market.</li>
  <li><strong>Locking in Prices:</strong> Businesses (like farmers or airlines) use hedging to lock in future buy or sell prices, insulating themselves from volatile, unpredictable market swings.</li>
  <li><strong>Protection Over Profit:</strong> The primary goal of a hedge is not to generate massive new profits, but rather to create predictability and protect against worst-case financial scenarios.</li>
  <li><strong>The Cost of Insurance:</strong> Hedging acts much like financial insurance; it comes with transaction costs and will naturally cap your potential upside if the market actually moves in your favor.</li>
</ul>
        `,
        keyTakeaways: [
          'Reduce risk with opposite positions',
          'Lock in prices',
          'Protection over profit',
          'Acts like insurance'
        ],
        examples: [{
          title: 'Hedging Example',
          description: 'An airline can buy oil futures to lock in fuel prices and hedge against price increases.'
        }],
        estimatedTime: '10 min',
        order: 4
      },
      {
        title: 'Futures Strategies',
        description: 'Learn common futures trading strategies.',
        category: category._id,
        icon: '⚡',
        content: `
<h2>Futures Strategies</h2>
<ul>
  <li><strong>Directional Trading:</strong> The most fundamental strategy: going "long" (buying a contract) if you anticipate prices will rise, or going "short" (selling a contract) if you expect prices to drop.</li>
  <li><strong>Spread Trading:</strong> This involves simultaneously buying one futures contract and selling another related one to profit from the changing price difference (the spread) between the two, rather than the outright direction of the market.</li>
  <li><strong>Arbitrage:</strong> Advanced traders use this strategy to secure largely risk-free profits by exploiting minor, temporary price discrepancies between the futures market and the spot (cash) market.</li>
  <li><strong>Varying Timeframes:</strong> Strategies can be tailored for entirely different timeframes, ranging from rapid day trading (closing all positions before the market) to longer-term swing trading (holding contracts for weeks).</li>
  <li><strong>Capital Preservation:</strong> Regardless of the specific strategy chosen, successful futures trading relies heavily on strict position sizing and the disciplined use of stop-loss orders to limit downside risk.</li>
</ul>
        `,
        keyTakeaways: [
          'Directional trading (long/short)',
          'Spread trading',
          'Arbitrage opportunities',
          'Use stop-loss orders'
        ],
        examples: [{
          title: 'Futures Strategy Example',
          description: 'Use spread trading to profit from price differences between related contracts.'
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
        title: 'Futures & Options Q1',
        question: 'What is a Futures Contract?',
        options: ['An agreement to buy/sell an asset at a future date for a price determined today.', 'A contract that gives you the right, but not the obligation, to buy an asset.', 'A type of stock that pays high dividends.', 'An insurance policy against stock market crashes.'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Futures are agreements to buy/sell at future date for today\'s price.'
      },
      {
        title: 'Futures & Options Q2',
        question: 'What does "Lot Size" represent in futures trading?',
        options: ['The maximum price a contract can reach.', 'The fixed number of units of an underlying asset in a single contract.', 'The total amount of money in your trading account.', 'The fee paid to the broker for executing a trade.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Lot size is the fixed number of units in a single contract.'
      },
      {
        title: 'Futures & Options Q3',
        question: 'If the Lot Size for Gold is 100 grams, buying 3 lots means you are trading:',
        options: ['3 grams', '30 grams', '300 grams', '100 grams'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: '3 lots × 100 grams = 300 grams.'
      },
      {
        title: 'Futures & Options Q4',
        question: 'What is "Initial Margin"?',
        options: ['The total profit made on a trade.', 'The minimum amount of capital required to open a futures position.', 'The fee charged for holding a position overnight.', 'The price at which a contract expires.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Initial margin is the capital needed to open a futures position.'
      },
      {
        title: 'Futures & Options Q5',
        question: 'If your account balance falls below the "Maintenance Margin," what typically happens?',
        options: ['You receive a "Margin Call" to add more funds.', 'Your profits are automatically doubled.', 'The exchange gives you a free loan.', 'Nothing happens until the contract expires.'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Falling below maintenance margin triggers a margin call.'
      },
      {
        title: 'Futures & Options Q6',
        question: 'What is the primary goal of "Hedging" in the futures market?',
        options: ['To gamble on high-risk price movements.', 'To reduce or eliminate the risk of price fluctuations in an underlying asset.', 'To avoid paying taxes on trading profits.', 'To ensure you always make a profit regardless of market direction.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Hedging reduces or eliminates price fluctuation risk.'
      },
      {
        title: 'Futures & Options Q7',
        question: 'An oil producer who is afraid prices will fall before their next harvest would likely:',
        options: ['Buy (Long) Oil Futures.', 'Sell (Short) Oil Futures.', 'Sell their company stocks.', 'Do nothing.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Producer would sell futures to lock in current prices.'
      },
      {
        title: 'Futures & Options Q8',
        question: 'In futures trading, "Going Long" means:',
        options: ['You expect the price of the asset to decrease.', 'You expect the price of the asset to increase.', 'You are holding the contract for more than one year.', 'You are trading with a very large lot size.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Going long means expecting price to increase.'
      },
      {
        title: 'Futures & Options Q9',
        question: 'What is "Contango" in futures markets?',
        options: ['When the futures price is lower than the expected spot price.', 'When the futures price is higher than the spot price.', 'A specific type of technical analysis chart.', 'The process of closing a trade before expiry.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'Contango is when futures price is higher than spot price.'
      },
      {
        title: 'Futures & Options Q10',
        question: 'What is "Cash Settlement" in a futures contract?',
        options: ['The physical delivery of the actual asset (like 1,000 barrels of oil).', 'Settling the difference in value in cash rather than delivering the physical asset.', 'Paying your broker\'s commission in physical currency.', 'Borrowing money from a bank to pay for the contract.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Cash settlement settles value difference in cash, no physical delivery.'
      }
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log('Successfully updated "Futures & Options" content!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating "Futures & Options":', error);
    process.exit(1);
  }
};

updateFuturesAndOptions();
