import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';
import Achievement from '../src/models/Achievement.model.js';

dotenv.config();

const seedEducationData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await CourseCategory.deleteMany({});
    await Topic.deleteMany({});
    await Quiz.deleteMany({});
    await Achievement.deleteMany({});

    // Create categories
    const categories = [
      { name: 'Options Basics', description: 'Learn the fundamentals of options trading including calls, puts, strike prices, and more.', icon: '🎯', thumbnail: '', difficulty: 'Beginner', estimatedHours: 8, order: 1 },
      { name: 'Charts & Candles', description: 'Master technical analysis with candlestick patterns, chart types, and price action.', icon: '📊', thumbnail: '', difficulty: 'Beginner', estimatedHours: 6, order: 2 },
      { name: 'Option Greeks', description: 'Understand Delta, Gamma, Theta, Vega, and Rho - the options price sensitivity metrics.', icon: '📈', thumbnail: '', difficulty: 'Intermediate', estimatedHours: 10, order: 3 },
      { name: 'Open Interest', description: 'Learn how to analyze open interest and volume for better trading decisions.', icon: '📉', thumbnail: '', difficulty: 'Intermediate', estimatedHours: 5, order: 4 },
      { name: 'Trading Strategies', description: 'Discover advanced strategies like spreads, straddles, strangles, and more.', icon: '⚡', thumbnail: '', difficulty: 'Advanced', estimatedHours: 12, order: 5 },
      { name: 'Risk Management', description: 'Protect your capital with proper position sizing, stop losses, and risk management.', icon: '🛡️', thumbnail: '', difficulty: 'Beginner', estimatedHours: 7, order: 6 },
      { name: 'Trading Psychology', description: 'Master your emotions, develop discipline, and build a winning mindset.', icon: '🧠', thumbnail: '', difficulty: 'Intermediate', estimatedHours: 6, order: 7 },
      { name: 'Swing Trading', description: 'Learn swing trading techniques to profit from medium-term market moves.', icon: '📅', thumbnail: '', difficulty: 'Intermediate', estimatedHours: 8, order: 8 },
      { name: 'Intraday Trading', description: 'Master day trading strategies, entry and exit techniques for quick profits.', icon: '🕒', thumbnail: '', difficulty: 'Advanced', estimatedHours: 10, order: 9 },
      { name: 'Futures & Options', description: 'Complete guide to futures and options, from basics to advanced strategies.', icon: '💰', thumbnail: '', difficulty: 'Advanced', estimatedHours: 15, order: 10 }
    ];

    const createdCategories = await CourseCategory.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create topics
    const allTopics = [];

    // Options Basics topics
    const optionsBasicsTopics = [
      { title: 'What are Options?', description: 'An introduction to options contracts and how they work.', icon: '📚', content: '<p>Options are financial derivatives that give buyers the right, but not the obligation, to buy or sell an underlying asset at a specified price on or before a specified date.</p><h3>Key Points:</h3><ul><li>Option = Right (not obligation)</li><li>Call Option = Right to Buy</li><li>Put Option = Right to Sell</li><li>Strike Price = Agreed Price</li><li>Expiry Date = Last Trading Date</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Call Option Example', description: 'You buy a Reliance Call Option with a ₹2,500 strike price when the stock is at ₹2,480. This gives you the right to buy Reliance at ₹2,500 before expiry.' }], keyTakeaways: ['Options give rights, not obligations', 'Calls = buy, Puts = sell', 'Every option has an expiry'], order: 1 },
      { title: 'Call Option Explained', description: 'Everything you need to know about call options.', icon: '📈', content: '<p>A call option is a contract that gives the buyer the right to buy an underlying asset at a predetermined strike price before expiry.</p><h3>How Call Options Work:</h3><ul><li>Buyer pays premium</li><li>Profits when price rises</li><li>Max loss is premium paid</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Reliance Call', description: 'Buy Reliance Call @ ₹2500, premium ₹50. Profit starts when price > ₹2550.' }], keyTakeaways: ['Calls profit from up moves', 'Buyer risk limited to premium', 'Seller has unlimited risk'], order: 2 },
      { title: 'Put Option Explained', description: 'Everything you need to know about put options.', icon: '📉', content: '<p>A put option is a contract that gives the buyer the right to sell an underlying asset at a predetermined strike price before expiry.</p><h3>How Put Options Work:</h3><ul><li>Buyer pays premium</li><li>Profits when price falls</li><li>Max loss is premium paid</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Reliance Put', description: 'Buy Reliance Put @ ₹2500, premium ₹50. Profit starts when price < ₹2450.' }], keyTakeaways: ['Puts profit from down moves', 'Buyer risk limited to premium', 'Seller has limited risk'], order: 3 },
      { title: 'Strike Price', description: 'Learn about strike prices and how to choose them.', icon: '🎯', content: '<p>Strike price is the price at which you can buy (call) or sell (put) the underlying asset.</p><h3>Types of Strikes:</h3><ul><li>In-the-Money (ITM) = Immediate value</li><li>At-the-Money (ATM) = Price = Strike</li><li>Out-of-the-Money (OTM) = No intrinsic value</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Strike Example', description: 'Reliance at ₹2500. 2450 = ITM Call, 2500 = ATM, 2550 = OTM Call.' }], keyTakeaways: ['ITM has intrinsic value', 'ATM has max time value', 'OTM is cheap but risky'], order: 4 },
      { title: 'Option Premium', description: 'Understand option premium components and pricing.', icon: '💵', content: '<p>Option premium = Intrinsic Value + Time Value + Volatility Value.</p><h3>Components:</h3><ul><li>Intrinsic Value = How much ITM</li><li>Time Value = Value of waiting</li><li>Volatility Value = Expected price swings</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Premium Example', description: 'Call premium of ₹100 on ITM option may be ₹60 intrinsic + ₹40 time value.' }], keyTakeaways: ['Premium = Intrinsic + Time', 'Time value decays daily', 'More volatility = higher premium'], order: 5 },
      { title: 'Expiry Dates', description: 'Learn about option expiry and why it matters.', icon: '📅', content: '<p>Option expiry is the last date on which an option can be exercised.</p><h3>Expiry Types:</h3><ul><li>Weekly = Thursdays</li><li>Monthly = Last Thursday</li><li>Quarterly = 3rd Friday</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Expiry Example', description: 'Monthly option expires on last Thursday of month. After that, it becomes worthless if OTM.' }], keyTakeaways: ['Expiry is critical', 'Time value decays faster near expiry', 'Roll over to next series if needed'], order: 6 },
      { title: 'Margin Requirements', description: 'Margin requirements for option buyers and sellers.', icon: '🔒', content: '<p>Buyers pay full premium. Sellers require margin to cover risk.</p><h3>Buyers vs Sellers:</h3><ul><li>Buyers = Pay premium only</li><li>Sellers = Deposit margin</li><li>Margin = Required collateral</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Margin Example', description: 'Selling a call option requires margin deposit to cover potential losses.' }], keyTakeaways: ['Buyers no margin needed', 'Sellers need margin', 'Margin requirements change daily'], order: 7 },
      { title: 'Option Payoff Diagrams', description: 'Visualizing profit and loss with payoff diagrams.', icon: '📊', content: '<p>Payoff diagrams show profit/loss at expiry at different underlying prices.</p><h3>Reading Diagrams:</h3><ul><li>X-axis = Price at expiry</li><li>Y-axis = Profit/Loss</li><li>Break-even = Strike + Premium</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Call Payoff', description: 'Call buyer: loss is -premium, profit unlimited above break-even.' }], keyTakeaways: ['Payoff = Result at expiry', 'Break-even = Strike + Premium', 'Max loss limited for buyers'], order: 8 },
      { title: 'Intrinsic vs Time Value', description: 'Understand the two key components of option pricing.', icon: '⏱️', content: '<p>Every option price has two parts: intrinsic value and time value.</p><h3>Intrinsic Value:</h3><ul><li>Call = max(Spot - Strike, 0)</li><li>Put = max(Strike - Spot, 0)</li><li>ITM options have this</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Value Example', description: 'Spot = 2500, Call Strike = 2450, Premium = 100. Intrinsic = 50, Time = 50.' }], keyTakeaways: ['Intrinsic = real value', 'Time value decays over time', 'At expiry, time value = 0'], order: 9 },
      { title: 'ITM, ATM, OTM', description: 'In-the-Money, At-the-Money, Out-of-the-Money options.', icon: '🎯', content: '<p>Options are classified based on how strike price relates to spot price.</p><h3>Classification:</h3><ul><li>ITM = Has intrinsic value</li><li>ATM = Spot = Strike</li><li>OTM = No intrinsic value</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [{ title: 'Classification', description: 'Spot 2500: 2450 Call = ITM, 2500 Call = ATM, 2550 Call = OTM.' }], keyTakeaways: ['ITM = most expensive', 'ATM = highest time value', 'OTM = cheapest'], order: 10 }
    ];

    // Charts & Candles topics
    const chartsCandlesTopics = [
      { title: 'Introduction to Charts', description: 'Basics of stock charts and price visualization.', icon: '📈', content: '<p>Charts are graphical representations of price movements over time.</p><h3>Common Chart Types:</h3><ul><li>Line Chart = Simple line</li><li>Bar Chart = OHLC bars</li><li>Candlestick Chart = Most popular</li><li>Renko = Brick chart</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Charts show price history', 'Candlesticks most popular', 'Timeframes matter'], order: 1 },
      { title: 'Candlestick Basics', description: 'Understanding candle anatomy.', icon: '🕯️', content: '<p>Candlesticks have a body and wicks (shadows).</p><h3>Candle Parts:</h3><ul><li>Body = Open to Close</li><li>Upper wick = High</li><li>Lower wick = Low</li><li>Green = Bullish (Close > Open)</li><li>Red = Bearish (Close < Open)</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Green = up, Red = down', 'Body size shows strength', 'Wicks show high/low'], order: 2 },
      { title: 'Doji Pattern', description: 'The neutral reversal pattern.', icon: '⚠️', content: '<p>Doji has open and close at the same level, showing indecision.</p><h3>What it means:</h3><ul><li>Open = Close</li><li>Shows indecision</li><li>Potential reversal</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Doji = indecision', 'Watch reversal signs', 'Confirm with other signals'], order: 3 },
      { title: 'Hammer Pattern', description: 'Bullish reversal pattern.', icon: '🔨', content: '<p>Hammer has small body, long lower wick, appears at bottom.</p><h3>Characteristics:</h3><ul><li>Long lower wick</li><li>Small upper body</li><li>After a downtrend</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Hammer = bullish reversal', 'Needs confirmation', 'Long lower wick key'], order: 4 },
      { title: 'Shooting Star', description: 'Bearish reversal pattern.', icon: '⭐', content: '<p>Shooting star has small body, long upper wick, appears at top.</p><h3>Characteristics:</h3><ul><li>Long upper wick</li><li>Small lower body</li><li>After an uptrend</li></ul>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Shooting Star = bearish', 'Needs confirmation', 'Long upper wick key'], order: 5 },
      { title: 'Engulfing Pattern', description: 'Strong reversal pattern - bullish and bearish.', icon: '🔄', content: '<p>Engulfing is a two-candle pattern where second candle completely engulfs first.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Engulfing = strong reversal', 'Bullish = down then up', 'Bearish = up then down'], order: 6 },
      { title: 'Support & Resistance', description: 'Key levels where price reverses.', icon: '🎯', content: '<p>Support = level where buying interest > selling. Resistance = where selling > buying.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Support = buying zone', 'Resistance = selling zone', 'Roles can reverse'], order: 7 },
      { title: 'Trend Lines', description: 'Drawing trend lines to identify trends.', icon: '📐', content: '<p>Trend lines connect swing lows (uptrend) or swing highs (downtrend).', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Uptrend = higher highs/lows', 'Downtrend = lower highs/lows', 'Break = trend change'], order: 8 },
      { title: 'Moving Averages', description: 'SMA, EMA and their uses.', icon: '📊', content: '<p>Moving averages smooth price data and show trend direction.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['SMA = simple average', 'EMA = weighted average', 'Use as dynamic support'], order: 9 },
      { title: 'Chart Timeframes', description: 'Understanding different chart timeframes.', icon: '⏰', content: '<p>Choose timeframe based on your trading style.', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Lower TF = more signals', 'Higher TF = stronger signals', 'Use multiple TFs'], order: 10 }
    ];

    // Add more topics for remaining categories
    const moreTopics = [];
    for (let i = 1; i <= 10; i++) {
      moreTopics.push({ title: `Option Greek: ${['Delta', 'Gamma', 'Theta', 'Vega', 'Rho', 'Gamma Squeeze', 'Delta Neutral', 'Volatility Smile', 'Implied Volatility', 'Historical Volatility'][i-1]}`, description: `Learn about ${['Delta', 'Gamma', 'Theta', 'Vega', 'Rho', 'Gamma Squeeze', 'Delta Neutral', 'Volatility Smile', 'Implied Volatility', 'Historical Volatility'][i-1]} in detail.`, icon: '📈', content: '<p>Detailed content goes here.</p>', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', examples: [], keyTakeaways: ['Important concept'], order: i });
    }

    // Combine all topics
    const categoryTopicsMap = {
      [createdCategories[0]._id]: optionsBasicsTopics,
      [createdCategories[1]._id]: chartsCandlesTopics,
      [createdCategories[2]._id]: moreTopics
    };

    for (let i = 3; i < createdCategories.length; i++) {
      const catTopics = [];
      for (let j = 1; j <= 8; j++) {
        catTopics.push({
          title: `${createdCategories[i].name} - Topic ${j}`,
          description: `Learn about topic ${j} in ${createdCategories[i].name}`,
          icon: '📖',
          content: '<p>Comprehensive educational content goes here.</p>',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          examples: [],
          keyTakeaways: ['Complete this topic'],
          order: j
        });
      }
      categoryTopicsMap[createdCategories[i]._id] = catTopics;
    }

    // Insert all topics
    const topicsToInsert = [];
    for (const [catId, topics] of Object.entries(categoryTopicsMap)) {
      for (const topic of topics) {
        topicsToInsert.push({ ...topic, category: catId });
      }
    }

    const createdTopics = await Topic.insertMany(topicsToInsert);
    console.log(`✅ Created ${createdTopics.length} topics`);

    // Create quiz questions
    const quizzes = [];
    let qid = 1;
    for (let i = 0; i < 10; i++) { // 10 categories
      const catId = createdCategories[i]._id;
      for (let j = 1; j <= 10; j++) { // 10 questions per category
        quizzes.push({
          title: `${createdCategories[i].name} Q${j}`,
          question: `${createdCategories[i].name} Quiz Question ${j}: What is the most important concept in this category?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 1,
          category: createdCategories[i].name,
          difficulty: ['Easy', 'Medium', 'Hard'][j % 3],
          explanation: 'Explanation for correct answer goes here.'
        });
        qid++;
      }
    }
    // Add more to reach 100+ quizzes
    for (let i = 0; i < 20; i++) {
      quizzes.push({
        title: `General Trading Q${i+1}`,
        question: `General Trading Question ${i+1}: What is the key to consistent profits?`,
        options: ['Luck', 'Risk Management', 'Gambling', 'Holding'],
        correctAnswer: 1,
        category: 'General',
        difficulty: 'Medium',
        explanation: 'Risk management is the most important factor for long-term success.'
      });
    }

    const createdQuizzes = await Quiz.insertMany(quizzes);
    console.log(`✅ Created ${createdQuizzes.length} quiz questions`);

    // Create achievements
    const achievements = [
      { name: 'Beginner Trader', description: 'Complete your first topic', icon: '🎓', pointsRequired: 10, order: 1 },
      { name: 'Options Explorer', description: 'Complete all Options Basics topics', icon: '🎯', pointsRequired: 100, order: 2 },
      { name: 'Chart Master', description: 'Complete Charts & Candles category', icon: '📊', pointsRequired: 80, order: 3 },
      { name: 'Risk Manager', description: 'Complete Risk Management category', icon: '🛡️', pointsRequired: 150, order: 4 },
      { name: 'Quiz Champion', description: 'Score 80%+ on 5 category quizzes', icon: '🏆', pointsRequired: 200, order: 5 },
      { name: 'Trading Expert', description: 'Complete 5 categories', icon: '💎', pointsRequired: 300, order: 6 },
      { name: 'Psychology Pro', description: 'Complete Trading Psychology category', icon: '🧠', pointsRequired: 120, order: 7 },
      { name: 'Swing Trader', description: 'Complete Swing Trading category', icon: '📅', pointsRequired: 180, order: 8 },
      { name: 'Day Trader', description: 'Complete Intraday Trading category', icon: '🕒', pointsRequired: 250, order: 9 },
      { name: 'Bull Boom Pro', description: 'Complete all 10 categories', icon: '🚀', pointsRequired: 500, order: 10 }
    ];
    const createdAchievements = await Achievement.insertMany(achievements);
    console.log(`✅ Created ${createdAchievements.length} achievements`);

    console.log('🎉 Seed complete!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedEducationData();
