import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';

dotenv.config();

const updateOptionGreeks = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create "Option Greeks" category
    let category = await CourseCategory.findOne({ name: 'Option Greeks' });
    if (!category) {
      category = await CourseCategory.create({
        name: 'Option Greeks',
        description: 'Learn the key option Greeks and how they affect option prices.',
        icon: 'Δ',
        difficulty: 'Medium',
        estimatedHours: 5,
        order: 3
      });
      console.log('Created "Option Greeks" category');
    } else {
      console.log('Found existing "Option Greeks" category');
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
        title: 'Delta (Directional Risk)',
        description: 'Learn how Delta measures option price sensitivity to underlying price changes.',
        category: category._id,
        icon: 'Δ',
        content: `
<h2>Delta (Directional Risk)</h2>
<ul>
  <li><strong>Measures Price Sensitivity:</strong> Delta indicates how much an option's price is expected to move for every $1 change in the underlying asset's price.</li>
  <li><strong>Value Ranges:</strong> Call options have a positive Delta ranging from 0 to 1, while Put options have a negative Delta ranging from -1 to 0.</li>
  <li><strong>Probability Proxy:</strong> Traders often use Delta as a rough mathematical estimate of the percentage chance that an option will expire in-the-money (ITM). For example, a 0.30 Delta implies roughly a 30% chance.</li>
  <li><strong>Share Equivalence:</strong> A Delta of 0.50 means the option behaves similarly to owning 50 shares of the underlying stock.</li>
  <li><strong>Dynamic Nature:</strong> Delta is not static; it constantly shifts as the underlying stock price moves and as expiration approaches.</li>
</ul>
        `,
        keyTakeaways: [
          'Call Delta = 0 to 1 (positive), Put Delta = -1 to 0 (negative)',
          'Delta approximates ITM probability',
          'Delta changes as stock price moves'
        ],
        examples: [{
          title: 'Delta Example',
          description: 'A 0.60 Delta call option will increase by $0.60 if the stock rises by $1.'
        }],
        estimatedTime: '10 min',
        order: 1
      },
      {
        title: 'Gamma (Rate of Change)',
        description: 'Learn how Gamma measures Delta\'s sensitivity to price changes.',
        category: category._id,
        icon: 'Γ',
        content: `
<h2>Gamma (Rate of Change)</h2>
<ul>
  <li><strong>Measures Delta's Sensitivity:</strong> Gamma represents the rate of change in an option's Delta for every $1 move in the underlying stock. If Delta is the "speed" of the option, Gamma is the "acceleration."</li>
  <li><strong>Highest at the Money:</strong> Gamma is typically at its peak for at-the-money (ATM) options and decreases as the option moves deep into or out of the money.</li>
  <li><strong>Positive Value:</strong> It is always a positive number for buyers of both long calls and long puts.</li>
  <li><strong>Risk Indicator:</strong> A high Gamma means the option's Delta can change rapidly with small stock movements, resulting in higher price volatility and potential risk/reward.</li>
  <li><strong>Expiration Impact:</strong> Gamma tends to increase significantly as expiration draws closer, making near-term ATM options highly sensitive to underlying price swings.</li>
</ul>
        `,
        keyTakeaways: [
          'Gamma = rate of change of Delta',
          'Gamma highest for ATM options',
          'Gamma increases near expiration'
        ],
        examples: [{
          title: 'Gamma Example',
          description: 'An ATM option with 0.10 Gamma will see its Delta increase by 0.10 if the stock rises by $1.'
        }],
        estimatedTime: '10 min',
        order: 2
      },
      {
        title: 'Theta (Time Decay)',
        description: 'Learn how Theta measures option value loss over time.',
        category: category._id,
        icon: 'Θ',
        content: `
<h2>Theta (Time Decay)</h2>
<ul>
  <li><strong>Measures Time Sensitivity:</strong> Theta quantifies the rate of time decay on an option's premium, representing how much value the option loses each day as it nears expiration.</li>
  <li><strong>The Silent Killer for Buyers:</strong> Theta is generally negative for option buyers (meaning time works against them) and positive for option sellers (meaning time works in their favor).</li>
  <li><strong>Accelerates Over Time:</strong> Time decay is not linear; it accelerates rapidly in the final weeks and days leading up to expiration, particularly for at-the-money options.</li>
  <li><strong>Targets Extrinsic Value:</strong> Theta only eats away at an option's extrinsic (time) value. It does not affect the intrinsic value of an option that is already in-the-money.</li>
  <li><strong>Weekend Effect:</strong> While the market is closed, time decay still mathematically occurs, though market makers often price in weekend Theta decay by late Friday.</li>
</ul>
        `,
        keyTakeaways: [
          'Theta = daily time decay',
          'Negative for buyers, positive for sellers',
          'Decay accelerates near expiration'
        ],
        examples: [{
          title: 'Theta Example',
          description: 'An option with -0.05 Theta will lose $0.05 of value each day.'
        }],
        estimatedTime: '10 min',
        order: 3
      },
      {
        title: 'Vega (Volatility Risk)',
        description: 'Learn how Vega measures option sensitivity to volatility changes.',
        category: category._id,
        icon: 'V',
        content: `
<h2>Vega (Volatility Risk)</h2>
<ul>
  <li><strong>Measures Volatility Sensitivity:</strong> Vega indicates how much an option's price will change for a 1% shift in the underlying asset's implied volatility (IV).</li>
  <li><strong>Positive for Buyers:</strong> When implied volatility increases, option premiums generally become more expensive, making Vega a positive force for option buyers and a risk for sellers.</li>
  <li><strong>Impacts Longer-Term Options:</strong> Vega has the greatest impact on options with longer expiration dates, as there is more time for volatility to drastically affect the underlying asset.</li>
  <li><strong>Highest at the Money:</strong> Like Gamma, Vega is most concentrated in at-the-money options and drops off for deep out-of-the-money or in-the-money contracts.</li>
  <li><strong>The "IV Crush":</strong> A sudden drop in implied volatility (which frequently happens right after an anticipated event like an earnings report) can severely reduce an option's price, even if the stock moves in the desired direction.</li>
</ul>
        `,
        keyTakeaways: [
          'Vega = sensitivity to volatility',
          'Positive for buyers, risk for sellers',
          'Longer-term options have higher Vega'
        ],
        examples: [{
          title: 'Vega Example',
          description: 'An option with 0.20 Vega will increase by $0.20 if volatility rises by 1%.'
        }],
        estimatedTime: '10 min',
        order: 4
      },
      {
        title: 'Rho (Interest Rate Risk)',
        description: 'Learn how Rho measures option sensitivity to interest rate changes.',
        category: category._id,
        icon: 'ρ',
        content: `
<h2>Rho (Interest Rate Risk)</h2>
<ul>
  <li><strong>Measures Interest Rate Sensitivity:</strong> Rho represents the expected change in an option's price for a 1% change in the risk-free interest rate (often tied to U.S. Treasury bills).</li>
  <li><strong>Divergence Between Calls and Puts:</strong> Call options generally have a positive Rho (values increase as interest rates rise), while put options have a negative Rho (values decrease as rates rise).</li>
  <li><strong>Minimal Short-Term Impacts:</strong> For standard, short-term options trades, Rho is usually the least significant of the Greeks and has a negligible effect on daily pricing.</li>
  <li><strong>Relevance for LEAPS:</strong> Rho becomes a much more crucial factor for longer-term options, such as Long-Term Equity Anticipation Securities (LEAPS), where the cost of carrying the position over months or years is higher.</li>
  <li><strong>Macroeconomic Factor:</strong> Because interest rates change infrequently compared to stock prices or market volatility, Rho is typically only monitored closely during periods of aggressive central bank policy shifts.</li>
</ul>
        `,
        keyTakeaways: [
          'Call Rho positive, Put Rho negative',
          'Minimal impact on short-term options',
          'Important for LEAPS/long-term options'
        ],
        examples: [{
          title: 'Rho Example',
          description: 'A LEAP call with 0.30 Rho will increase by $0.30 if interest rates rise by 1%.'
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
        title: 'Option Greeks Q1',
        question: 'If an option has a Delta of 0.60, how much is its price expected to change if the underlying stock increases by $1?',
        options: ['It will increase by $1.00', 'It will increase by $0.60', 'It will decrease by $0.60', 'It will increase by 60%'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Delta measures the $ change per $1 underlying move, so 0.60 Delta = +$0.60.'
      },
      {
        title: 'Option Greeks Q2',
        question: 'In practical trading, what does a Delta of 0.25 roughly estimate?',
        options: ['A 25% return on investment at expiration', 'The option loses $0.25 of value every day', 'A 25% probability that the option will expire in-the-money', 'The underlying stock price will move by 25%'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Delta is often used as a rough ITM probability estimate.'
      },
      {
        title: 'Option Greeks Q3',
        question: 'Which option Greek measures the expected change in Delta for a $1 move in the underlying stock?',
        options: ['Gamma', 'Theta', 'Vega', 'Rho'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Gamma is the rate of change of Delta.'
      },
      {
        title: 'Option Greeks Q4',
        question: 'At what strike price location is Gamma typically at its highest mathematical value?',
        options: ['Deep out-of-the-money (OTM) options', 'Deep in-the-money (ITM) options', 'At-the-money (ATM) options', 'It is equal across all strike prices'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Gamma peaks for at-the-money options.'
      },
      {
        title: 'Option Greeks Q5',
        question: 'How does Theta primarily affect an investor holding a long (bought) option position?',
        options: ['It steadily erodes the extrinsic value of the option each day', 'It increases the intrinsic value of the option over time', 'It causes the underlying stock price to decline', 'It protects the option premium from market crashes'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Theta is negative for buyers, eroding extrinsic value daily.'
      },
      {
        title: 'Option Greeks Q6',
        question: 'At what point does time decay (Theta) accelerate the fastest for an at-the-money option?',
        options: ['More than a year away from expiration', 'In the final weeks and days leading up to expiration', 'Immediately in the first 24 hours after the option is created', 'Time decay is completely linear and never changes speed'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'Theta decay accelerates rapidly near expiration for ATM options.'
      },
      {
        title: 'Option Greeks Q7',
        question: 'If market-wide implied volatility (IV) suddenly spikes, which Greek indicates how much an option\'s premium will increase?',
        options: ['Delta', 'Gamma', 'Vega', 'Rho'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Vega measures option sensitivity to volatility.'
      },
      {
        title: 'Option Greeks Q8',
        question: 'What typically happens to an option\'s premium due to Vega immediately following a highly anticipated event like an earnings report?',
        options: ['The premium spikes aggressively because the event is over', 'The premium drops significantly due to a rapid collapse in implied volatility ("IV Crush")', 'The premium stays completely frozen until the next trading day', 'The intrinsic value immediately drops to zero'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'After an anticipated event, implied volatility collapses (IV Crush), reducing option premiums.'
      },
      {
        title: 'Option Greeks Q9',
        question: 'For which type of option strategy is Rho (interest rate sensitivity) the most critical factor to actively monitor?',
        options: ['Zero days to expiration (0DTE) day trades', 'Weekly swing trades', 'Long-term options contracts, such as LEAPS (held for a year or more)', 'Overnight earnings gap plays'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'Rho is most important for long-term options like LEAPS.'
      },
      {
        title: 'Option Greeks Q10',
        question: 'How do the standard Delta values of basic long Call options compare to basic long Put options?',
        options: ['Calls have a positive Delta, while Puts have a negative Delta', 'Calls have a negative Delta, while Puts have a positive Delta', 'Both Calls and Puts have a positive Delta', 'Both Calls and Puts have a neutral Delta of zero'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Long Calls have positive Delta, long Puts have negative Delta.'
      }
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log('Successfully updated "Option Greeks" content!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating "Option Greeks":', error);
    process.exit(1);
  }
};

updateOptionGreeks();
