import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports!
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import authRoutes from './src/routes/authRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import watchlistRoutes from './src/routes/watchlistRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import positionRoutes from './src/routes/positionRoutes.js';
import educationRoutes from './src/routes/educationRoutes.js';
import CourseCategory from './src/models/CourseCategory.model.js';
import Topic from './src/models/Topic.model.js';
import Quiz from './src/models/Quiz.model.js';
import Achievement from './src/models/Achievement.model.js';

// Auto-seed learning data if database is empty
const autoSeedLearningData = async () => {
  try {
    const categoryCount = await CourseCategory.countDocuments();
    
    if (categoryCount === 0) {
      console.log('🌱 No learning data found, auto-seeding database...');
      
      // --- Create Categories ---
      const categoriesData = [
        {
          name: 'Options Basics',
          description: 'Learn the fundamentals of options trading, including calls, puts, strike prices, and premiums.',
          icon: '🎯',
          difficulty: 'Beginner',
          estimatedHours: 8,
          order: 1
        },
        {
          name: 'Charts & Candles',
          description: 'Master technical analysis with candlestick patterns, chart types, and price action strategies.',
          icon: '📊',
          difficulty: 'Beginner',
          estimatedHours: 6,
          order: 2
        },
        {
          name: 'Option Greeks',
          description: 'Understand Delta, Gamma, Theta, Vega, and Rho—the Greeks that drive option pricing.',
          icon: '📈',
          difficulty: 'Intermediate',
          estimatedHours: 10,
          order: 3
        },
        {
          name: 'Open Interest',
          description: 'Learn how to analyze open interest and volume to predict market movements.',
          icon: '📉',
          difficulty: 'Intermediate',
          estimatedHours: 5,
          order: 4
        },
        {
          name: 'Trading Strategies',
          description: 'Discover advanced options strategies like straddles, strangles, and iron condors.',
          icon: '⚡',
          difficulty: 'Advanced',
          estimatedHours: 12,
          order: 5
        },
        {
          name: 'Risk Management',
          description: 'Protect your capital with position sizing, stop losses, and risk-reward analysis.',
          icon: '🛡️',
          difficulty: 'Beginner',
          estimatedHours: 7,
          order: 6
        },
        {
          name: 'Trading Psychology',
          description: 'Master your emotions, develop discipline, and build a winning trading mindset.',
          icon: '🧠',
          difficulty: 'Intermediate',
          estimatedHours: 6,
          order: 7
        },
        {
          name: 'Swing Trading',
          description: 'Learn swing trading techniques to profit from medium-term market trends.',
          icon: '📅',
          difficulty: 'Intermediate',
          estimatedHours: 8,
          order: 8
        },
        {
          name: 'Intraday Trading',
          description: 'Master day trading strategies including scalping, momentum, and VWAP-based trades.',
          icon: '🕒',
          difficulty: 'Advanced',
          estimatedHours: 10,
          order: 9
        },
        {
          name: 'Futures & Options',
          description: 'Complete guide to futures and options trading from basics to advanced strategies.',
          icon: '💰',
          difficulty: 'Advanced',
          estimatedHours: 15,
          order: 10
        }
      ];

      const createdCategories = await CourseCategory.insertMany(categoriesData);
      console.log(`✅ Created ${createdCategories.length} categories`);

      // --- Create Topics ---
      const topicsData = [];
      // Options Basics topics
      topicsData.push(
        { category: createdCategories[0]._id, title: 'What are Options?', description: 'An introduction to options contracts and how they work.', icon: '📚', content: `<p>Options are financial derivatives that give buyers the right, but not the obligation, to buy or sell an underlying asset at a specified price on or before a specified date.</p><h3>Key Concepts:</h3><ul><li><strong>Right, not Obligation:</strong> Buyers can choose to exercise or let the option expire</li><li><strong>Underlying Asset:</strong> Stocks, indices, commodities, etc.</li><li><strong>Strike Price:</strong> The agreed price for buying/selling</li><li><strong>Expiry Date:</strong> The last day the option is valid</li></ul>`, keyTakeaways: ['Options give rights, not obligations', 'Calls = right to buy, Puts = right to sell', 'Every option has a limited lifespan'], examples: [{ title: 'Everyday Analogy', description: 'Think of an option like a rain check at a store: you pay a small fee to lock in a price, but you can choose not to use it.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '10 min', order: 1 },
        { category: createdCategories[0]._id, title: 'Call Option', description: 'Everything you need to know about call options.', icon: '📈', content: `<p>A call option is a contract that gives the buyer the right to buy an underlying asset at a predetermined strike price before expiration.</p><h3>How Call Options Work:</h3><ul><li>Buyer pays a premium upfront</li><li>Profits when the underlying price rises above strike + premium</li><li>Maximum loss is the premium paid</li><li>Seller has potentially unlimited loss</li></ul>`, keyTakeaways: ['Calls profit from upward price movements', 'Buyer risk limited to premium', 'Seller has theoretically unlimited risk'], examples: [{ title: 'Reliance Call Example', description: 'Buy Reliance 2500 Call at ₹50. Profit starts when Reliance crosses ₹2550.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12 min', order: 2 },
        { category: createdCategories[0]._id, title: 'Put Option', description: 'Complete guide to put options.', icon: '📉', content: `<p>A put option is a contract that gives the buyer the right to sell an underlying asset at a predetermined strike price before expiration.</p><h3>How Put Options Work:</h3><ul><li>Buyer pays a premium upfront</li><li>Profits when underlying price falls below strike - premium</li><li>Maximum loss is the premium paid</li><li>Often used for hedging existing positions</li></ul>`, keyTakeaways: ['Puts profit from downward price movements', 'Great for hedging long positions', 'Buyer risk limited to premium'], examples: [{ title: 'Hedging with Puts', description: 'If you own 100 shares of a stock, buy a put to protect against a price drop.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12 min', order: 3 },
        { category: createdCategories[0]._id, title: 'Strike Price', description: 'Learn how to choose the right strike price.', icon: '🎯', content: `<p>The strike price is the fixed price at which the option holder can buy (call) or sell (put) the underlying asset.</p><h3>Types of Strikes:</h3><ul><li><strong>ITM (In the Money):</strong> Call - Strike < Price, Put - Strike > Price</li><li><strong>ATM (At the Money):</strong> Strike ≈ Price</li><li><strong>OTM (Out of the Money):</strong> Call - Strike > Price, Put - Strike < Price</li></ul>`, keyTakeaways: ['ITM options have intrinsic value', 'ATM options have highest time value', 'OTM options are cheaper but riskier'], examples: [{ title: 'Strike Selection', description: 'Aggressive traders buy OTM strikes, conservative traders buy ITM strikes.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '8 min', order: 4 },
        { category: createdCategories[0]._id, title: 'Premium', description: 'Understand option premium components.', icon: '💵', content: `<p>Option premium is the price you pay for an option. It has two main components: intrinsic value and time value.</p><h3>Premium Components:</h3><ul><li><strong>Intrinsic Value:</strong> Real, tangible value if option is ITM</li><li><strong>Time Value:</strong> Value of time remaining until expiry</li><li><strong>Volatility:</strong> Implied volatility impacts time value</li></ul>`, keyTakeaways: ['Premium = Intrinsic + Time', 'Time value decays exponentially near expiry', 'Higher volatility = higher premium'], examples: [{ title: 'Premium Breakdown', description: 'A 2500 Call at ₹80 with spot at 2550: ₹50 intrinsic, ₹30 time value.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '9 min', order: 5 },
        { category: createdCategories[0]._id, title: 'Expiry', description: 'Learn about option expiry dates.', icon: '📅', content: `<p>Option expiry is the last day an option can be traded or exercised. After expiry, OTM options become worthless.</p><h3>Expiry Cycles:</h3><ul><li><strong>Weekly:</strong> Expire on Thursdays (Nifty/BankNifty)</li><li><strong>Monthly:</strong> Expire on last Thursday of the month</li><li><strong>Quarterly:</strong> Expire on last Thursday of quarter</li></ul>`, keyTakeaways: ['Time value decays faster near expiry', 'Expiry day has high volatility', 'Roll over to next month if needed'], examples: [{ title: 'Rolling Over', description: 'If an option is near expiry and you want to keep your position, sell current and buy next month option.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '7 min', order: 6 },
        { category: createdCategories[0]._id, title: 'Margin', description: 'Margin requirements for option sellers.', icon: '🔒', content: `<p>Option buyers pay full premium upfront. Option sellers need to deposit margin as collateral to cover potential losses.</p><h3>Margin Types:</h3><ul><li><strong>SPAN Margin:</strong> Standard Portfolio Analysis of Risk</li><li><strong>Exposure Margin:</strong> Additional margin over SPAN</li><li><strong>Margin Changes:</strong> Increases with volatility and near expiry</li></ul>`, keyTakeaways: ['Buyers: No margin needed', 'Sellers: Must deposit margin', 'Margin can change daily'], examples: [{ title: 'Margin Calculation', description: 'Selling an Nifty ATM call may require around ₹1,50,000 - ₹2,00,000 margin.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '11 min', order: 7 }
      );
      // Charts & Candles topics
      topicsData.push(
        { category: createdCategories[1]._id, title: 'Candlestick Basics', description: 'Learn to read and interpret candlestick charts.', icon: '🕯️', content: `<p>Candlesticks are the most popular way to visualize price action. Each candle shows open, high, low, and close prices for a period.</p><h3>Candle Anatomy:</h3><ul><li><strong>Body:</strong> Range between open and close</li><li><strong>Upper Wick:</strong> High of the period</li><li><strong>Lower Wick:</strong> Low of the period</li><li><strong>Green/White:</strong> Close > Open (bullish)</li><li><strong>Red/Black:</strong> Close < Open (bearish)</li></ul>`, keyTakeaways: ['Long wicks show rejection of price levels', 'Long bodies show strong momentum', 'Candles should be analyzed in context'], examples: [{ title: 'Reading a Candle', description: 'A long green candle with small wicks shows strong buying pressure throughout the period.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12 min', order: 1 },
        { category: createdCategories[1]._id, title: 'Doji', description: 'The powerful reversal pattern.', icon: '⚠️', content: `<p>A Doji has open and close prices at the same level, showing indecision between buyers and sellers.</p><h3>What Doji Means:</h3><ul><li>Complete indecision in the market</li><li>Often signals a potential reversal</li><li>Needs confirmation from next candle</li><li>Variations: Gravestone, Dragonfly, Long-legged</li></ul>`, keyTakeaways: ['Doji = indecision', 'Appears at tops, bottoms, and decision points', 'Confirmation required'], examples: [{ title: 'Evening Star with Doji', description: 'A Doji at the top of an uptrend can signal exhaustion.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '8 min', order: 2 },
        { category: createdCategories[1]._id, title: 'Hammer', description: 'The bullish reversal pattern.', icon: '🔨', content: `<p>A Hammer appears at bottoms and has a small body at the top with a long lower wick.</p><h3>Hammer Conditions:</h3><ul><li>Appears after a downtrend</li><li>Small body at upper end of range</li><li>Lower wick at least 2x body length</li><li>Upper wick very small or nonexistent</li></ul>`, keyTakeaways: ['Hammer = bullish reversal', 'Long lower wick shows buying pressure', 'Confirmation candle needed'], examples: [{ title: 'Market Bottom', description: 'After a sharp drop, a Hammer shows buyers are stepping in.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '9 min', order: 3 },
        { category: createdCategories[1]._id, title: 'Shooting Star', description: 'The bearish reversal pattern.', icon: '⭐', content: `<p>A Shooting Star appears at tops and has a small body at the bottom with a long upper wick.</p><h3>Shooting Star Conditions:</h3><ul><li>Appears after an uptrend</li><li>Small body at lower end of range</li><li>Upper wick at least 2x body length</li><li>Lower wick very small or nonexistent</li></ul>`, keyTakeaways: ['Shooting Star = bearish reversal', 'Long upper wick shows selling pressure', 'Confirmation candle needed'], examples: [{ title: 'Market Top', description: 'After a strong rally, a Shooting Star shows sellers are taking over.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '9 min', order: 4 },
        { category: createdCategories[1]._id, title: 'Engulfing Pattern', description: 'The two-candle reversal pattern.', icon: '🔄', content: `<p>An Engulfing pattern is two candles where the second candle completely covers the body of the first.</p><h3>Types:</h3><ul><li><strong>Bullish Engulfing:</strong> After downtrend, big green candle covers red candle</li><li><strong>Bearish Engulfing:</strong> After uptrend, big red candle covers green candle</li></ul>`, keyTakeaways: ['Engulfing = strong reversal signal', 'Bigger engulf = stronger signal', 'Look at volume too'], examples: [{ title: 'Strong Reversal', description: 'A Bearish Engulfing with high volume is a powerful signal to sell.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '10 min', order: 5 },
        { category: createdCategories[1]._id, title: 'Morning Star', description: 'The three-candle bullish pattern.', icon: '🌟', content: `<p>The Morning Star is a three-candle bullish reversal pattern that signals the end of a downtrend.</p><h3>Morning Star Components:</h3><ol><li>Long red candle (downward momentum)</li><li>Small body candle (indecision)</li><li>Long green candle (bullish momentum)</li></ol>`, keyTakeaways: ['Very reliable bullish signal', 'Three candles complete the pattern', 'Volume on third candle confirms'], examples: [{ title: 'Reversal Signal', description: 'The Morning Star appeared at the March 2020 lows for many stocks.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '11 min', order: 6 }
      );
      // Option Greeks topics
      topicsData.push(
        { category: createdCategories[2]._id, title: 'Delta', description: 'Learn how Delta affects your options.', icon: '📐', content: `<p>Delta measures how much an option's price changes for a ₹1 change in the underlying asset.</p><h3>Delta Values:</h3><ul><li>Call: 0 to +1 (0.5 ATM)</li><li>Put: -1 to 0 (-0.5 ATM)</li><li>Deep ITM: near ±1</li><li>Deep OTM: near 0</li></ul>`, keyTakeaways: ['Delta ≈ probability of expiring ITM', 'ITM options have higher delta', 'Delta changes as price changes'], examples: [{ title: 'Delta Example', description: 'Call with 0.5 delta: If underlying rises by ₹1, option premium rises by ~₹0.5.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15 min', order: 1 },
        { category: createdCategories[2]._id, title: 'Gamma', description: 'Understand Gamma, the rate of change of Delta.', icon: '📐', content: `<p>Gamma measures how much Delta changes for a ₹1 change in the underlying asset. It represents acceleration.</p><h3>Gamma Characteristics:</h3><ul><li>Highest at ATM options</li><li>Increases as expiration approaches</li><li>Positive for long options, negative for short</li></ul>`, keyTakeaways: ['Gamma = sensitivity of delta', 'Gamma increases near expiry', 'Gamma squeezes are real!'], examples: [{ title: 'Gamma in Action', description: 'A big move near expiry can create rapid delta changes (gamma squeeze).' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '14 min', order: 2 },
        { category: createdCategories[2]._id, title: 'Theta', description: 'Time decay - the silent killer.', icon: '⏳', content: `<p>Theta measures how much an option's price decays each day due to time passing.</p><h3>Theta Decay:</h3><ul><li>Negative for long options (losing value daily)</li><li>Positive for short options (gaining value daily)</li><li>Decay accelerates near expiry</li></ul>`, keyTakeaways: ['Time decay is exponential near expiry', 'ATM options lose value fastest', 'Theta is why options are "wasting assets"'], examples: [{ title: 'Theta Impact', description: 'An ATM option with 30 days left might lose ₹5/day, but with 3 days left it could lose ₹50/day!' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '13 min', order: 3 },
        { category: createdCategories[2]._id, title: 'Vega', description: 'Volatility sensitivity.', icon: '🌊', content: `<p>Vega measures how much an option's price changes for a 1% change in implied volatility.</p><h3>Vega Characteristics:</h3><ul><li>Highest for ATM options</li><li>Higher for longer-dated options</li><li>Positive for long options</li></ul>`, keyTakeaways: ['Vega = volatility sensitivity', 'Long options love volatility', 'Vega decreases closer to expiry'], examples: [{ title: 'Vega Example', description: 'A vega of 15 means 1% IV increase adds ₹15 to premium.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12 min', order: 4 },
        { category: createdCategories[2]._id, title: 'Rho', description: 'Interest rate sensitivity.', icon: '🏦', content: `<p>Rho measures how much an option's price changes for a 1% change in interest rates.</p><h3>Rho Characteristics:</h3><ul><li>Positive for calls, negative for puts</li><li>Small impact compared to other Greeks</li><li>More impact for longer-dated options</li></ul>`, keyTakeaways: ['Rho least important for most traders', 'Higher rates help calls, hurt puts', 'Mainly affects LEAPs/long-term options'], examples: [{ title: 'Rho Example', description: 'If interest rates rise by 1%, a LEAP might gain ₹10.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '10 min', order: 5 }
      );
      // Open Interest topics
      topicsData.push(
        { category: createdCategories[3]._id, title: 'OI Basics', description: 'Introduction to Open Interest.', icon: '📊', content: `<p>Open Interest (OI) is the total number of outstanding option contracts that have not been settled.</p><h3>Key Points:</h3><ul><li>One buyer + one seller = +1 OI</li><li>Closing a position reduces OI</li><li>OI shows liquidity and conviction</li><li>Combine with price for better signals</li></ul>`, keyTakeaways: ['OI ≠ Volume', 'Increasing OI = new money coming in', 'Use with price action'], examples: [{ title: 'Build Up', description: 'Price up + OI up = bullish, Price down + OI up = bearish' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '12 min', order: 1 },
        { category: createdCategories[3]._id, title: 'Long Build Up', description: 'Identify bullish positions.', icon: '📈', content: `<p>Long Build Up: Price rising + OI rising = new longs are being created.</p><h3>Characteristics:</h3><ul><li>Sustained price move up</li><li>OI steadily increasing</li><li>Good volume confirmation</li><li>Often seen in strong trends</li></ul>`, keyTakeaways: ['Long build up = bullish conviction', 'Look at strike levels where OI builds', 'Great for trend following'], examples: [{ title: 'Strong Trend', description: 'Nifty rallies 300 points while OI increases by 20% = long build up.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '9 min', order: 2 },
        { category: createdCategories[3]._id, title: 'Short Build Up', description: 'Identify bearish positions.', icon: '📉', content: `<p>Short Build Up: Price falling + OI rising = new shorts are being created.</p><h3>Characteristics:</h3><ul><li>Sustained price move down</li><li>OI steadily increasing</li><li>Good volume confirmation</li><li>Often seen in breakdowns</li></ul>`, keyTakeaways: ['Short build up = bearish conviction', 'Look at which strike levels get OI', 'Watch for covering later'], examples: [{ title: 'Breakdown', description: 'Stock falls 5% on high volume and rising OI = short build up.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '9 min', order: 3 },
        { category: createdCategories[3]._id, title: 'Long Unwinding', description: 'Longs taking profits.', icon: '📉', content: `<p>Long Unwinding: Price falling + OI falling = Longs are booking profits.</p><h3>What it Means:</h3><ul><li>Traders exiting long positions</li><li>Price might retrace but trend could resume</li><li>Good time to take partial profits</li><li>Check if it's just profit booking or reversal</li></ul>`, keyTakeaways: ['Long unwinding = profit booking', 'Can be just a pullback', 'Look for price to find support'], examples: [{ title: 'Profit Taking', description: 'After a 300-point rally, Nifty falls 100 points with OI decreasing.' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '8 min', order: 4 },
        { category: createdCategories[3]._id, title: 'Short Covering', description: 'Shorts getting squeezed.', icon: '📈', content: `<p>Short Covering: Price rising + OI falling = Shorts are getting squeezed.</p><h3>Short Squeeze:</h3><ul><li>Short sellers rush to buy back</li><li>Can create sharp, fast rallies</li><li>Often violent moves</li><li>Great for aggressive traders</li></ul>`, keyTakeaways: ['Short covering = sharp rallies', 'Squeezes can happen quickly', 'Perfect for momentum traders'], examples: [{ title: 'Squeeze', description: 'Stock rises 10% in a day with falling OI = massive short squeeze!' }], videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '10 min', order: 5 }
      );
      const remainingCategoryTopics = [
        [
          { title: 'Straddle', description: 'Play volatility with straddles.', keyTakeaways: ['Buy both call & put at same strike', 'Profit from big move in either direction', 'Needs volatility to work'], duration: '15 min', order: 1 },
          { title: 'Strangle', description: 'Lower cost volatility strategy.', keyTakeaways: ['Buy OTM call & put', 'Lower cost than straddle', 'Needs bigger move'], duration: '14 min', order: 2 },
          { title: 'Iron Condor', description: 'Market neutral strategy.', keyTakeaways: ['Sell OTM spreads on both sides', 'Defined risk/reward', 'Best in sideways market'], duration: '18 min', order: 3 },
          { title: 'Bull Call Spread', description: 'Limited risk bullish spread.', keyTakeaways: ['Buy lower strike call, sell higher', 'Limited profit, limited risk', 'Great for moderate bullishness'], duration: '13 min', order: 4 },
          { title: 'Bear Put Spread', description: 'Limited risk bearish spread.', keyTakeaways: ['Buy higher strike put, sell lower', 'Limited profit, limited risk', 'Great for moderate bearishness'], duration: '13 min', order: 5 },
          { title: 'Covered Call', description: 'Income from your long position.', keyTakeaways: ['Sell call against long stock', 'Generate monthly income', 'Limited upside'], duration: '12 min', order: 6 }
        ],
        [
          { title: 'Position Sizing', description: 'How much to risk per trade.', keyTakeaways: ['1-2% risk per trade standard', 'Never risk too much on one trade', 'Position size = function of stop loss'], duration: '14 min', order: 1 },
          { title: 'Stop Loss', description: 'Your insurance against big losses.', keyTakeaways: ['ALWAYS use a stop loss', 'Place stop at logical levels', 'Trailing stops protect profits'], duration: '13 min', order: 2 },
          { title: 'Risk Reward Ratio', description: 'Ensure your risk justifies reward.', keyTakeaways: ['Look for at least 1:2 R:R', 'Let winners run, cut losers short', 'Probabilities matter over time'], duration: '11 min', order: 3 },
          { title: 'Capital Protection', description: 'Preserve your capital at all costs.', keyTakeaways: ['Capital preservation first', 'You can trade another day', 'Avoid blow-up risks'], duration: '12 min', order: 4 },
          { title: 'Hedging', description: 'Protect your portfolio.', keyTakeaways: ['Hedge during uncertain times', 'Puts are like insurance', 'Can hedge with options or futures'], duration: '15 min', order: 5 }
        ],
        [
          { title: 'Discipline', description: 'The most important skill.', keyTakeaways: ['Follow your trading plan', 'Avoid impulsive decisions', 'Discipline beats talent'], duration: '12 min', order: 1 },
          { title: 'Emotional Control', description: 'Don\'t let emotions decide.', keyTakeaways: ['Fear and greed are traders\' enemies', 'Stay calm and objective', 'Step back when emotional'], duration: '14 min', order: 2 },
          { title: 'Fear and Greed', description: 'Recognize these emotions.', keyTakeaways: ['Fear misses opportunities', 'Greed stays in too long', 'Be aware of market sentiment'], duration: '11 min', order: 3 },
          { title: 'Revenge Trading', description: 'The most expensive mistake.', keyTakeaways: ['Revenge trading = disaster', 'Take a break after a loss', 'Losses are normal'], duration: '13 min', order: 4 },
          { title: 'Trading Journal', description: 'Track, review, improve.', keyTakeaways: ['Track every trade', 'Review monthly', 'Find your strengths/weaknesses'], duration: '10 min', order: 5 }
        ],
        [
          { title: 'Trend Analysis', description: 'Identify the trend first.', keyTakeaways: ['Trend is your friend', 'Higher highs/higher lows = up', 'Use moving averages'], duration: '14 min', order: 1 },
          { title: 'Swing Entry', description: 'Enter at the right time.', keyTakeaways: ['Wait for pullbacks', 'Buy on dips in uptrend', 'Look for confirmation'], duration: '13 min', order: 2 },
          { title: 'Swing Exit', description: 'Take profits at the right time.', keyTakeaways: ['Target previous resistance/support', 'Trailing stop works well', 'Book partial profits'], duration: '11 min', order: 3 },
          { title: 'Breakout Trading', description: 'Trade when levels break.', keyTakeaways: ['Breakouts from ranges work', 'Volume confirms breakouts', 'False breakouts happen'], duration: '12 min', order: 4 },
          { title: 'Pullback Trading', description: 'Buy the dip in trend.', keyTakeaways: ['Pullbacks are opportunities', 'Let trend pull back then enter', 'Wait for confirmation'], duration: '13 min', order: 5 }
        ],
        [
          { title: 'Scalping', description: 'Quick in and out trades.', keyTakeaways: ['Hold for minutes to hours', 'Lots of trades, small profits', 'Needs tight spreads'], duration: '13 min', order: 1 },
          { title: 'Momentum Trading', description: 'Go with the flow.', keyTakeaways: ['Buy strength, sell weakness', 'Momentum can persist', 'Don\'t fight the trend'], duration: '12 min', order: 2 },
          { title: 'VWAP', description: 'Volume Weighted Average Price.', keyTakeaways: ['VWAP = institutional benchmark', 'Above VWAP = bullish', 'Great support/resistance'], duration: '15 min', order: 3 },
          { title: 'ORB Strategy', description: 'Opening Range Breakout.', keyTakeaways: ['First 15-30 minute range', 'Breakout = direction for day', 'Classic intraday strategy'], duration: '14 min', order: 4 },
          { title: 'Volume Analysis', description: 'Read what volume tells you.', keyTakeaways: ['Volume confirms moves', 'Volume precedes price', 'Study volume patterns'], duration: '12 min', order: 5 }
        ],
        [
          { title: 'Futures Basics', description: 'Introduction to futures.', keyTakeaways: ['Futures = obligation, not right', 'Standardized contracts', 'Daily settlement'], duration: '14 min', order: 1 },
          { title: 'Lot Size', description: 'Understand contract sizes.', keyTakeaways: ['Lot sizes vary by underlying', 'Nifty = 50, BankNifty = 25', 'Know your position size'], duration: '9 min', order: 2 },
          { title: 'Margin Requirements', description: 'Margin for futures trading.', keyTakeaways: ['SPAN and exposure margin', 'Futures have higher margin than options', 'Margin changes daily'], duration: '12 min', order: 3 },
          { title: 'Futures Hedging', description: 'Hedge with futures.', keyTakeaways: ['Perfect hedge for long/short', 'Use futures for large positions', 'Roll over expiring futures'], duration: '13 min', order: 4 },
          { title: 'Futures Strategies', description: 'Futures trading strategies.', keyTakeaways: ['Futures for pure direction', 'Spread trading with futures', 'Calendar spreads'], duration: '15 min', order: 5 }
        ]
      ];
      for (let i = 0; i < remainingCategoryTopics.length; i++) {
        const categoryIndex = i + 4;
        remainingCategoryTopics[i].forEach((topic, j) => {
          topicsData.push({
            category: createdCategories[categoryIndex]._id,
            title: topic.title,
            description: topic.description || `Learn about ${topic.title} in trading.`,
            icon: '📖',
            content: `<p>Welcome to this lesson on ${topic.title}. This topic covers important concepts for your trading education.</p><h3>Key Content:</h3><ul><li>Core concepts explained</li><li>Practical examples included</li><li>Strategies to apply in markets</li><li>Risk management considerations</li></ul>`,
            keyTakeaways: topic.keyTakeaways || ['Master this topic', 'Practice on demo first', 'Risk management is key'],
            examples: [{ title: `${topic.title} Example`, description: 'Apply these concepts in live markets carefully.' }],
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            duration: topic.duration,
            order: topic.order
          });
        });
      }
      await Topic.insertMany(topicsData);

      // --- Create Achievements ---
      const achievementsData = [
        { name: 'Beginner Trader', description: 'Complete your first learning topic!', icon: '📚', pointsRequired: 10, order: 1 },
        { name: 'Options Explorer', description: 'Finish all Options Basics topics.', icon: '🎯', pointsRequired: 70, order: 2 },
        { name: 'Quiz Champion', description: 'Score 80%+ on any category quiz.', icon: '🏆', pointsRequired: 100, order: 3 },
        { name: 'Consistency Master', description: 'Complete topics 5 days in a row.', icon: '🔥', pointsRequired: 50, order: 4 },
        { name: 'Risk Manager', description: 'Finish all Risk Management topics.', icon: '🛡️', pointsRequired: 50, order: 5 },
        { name: 'Technical Analyst', description: 'Master Charts & Candles.', icon: '📊', pointsRequired: 60, order: 6 },
        { name: 'Psychology Expert', description: 'Complete Trading Psychology.', icon: '🧠', pointsRequired: 50, order: 7 },
        { name: 'Swing Trader', description: 'Finish Swing Trading module.', icon: '📅', pointsRequired: 50, order: 8 },
        { name: 'Intraday Expert', description: 'Master Intraday Trading.', icon: '🕒', pointsRequired: 50, order: 9 },
        { name: 'Bull Boom Legend', description: 'Complete ALL topics! You are a legend.', icon: '🚀', pointsRequired: 500, order: 10 }
      ];

      await Achievement.insertMany(achievementsData);

      console.log('✅ Auto-seeding complete!');
    } else {
      console.log('📚 Learning data already present, skipping auto-seed.');
    }
  } catch (error) {
    console.error('❌ Auto-seeding error:', error);
  }
};

console.log("ENV CHECK");
console.log(process.env.EMAIL_USER);
console.log(process.env.EMAIL_PASS ? "PASS FOUND" : "PASS NOT FOUND");
console.log("Cloudinary Config Check:", process.env.CLOUDINARY_CLOUD_NAME ? "Cloud Name Found" : "Cloud Name Missing");
const app = express();

// Middleware
app.use(helmet()); // Add security headers
app.use(morgan('dev')); // Log HTTP requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookies

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bull Boom Backend Running',
  });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// User Routes
app.use('/api/user', userRoutes);

// Watchlist Routes
app.use('/api/watchlist', watchlistRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Position Routes
app.use('/api/positions', positionRoutes);

// Education Routes
app.use('/api/education', educationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route Not Found',
  });
});

// Graceful shutdown function
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server and connect to DB
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();
    
    // Auto-seed learning data if needed
    await autoSeedLearningData();

    // Start Express server
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━');
      console.log('🚀 Bull Boom Server Started');
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 Port: ${PORT}`);
      console.log('🗄️ MongoDB Connected');
      console.log('━━━━━━━━━━━━━━━━━━');
    });

    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log('━━━━━━━━━━━━━━━━━━');
        console.log(`❌ Port ${PORT} is already occupied`);
        console.log('Please stop the existing process or change PORT in .env');
        console.log('━━━━━━━━━━━━━━━━━━');
      } else if (err.code === 'EACCES') {
        console.log('━━━━━━━━━━━━━━━━━━');
        console.log(`❌ Port ${PORT} requires elevated privileges`);
        console.log('Please run with appropriate permissions or change PORT');
        console.log('━━━━━━━━━━━━━━━━━━');
      } else {
        console.error('❌ Server error:', err);
      }
      gracefulShutdown('serverError');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    gracefulShutdown('startError');
  }
};

// Initialize the server
startServer();
