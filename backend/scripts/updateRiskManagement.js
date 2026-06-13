import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';

dotenv.config();

const updateRiskManagement = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create "Risk Management" category
    let category = await CourseCategory.findOne({ name: 'Risk Management' });
    if (!category) {
      category = await CourseCategory.create({
        name: 'Risk Management',
        description: 'Learn essential risk management principles for trading success.',
        icon: '🛡️',
        difficulty: 'Easy',
        estimatedHours: 5,
        order: 6
      });
      console.log('Created "Risk Management" category');
    } else {
      console.log('Found existing "Risk Management" category');
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
        title: 'Position Sizing',
        description: 'Learn to calculate proper position sizes based on your risk tolerance.',
        category: category._id,
        icon: '📊',
        content: `
<h2>Position Sizing</h2>
<ul>
  <li>It is the process of determining the exact number of shares or contracts to trade based on your total account size and risk tolerance.</li>
  <li>It uses a calculated percentage (often 1% to 2% of total capital) to ensure no single losing trade can wipe out your account.</li>
  <li>By standardizing the amount you risk on every setup, it protects you from making emotional, oversized bets.</li>
  <li>It serves as a fundamental mathematical approach to longevity, allowing you to safely survive inevitable losing streaks.</li>
</ul>
        `,
        keyTakeaways: [
          'Risk 1-2% of total capital per trade',
          'Standardize risk per setup',
          'Survive losing streaks'
        ],
        examples: [{
          title: 'Position Sizing Example',
          description: '$10,000 account, risk 1% ($100) per trade on a $50 stock with $5 stop loss → buy 20 shares.'
        }],
        estimatedTime: '10 min',
        order: 1
      },
      {
        title: 'Stop Loss',
        description: 'Learn how stop loss orders protect your trading capital.',
        category: category._id,
        icon: '🛑',
        content: `
<h2>Stop Loss</h2>
<ul>
  <li>A stop-loss is an automated order placed with your broker to close a position once it drops to a specific, predetermined price.</li>
  <li>It acts as a strict safety net, ensuring your position is cut before a minor loss becomes devastating.</li>
  <li>Setting it before entering a trade removes the emotional hesitation of manually deciding when to exit a bad position.</li>
  <li>It essentially defines and strictly caps your maximum acceptable financial risk on any given trade from the very beginning.</li>
</ul>
        `,
        keyTakeaways: [
          'Automated exit at predetermined price',
          'Removes emotional decision-making',
          'Defines maximum risk upfront'
        ],
        examples: [{
          title: 'Stop Loss Example',
          description: 'Buy a stock at $100, set stop loss at $90 → maximum loss is $10 per share.'
        }],
        estimatedTime: '10 min',
        order: 2
      },
      {
        title: 'Risk Reward Ratio',
        description: 'Learn how to evaluate trade setups using risk-reward ratios.',
        category: category._id,
        icon: '⚖️',
        content: `
<h2>Risk Reward Ratio</h2>
<ul>
  <li>This ratio compares the exact amount of capital you could lose on a trade to the potential profit you stand to gain.</li>
  <li>For example, a 1:3 ratio means you are risking $1 to potentially make $3 if the trade reaches your target price.</li>
  <li>Maintaining a strong ratio means you don't need a high win rate to be profitable, as your winning trades mathematically outpace your losers.</li>
  <li>It forces you to objectively evaluate whether a trading setup is actually worth the financial exposure before you jump in.</li>
</ul>
        `,
        keyTakeaways: [
          'Compare potential loss to potential profit',
          '1:3 ratio = risk $1 to make $3',
          'Strong ratio → lower win rate needed'
        ],
        examples: [{
          title: 'Risk Reward Example',
          description: 'Risk $50 to make $150 → 1:3 ratio, excellent risk-reward.'
        }],
        estimatedTime: '10 min',
        order: 3
      },
      {
        title: 'Capital Protection',
        description: 'Learn why protecting your trading capital is the #1 priority.',
        category: category._id,
        icon: '💵',
        content: `
<h2>Capital Protection</h2>
<ul>
  <li>This is the core philosophy that preserving your initial investment is always more important than aggressively chasing profits.</li>
  <li>If you lose your trading capital, you lose your ability to stay in the market and capitalize on future opportunities.</li>
  <li>It involves combining all other risk management tools to vigorously defend your baseline account value at all costs.</li>
  <li>Successful traders view their capital as their business inventory; without it, the trading business simply cannot operate.</li>
</ul>
        `,
        keyTakeaways: [
          'Preserve capital first, chase profits second',
          'Capital = business inventory',
          'No capital → no ability to trade'
        ],
        examples: [{
          title: 'Capital Protection Example',
          description: 'A $10,000 account that grows slowly but steadily beats a $10,000 account that gets wiped out.'
        }],
        estimatedTime: '10 min',
        order: 4
      },
      {
        title: 'Hedging',
        description: 'Learn how hedging strategies can offset portfolio risk.',
        category: category._id,
        icon: '🛡️',
        content: `
<h2>Hedging</h2>
<ul>
  <li>Hedging is a strategy used to offset potential losses by taking a secondary, opposite position in a related asset.</li>
  <li>It acts like an insurance policy on your investments; if your main asset drops in value, the hedge gains value to balance the hit.</li>
  <li>While it drastically reduces your overall risk exposure, it also typically reduces your maximum potential profit because hedges cost money to establish.</li>
  <li>It is highly effective during uncertain market conditions to shield your overall portfolio from sudden, short-term volatility.</li>
</ul>
        `,
        keyTakeaways: [
          'Offset risk with opposite position',
          'Like insurance for investments',
          'Reduces risk, but also reduces profit'
        ],
        examples: [{
          title: 'Hedging Example',
          description: 'Own 100 shares of $100 stock, buy a $95 put to hedge against downside risk.'
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
        title: 'Risk Management Q1',
        question: 'What is the "2% Rule" in trading?',
        options: ['Only trade 2% of the time.', 'Never risk more than 2% of your total account equity on any single trade.', 'Aim for a 2% profit every day.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'The 2% Rule means risk ≤ 2% of total account equity per trade.'
      },
      {
        title: 'Risk Management Q2',
        question: 'A "Stop Loss" order is primarily used for:',
        options: ['Locking in profits automatically.', 'Limiting potential losses if a trade goes against you.', 'Buying a stock at a lower price.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Stop Loss limits potential losses by closing the position automatically.'
      },
      {
        title: 'Risk Management Q3',
        question: 'If you buy a stock at $500 and set a stop-loss at $450 with a target price of $650, what is your Risk-Reward Ratio?',
        options: ['1:2', '1:3', '1:4'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'Risk: $50, Reward: $150 → 1:3 ratio.'
      },
      {
        title: 'Risk Management Q4',
        question: 'What does "Position Sizing" refer to?',
        options: ['Determining the physical size of your trading screen.', 'Deciding how many shares or units of an asset to buy based on your risk tolerance.', 'The duration you plan to hold a trade.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Position Sizing determines how many shares to trade based on risk.'
      },
      {
        title: 'Risk Management Q5',
        question: 'Which of these is a common strategy for "Capital Protection"?',
        options: ['Risking 10% of your capital on every trade.', 'Reducing position sizes after a series of losses.', 'Removing stop-loss orders to give the trade "room to breathe."'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Reducing position sizes after losses helps protect capital.'
      },
      {
        title: 'Risk Management Q6',
        question: 'In trading, "Hedging" is a technique used to:',
        options: ['Guarantee a profit on every trade.', 'Offset potential losses by taking an opposite position.', 'Predict the exact top or bottom of a market.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Hedging offsets risk with an opposite position.'
      },
      {
        title: 'Risk Management Q7',
        question: 'What does a "Bull Market" signify?',
        options: ['Prices are falling and investor sentiment is negative.', 'Prices are rising and investor sentiment is positive.', 'The market is closed for a holiday.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Bull Market = rising prices, positive sentiment.'
      },
      {
        title: 'Risk Management Q8',
        question: 'What is the "Bid" price in a market?',
        options: ['The lowest price a seller is willing to accept.', 'The highest price a buyer is willing to pay.', 'The average price of the last 10 trades.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Bid price is what buyers are willing to pay.'
      },
      {
        title: 'Risk Management Q9',
        question: 'An "Intraday" trader typically:',
        options: ['Holds positions for several months.', 'Opens and closes all positions within the same trading day.', 'Only trades on the weekends.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Intraday traders open/close positions the same day.'
      },
      {
        title: 'Risk Management Q10',
        question: 'What is a "Demat" account used for?',
        options: ['To track daily news.', 'To electronically store your shares and securities.', 'To calculate your annual taxes.'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Demat account electronically stores shares/securities.'
      }
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log('Successfully updated "Risk Management" content!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating "Risk Management":', error);
    process.exit(1);
  }
};

updateRiskManagement();
