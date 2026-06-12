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
    console.log('🌱 Starting auto-seed process...');

    // --- Define all categories with data ---
    const allCategories = [
      // Category 1: Option Basics - keep exactly as original user content
      {
        name: 'Option Basics',
        description: 'Learn the fundamentals of options trading from beginner level.',
        icon: '🎯',
        difficulty: 'Beginner',
        estimatedHours: 5,
        order: 1,
        topics: [
          {
            title: 'What are Options?',
            description: 'Learn the fundamentals of options contracts, rights, obligations, and contract structure.',
            icon: '📚',
            content: `<h3>American vs. European Options</h3>
<ul>
  <li>American options allow exercise at any point up to the expiration date.</li>
  <li>European options can only be exercised at the exact moment of expiration.</li>
  <li>Most individual stock options are American-style.</li>
  <li>Most broad market index options (like SPX) are European-style.</li>
</ul>

<h3>Rights vs Obligations</h3>
<ul>
  <li>Option buyers pay a premium to obtain rights.</li>
  <li>Option buyers have no obligations; they choose whether to trade.</li>
  <li>Option sellers receive a premium and take on obligations.</li>
  <li>Sellers must fulfill the contract if the buyer decides to exercise.</li>
</ul>

<h3>Contract Size</h3>
<ul>
  <li>One standard equity option contract represents exactly 100 shares of stock.</li>
  <li>Premium prices are quoted per share, so multiply by 100 for the total cost.</li>
  <li>An option quoted at $2.00 actually costs $200 to purchase.</li>
  <li>All gains, losses, and risk calculations scale by this 100-share multiplier.</li>
</ul>`,
            keyTakeaways: [
              'Option buyers have rights, not obligations.',
              'Option sellers have obligations.',
              'American and European options differ by exercise timing.',
              'One standard contract controls 100 shares.'
            ],
            examples: [
              { title: 'Example 1', description: 'A trader purchases one call option with a premium of $2.00.' },
              { title: 'Example 2', description: 'Since one contract controls 100 shares, total cost becomes $200.' }
            ],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 1
          },
          {
            title: 'Call Options',
            description: 'Understand how traders use call options to profit from bullish market moves.',
            icon: '📈',
            content: `<h3>Buying Calls (Long Call)</h3>
<ul>
  <li>Traders buy calls when they have a bullish market outlook.</li>
  <li>It profits when the underlying stock price moves sharply upward.</li>
  <li>It offers a cheaper way to control shares without buying stock directly.</li>
  <li>It provides high leverage, magnifying percentage gains relative to the capital risked.</li>
</ul>

<h3>Breakeven Price</h3>
<ul>
  <li>Calculated as the Strike Price plus the Premium paid.</li>
  <li>If you buy a $50 strike call for $3, breakeven is $53.</li>
  <li>The stock must rise past this point at expiry to net a profit.</li>
  <li>Selling the option before expiry can yield profits below this line.</li>
</ul>

<h3>Maximum Risk</h3>
<ul>
  <li>The risk is strictly capped at the total premium paid plus commissions.</li>
  <li>You cannot lose more money than your initial trade entry cost.</li>
  <li>Maximum loss occurs if the stock finishes below the strike price at expiry.</li>
  <li>The option simply expires completely worthless, resulting in a 100% loss.</li>
</ul>`,
            keyTakeaways: [
              'Calls are bullish instruments.',
              'Risk is limited to premium paid.',
              'Upside potential increases with rising stock prices.',
              'Breakeven equals strike plus premium.'
            ],
            examples: [
              { title: 'Example 1', description: 'Buy a ₹100 strike call for ₹10 premium.' },
              { title: 'Example 2', description: 'Breakeven becomes ₹110.' }
            ],
            videoUrl: '',
            estimatedTime: '12 min',
            order: 2
          },
          {
            title: 'Put Options',
            description: 'Learn how put options help traders profit from falling markets and protect investments.',
            icon: '📉',
            content: `<h3>Puts vs. Short-Selling</h3>
<ul>
  <li>Buying puts has strictly capped risk (the premium paid).</li>
  <li>Shorting stock carries theoretically unlimited risk if the price spikes.</li>
  <li>Puts do not require borrowing shares from a broker.</li>
  <li>Puts do not incur daily stock borrowing fees or dividend obligations.</li>
</ul>

<h3>Flat Stock Movement Effect</h3>
<ul>
  <li>A stagnant stock price causes the put to lose value daily.</li>
  <li>This loss is caused by time decay (Theta) eating extrinsic value.</li>
  <li>Implied volatility drops can accelerate this value loss.</li>
  <li>Holding a flat option until expiry results in total loss of premium.</li>
</ul>

<h3>Married Puts (Insurance)</h3>
<ul>
  <li>A strategy combining buying 100 shares of stock and 1 put option.</li>
  <li>The put acts as an insurance policy against a severe market crash.</li>
  <li>It establishes a concrete price floor where you can sell your shares.</li>
  <li>It allows you to participate in upside gains while limiting maximum downside.</li>
</ul>`,
            keyTakeaways: [
              'Puts are bearish instruments.',
              'Risk remains limited.',
              'Useful for portfolio protection.',
              'Time decay affects profitability.'
            ],
            examples: [
              { title: 'Example', description: 'Buy 100 shares and one protective put option.' }
            ],
            videoUrl: '',
            estimatedTime: '12 min',
            order: 3
          },
          {
            title: 'Strike Price',
            description: 'Understand ITM, ATM and OTM options and how strike selection impacts risk and reward.',
            icon: '🎯',
            content: `<h3>ITM, ATM, and OTM Definitions</h3>
<ul>
  <li>In-the-Money (ITM): Calls have strikes below stock price; Puts have strikes above.</li>
  <li>At-the-Money (ATM): The strike price is identical to the current stock price.</li>
  <li>Out-of-the-Money (OTM): Calls have strikes above stock price; Puts have strikes below.</li>
  <li>ITM options hold intrinsic value, while OTM options consist purely of time value.</li>
</ul>

<h3>Strike Selection and Probability</h3>
<ul>
  <li>OTM strikes are cheap but have a lower probability of finishing profitable.</li>
  <li>ITM strikes are expensive but have a higher mathematical probability of success.</li>
  <li>Choosing further OTM increases leverage but decreases your win rate.</li>
  <li>Choosing deep ITM mimics owning the actual stock with less premium erosion.</li>
</ul>`,
            keyTakeaways: [
              'Strike selection impacts risk and reward.',
              'OTM = cheaper but riskier.',
              'ITM = expensive but safer.',
              'ATM tracks stock closely.'
            ],
            examples: [
              { title: 'Example', description: 'Stock trading at ₹100.<br>ITM Call = ₹90 Strike<br>ATM Call = ₹100 Strike<br>OTM Call = ₹110 Strike' }
            ],
            videoUrl: '',
            estimatedTime: '8 min',
            order: 4
          },
          {
            title: 'Premium',
            description: 'Learn how option pricing works and what factors affect premiums.',
            icon: '💵',
            content: `<h3>Intrinsic vs. Extrinsic Value</h3>
<ul>
  <li>Intrinsic value is the real, tangible value if exercised right now.</li>
  <li>Only In-the-Money (ITM) options possess intrinsic value.</li>
  <li>Extrinsic value represents time value and market volatility expectations.</li>
  <li>At expiration, all extrinsic value drops to zero.</li>
</ul>

<h3>Implied Volatility (IV) Impact</h3>
<ul>
  <li>IV measures the market's expectation of future price swings.</li>
  <li>Higher IV expands premiums, making options more expensive to buy.</li>
  <li>Lower IV deflates premiums, making options cheaper to buy.</li>
  <li>Buying options right before major events (like earnings) risks an IV crush.</li>
</ul>

<h3>Time Decay</h3>
<ul>
  <li>Theta represents the daily loss of an option's extrinsic value.</li>
  <li>Time decay is non-linear and accelerates as expiration approaches.</li>
  <li>The erosion becomes steepest during the final 30 to 45 days.</li>
  <li>Theta hurts option buyers but directly benefits option sellers.</li>
</ul>`,
            keyTakeaways: [
              'Premium contains intrinsic and extrinsic value.',
              'IV affects pricing significantly.',
              'Theta increases near expiry.',
              'Time decay is a major risk for buyers.'
            ],
            examples: [
              { title: 'Example', description: 'Option premium = ₹50<br>Intrinsic Value = ₹30<br>Extrinsic Value = ₹20' }
            ],
            videoUrl: '',
            estimatedTime: '9 min',
            order: 5
          },
          {
            title: 'Expiry',
            description: 'Understand option expiration and its impact on trading outcomes.',
            icon: '📅',
            content: `<h3>Holding ITM Through Expiry</h3>
<ul>
  <li>Brokers automatically exercise options that are ITM by $0.01 or more.</li>
  <li>Long calls will be converted into buying 100 shares of stock.</li>
  <li>Long puts will be converted into shorting 100 shares of stock.</li>
  <li>If your account lacks the cash or margin, the broker may force-close it early.</li>
</ul>

<h3>Expiration Cycles</h3>
<ul>
  <li>Weeklies expire every Friday, offering short-term, high-risk trading targets.</li>
  <li>Monthlies expire on the third Friday of the month and have the highest liquidity.</li>
  <li>LEAPS are long-term options with expiration dates spanning up to 1–3 years.</li>
  <li>Shorter cycles experience rapid time decay; longer cycles decay much slower.</li>
</ul>`,
            keyTakeaways: [
              'Expiry affects option value.',
              'Auto-exercise may occur.',
              'Shorter expiries decay faster.',
              'Longer expiries provide more time.'
            ],
            examples: [
              { title: 'Example', description: 'An ITM call option may automatically purchase 100 shares at expiry.' }
            ],
            videoUrl: '',
            estimatedTime: '7 min',
            order: 6
          },
          {
            title: 'Margin',
            description: 'Learn how margin requirements work for option buyers and sellers.',
            icon: '🔒',
            content: `<h3>Sellers vs. Buyers Margin</h3>
<ul>
  <li>Buyers have defined risk, so they only pay the initial premium cost.</li>
  <li>Sellers face undefined, potentially unlimited risk if the trade goes wrong.</li>
  <li>Brokers mandate a collateral deposit (margin) to cover potential selling losses.</li>
  <li>This margin fluctuates dynamically as the underlying stock price moves.</li>
</ul>

<h3>Margin Calls and Liquidation</h3>
<ul>
  <li>A margin call happens when account equity falls below maintenance requirements.</li>
  <li>Brokers demand you deposit cash immediately or close losing trades.</li>
  <li>If ignored, the broker will force-liquidate positions without your consent.</li>
  <li>Liquidation often occurs at worst-case market prices, locking in steep losses.</li>
</ul>`,
            keyTakeaways: [
              'Buyers have limited risk.',
              'Sellers require margin.',
              'Margin calls must be managed carefully.',
              'Proper risk management is essential.'
            ],
            examples: [
              { title: 'Example', description: 'A seller writing uncovered options may need additional margin when markets move against the position.' }
            ],
            videoUrl: '',
            estimatedTime: '11 min',
            order: 7
          }
        ]
      },
      // Category 2: Charts & Candles
      {
        name: 'Charts & Candles',
        description: 'Master technical analysis with candlestick patterns, chart types, and price action strategies.',
        icon: '📊',
        difficulty: 'Beginner',
        estimatedHours: 6,
        order: 2,
        topics: [
          {
            title: 'Candlestick Basics',
            description: 'Learn to read and interpret candlestick charts.',
            icon: '🕯️',
            content: '<ul><li>Every single candlestick maps out four critical price points: the open, high, low, and close.</li><li>The solid colored section is called the real body, which shows the distance between the open and close.</li><li>The thin lines sticking out of the top and bottom are called wicks, representing price extremes.</li><li>A green candle means the price closed higher than it opened, signaling a bullish session.</li><li>A red candle means the price closed lower than it opened, signaling a bearish session.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 1
          },
          {
            title: 'Doji',
            description: 'The powerful reversal pattern.',
            icon: '⚠️',
            content: '<ul><li>A Doji forms when a financial asset opens and closes at virtually the identical price level.</li><li>It looks like a cross or a plus sign because the real body is exceptionally thin.</li><li>This specific structure tells you that buyers and sellers are trapped in total indecision.</li><li>While it shows a pause, a Doji at the end of an extended trend warns of a potential reversal.</li><li>Traders never buy a Doji immediately; they always wait for the next candle to confirm direction.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 2
          },
          {
            title: 'Hammer',
            description: 'The bullish reversal pattern.',
            icon: '🔨',
            content: '<ul><li>A Hammer is a single-candle bullish reversal pattern that only forms at the bottom of a downtrend.</li><li>It features a small real body at the top and a very long lower wick extending downward.</li><li>The lower wick must be at least two to three times larger than the size of the body.</li><li>It proves that sellers aggressively pushed the price down, but buyers fought back to force a recovery.</li><li>While the candle body can be red or green, a green Hammer provides a stronger buy signal.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 3
          },
          {
            title: 'Shooting Star',
            description: 'The bearish reversal pattern.',
            icon: '⭐',
            content: '<ul><li>A Shooting Star is a bearish reversal candle that appears strictly at the peak of an uptrend.</li><li>It has a small real body at the bottom and a very long upper wick pointing upward.</li><li>The long upper wick proves that buyers pushed prices high but failed miserably to sustain them.</li><li>Sellers took complete control of the session by the closing bell, driving the price back down.</li><li>It warns traders that the upward momentum is exhausted and a downward turn is likely coming.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 4
          },
          {
            title: 'Engulfing Pattern',
            description: 'The two-candle reversal pattern.',
            icon: '🔄',
            content: '<ul><li>This is a highly reliable two-candle trend reversal pattern that shows an aggressive shift in power.</li><li>A Bullish Engulfing pattern starts with a small red candle followed by a massive green candle.</li><li>The body of the second candle must completely overlap or "swallow" the body of the first.</li><li>A Bearish Engulfing pattern flips this, showing a small green candle swallowed by a huge red candle.</li><li>It indicates that the previous trend has completely lost its momentum to the opposing side.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 5
          },
          {
            title: 'Morning Star',
            description: 'The three-candle bullish pattern.',
            icon: '🌟',
            content: '<ul><li>The Morning Star is a powerful three-candle bullish reversal pattern found inside downtrends.</li><li>The first candle is long and bearish, showing that sellers are firmly in control of the market.</li><li>The second candle has a very tiny body, signaling that the downward momentum is stalling out.</li><li>The third candle is long and bullish, closing deeply into the territory of the very first candle.</li><li>This visual sequence confirms that the bears have lost control and an uptrend is beginning.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 6
          }
        ]
      },
      // Category 3: Option Greeks
      {
        name: 'Option Greeks',
        description: 'Understand Delta, Gamma, Theta, Vega, and Rho — the Greeks that drive option pricing.',
        icon: '📈',
        difficulty: 'Intermediate',
        estimatedHours: 10,
        order: 3,
        topics: [
          { title: 'Delta', description: 'Learn how Delta affects your options.', icon: '📐', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 1 },
          { title: 'Gamma', description: 'Understand Gamma, the rate of change of Delta.', icon: '📐', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 2 },
          { title: 'Theta', description: 'Time decay - the silent killer.', icon: '⏳', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 3 },
          { title: 'Vega', description: 'Volatility sensitivity.', icon: '🌊', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 4 },
          { title: 'Rho', description: 'Interest rate sensitivity.', icon: '🏦', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 5 }
        ]
      },
      // Category 4: Open Interest
      {
        name: 'Open Interest',
        description: 'Learn how to analyze open interest and volume to predict market movements.',
        icon: '📉',
        difficulty: 'Intermediate',
        estimatedHours: 5,
        order: 4,
        topics: [
          { title: 'OI Basics', description: 'Introduction to Open Interest.', icon: '📊', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 1 },
          { title: 'Long Build Up', description: 'Identify bullish positions.', icon: '📈', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 2 },
          { title: 'Short Build Up', description: 'Identify bearish positions.', icon: '📉', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 3 },
          { title: 'Long Unwinding', description: 'Longs taking profits.', icon: '📉', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 4 },
          { title: 'Short Covering', description: 'Shorts getting squeezed.', icon: '📈', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 5 }
        ]
      },
      // Category 5: Trading Strategies
      {
        name: 'Trading Strategies',
        description: 'Discover advanced options strategies like straddles, strangles, and iron condors.',
        icon: '⚡',
        difficulty: 'Advanced',
        estimatedHours: 12,
        order: 5,
        topics: [
          { title: 'Straddle', description: 'Play volatility with straddles.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 1 },
          { title: 'Strangle', description: 'Lower cost volatility strategy.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 2 },
          { title: 'Iron Condor', description: 'Market neutral strategy.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 3 },
          { title: 'Bull Call Spread', description: 'Limited risk bullish spread.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 4 },
          { title: 'Bear Put Spread', description: 'Limited risk bearish spread.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 5 },
          { title: 'Covered Call', description: 'Income from your long position.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 6 }
        ]
      },
      // Category 6: Risk Management
      {
        name: 'Risk Management',
        description: 'Protect your capital with position sizing, stop losses, and risk-reward analysis.',
        icon: '🛡️',
        difficulty: 'Beginner',
        estimatedHours: 7,
        order: 6,
        topics: [
          { title: 'Position Sizing', description: 'How much to risk per trade.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 1 },
          { title: 'Stop Loss', description: 'Your insurance against big losses.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 2 },
          { title: 'Risk Reward Ratio', description: 'Ensure your risk justifies reward.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 3 },
          { title: 'Capital Protection', description: 'Preserve your capital at all costs.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 4 },
          { title: 'Hedging', description: 'Protect your portfolio.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 5 }
        ]
      },
      // Category 7: Trading Psychology
      {
        name: 'Trading Psychology',
        description: 'Master your emotions, develop discipline, and build a winning trading mindset.',
        icon: '🧠',
        difficulty: 'Intermediate',
        estimatedHours: 6,
        order: 7,
        topics: [
          { title: 'Discipline', description: 'The most important skill.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 1 },
          { title: 'Emotional Control', description: 'Don\'t let emotions decide.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 2 },
          { title: 'Fear and Greed', description: 'Recognize these emotions.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 3 },
          { title: 'Revenge Trading', description: 'The most expensive mistake.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 4 },
          { title: 'Trading Journal', description: 'Track, review, improve.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 5 }
        ]
      },
      // Category 8: Swing Trading
      {
        name: 'Swing Trading',
        description: 'Learn swing trading techniques to profit from medium-term market trends.',
        icon: '📅',
        difficulty: 'Intermediate',
        estimatedHours: 8,
        order: 8,
        topics: [
          { title: 'Trend Analysis', description: 'Identify the trend first.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 1 },
          { title: 'Swing Entry', description: 'Enter at the right time.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 2 },
          { title: 'Swing Exit', description: 'Take profits at the right time.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 3 },
          { title: 'Breakout Trading', description: 'Trade when levels break.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 4 },
          { title: 'Pullback Trading', description: 'Buy the dip in trend.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 5 }
        ]
      },
      // Category 9: Intraday Trading
      {
        name: 'Intraday Trading',
        description: 'Master day trading strategies including scalping, momentum, and VWAP-based trades.',
        icon: '🕒',
        difficulty: 'Advanced',
        estimatedHours: 10,
        order: 9,
        topics: [
          { title: 'Scalping', description: 'Quick in and out trades.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 1 },
          { title: 'Momentum Trading', description: 'Go with the flow.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 2 },
          { title: 'VWAP', description: 'Volume Weighted Average Price.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 3 },
          { title: 'ORB Strategy', description: 'Opening Range Breakout.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 4 },
          { title: 'Volume Analysis', description: 'Read what volume tells you.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 5 }
        ]
      },
      // Category 10: Futures & Options
      {
        name: 'Futures & Options',
        description: 'Complete guide to futures and options trading from basics to advanced strategies.',
        icon: '💰',
        difficulty: 'Advanced',
        estimatedHours: 15,
        order: 10,
        topics: [
          { title: 'Futures Basics', description: 'Introduction to futures.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 1 },
          { title: 'Lot Size', description: 'Understand contract sizes.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 2 },
          { title: 'Margin Requirements', description: 'Margin for futures trading.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 3 },
          { title: 'Futures Hedging', description: 'Hedge with futures.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 4 },
          { title: 'Futures Strategies', description: 'Futures trading strategies.', icon: '📖', content: '<p>Content will be added later.</p>', keyTakeaways: [], examples: [], videoUrl: '', estimatedTime: '10 min', order: 5 }
        ]
      }
    ];

    // --- Process each category ---
    let categoriesCreated = 0;
    let categoriesUpdated = 0;
    let topicsCreated = 0;
    let topicsUpdated = 0;

    for (const categoryData of allCategories) {
      // Extract topics from category data
      const { topics, ...categoryFields } = categoryData;

      // Find or create category
      let category = await CourseCategory.findOne({ name: categoryData.name });
      if (category) {
        // Update existing category
        await CourseCategory.updateOne({ _id: category._id }, { $set: categoryFields });
        categoriesUpdated++;
        console.log(`✅ Updated category: ${categoryData.name}`);
      } else {
        // Create new category
        category = await CourseCategory.create(categoryFields);
        categoriesCreated++;
        console.log(`✅ Created category: ${categoryData.name}`);
      }

      // Process topics for this category
      for (const topicData of topics) {
        // Add category reference to topic data
        const topicWithCategory = { ...topicData, category: category._id };

        // Find or create topic
        let topic = await Topic.findOne({ category: category._id, title: topicData.title });
        if (topic) {
          // Update existing topic (preserve _id)
          await Topic.updateOne({ _id: topic._id }, { $set: topicWithCategory });
          topicsUpdated++;
        } else {
          // Create new topic
          await Topic.create(topicWithCategory);
          topicsCreated++;
        }
      }
      console.log(`   📚 Processed ${topics.length} topics for ${categoryData.name}`);
    }

    // --- Process Quiz and Achievements ---
    // Keep original quiz and achievements
    const quizQuestions = [
      { category: 'Option Basics', difficulty: 'Easy', title: 'Options Basics Q1', question: 'What does an option contract represent?', options: ['Obligation to buy/sell', 'Right, but not obligation to buy/sell', 'Stock share', 'Bond'], correctAnswer: 1, explanation: 'Options give rights, not obligations.' },
      { category: 'Option Basics', difficulty: 'Easy', title: 'Options Basics Q2', question: 'A call option gives the right to?', options: ['Sell', 'Buy', 'Hold', 'None'], correctAnswer: 1, explanation: 'Calls give right to buy.' },
      { category: 'Option Basics', difficulty: 'Easy', title: 'Options Basics Q3', question: 'A put option gives the right to?', options: ['Buy', 'Sell', 'Hold', 'None'], correctAnswer: 1, explanation: 'Puts give right to sell.' },
      { category: 'Option Basics', difficulty: 'Easy', title: 'Options Basics Q4', question: 'What is strike price?', options: ['Market price', 'Agreed price in contract', 'Average price', 'High price'], correctAnswer: 1, explanation: 'Strike is agreed price for contract.' },
      { category: 'Option Basics', difficulty: 'Easy', title: 'Options Basics Q5', question: 'What is option premium?', options: ['Market price of stock', 'Price paid to buy option', 'Brokerage', 'Tax'], correctAnswer: 1, explanation: 'Premium is what you pay for option.' },
      { category: 'Option Basics', difficulty: 'Medium', title: 'Options Basics Q6', question: 'ATM means?', options: ['At The Money', 'After The Market', 'Above The Money', 'Automatic Trade Mode'], correctAnswer: 0, explanation: 'ATM = At The Money.' },
      { category: 'Option Basics', difficulty: 'Medium', title: 'Options Basics Q7', question: 'ITM means?', options: ['In The Money', 'In Time Money', 'International Trade Market', 'Intraday Trading Model'], correctAnswer: 0, explanation: 'ITM = In The Money.' },
      { category: 'Option Basics', difficulty: 'Medium', title: 'Options Basics Q8', question: 'What is intrinsic value?', options: ['Time value', 'Real value if ITM', 'Total premium', 'Broker fee'], correctAnswer: 1, explanation: 'Intrinsic value is real value of ITM option.' },
      { category: 'Option Basics', difficulty: 'Hard', title: 'Options Basics Q9', question: 'Who faces theoretically unlimited loss?', options: ['Call Buyer', 'Call Seller', 'Put Buyer', 'All'], correctAnswer: 1, explanation: 'Call seller has unlimited risk.' },
      { category: 'Option Basics', difficulty: 'Easy', title: 'Options Basics Q10', question: 'What happens to OTM options at expiry?', options: ['Get exercised', 'Become worthless', 'Automatically roll over', 'Convert to shares'], correctAnswer: 1, explanation: 'OTM options expire worthless.' }
    ];

    // Clear and reinsert quiz questions (optional, but to keep consistent)
    await Quiz.deleteMany({});
    await Quiz.insertMany(quizQuestions);

    const achievementsData = [
      { name: 'Beginner Trader', description: 'Complete your first learning topic!', icon: '📚', pointsRequired: 10, order: 1 },
      { name: 'Options Explorer', description: 'Finish all Option Basics topics.', icon: '🎯', pointsRequired: 70, order: 2 },
      { name: 'Quiz Champion', description: 'Score 80%+ on the category quiz.', icon: '🏆', pointsRequired: 100, order: 3 },
      { name: 'Consistency Master', description: 'Complete topics 5 days in a row.', icon: '🔥', pointsRequired: 50, order: 4 },
      { name: 'Bull Boom Learner', description: 'Complete the Option Basics module!', icon: '🚀', pointsRequired: 100, order: 5 }
    ];
    await Achievement.deleteMany({});
    await Achievement.insertMany(achievementsData);

    // --- Summary ---
    console.log('✅ Auto-seed complete!');
    console.log('📊 Summary:');
    console.log(`   Categories created: ${categoriesCreated}`);
    console.log(`   Categories updated: ${categoriesUpdated}`);
    console.log(`   Topics created: ${topicsCreated}`);
    console.log(`   Topics updated: ${topicsUpdated}`);
  } catch (error) {
    console.error('❌ Auto-seeding error:', error);
  }
};

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
