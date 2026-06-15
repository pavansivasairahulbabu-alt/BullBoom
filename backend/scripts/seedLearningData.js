import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';
import Achievement from '../src/models/Achievement.model.js';

dotenv.config();

const seedLearningData = async () => {
  try {
    await connectDB();

    // --- Define all categories with data ---
    const allCategories = [
      // Category 1: Options Basics - keep exactly as original user content
      {
        name: 'Options Basics',
        description: 'Learn the fundamentals of options trading including calls, puts, strike prices, premiums, expiry and margin.',
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
          {
            title: 'Delta',
            description: 'Directional Risk - Price Sensitivity',
            icon: '📐',
            content: '<ul><li><strong>Measures Price Sensitivity:</strong> Delta indicates how much an option\'s price is expected to move for every $1 change in the underlying asset\'s price.</li><li><strong>Value Ranges:</strong> Call options have a positive Delta ranging from 0 to 1, while Put options have a negative Delta ranging from -1 to 0.</li><li><strong>Probability Proxy:</strong> Traders often use Delta as a rough mathematical estimate of the percentage chance that an option will expire in-the-money (ITM). For example, a 0.30 Delta implies roughly a 30% chance.</li><li><strong>Share Equivalence:</strong> A Delta of 0.50 means the option behaves similarly to owning 50 shares of the underlying stock.</li><li><strong>Dynamic Nature:</strong> Delta is not static; it constantly shifts as the underlying stock price moves and as expiration approaches.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 1
          },
          {
            title: 'Gamma',
            description: 'Rate of Change - Delta\'s Acceleration',
            icon: '📐',
            content: '<ul><li><strong>Measures Delta\'s Sensitivity:</strong> Gamma represents the rate of change in an option\'s Delta for every $1 move in the underlying stock. If Delta is the "speed" of the option, Gamma is the "acceleration."</li><li><strong>Highest at the Money:</strong> Gamma is typically at its peak for at-the-money (ATM) options and decreases as the option moves deep into or out of the money.</li><li><strong>Positive Value:</strong> It is always a positive number for buyers of both long calls and long puts.</li><li><strong>Risk Indicator:</strong> A high Gamma means the option\'s Delta can change rapidly with small stock movements, resulting in higher price volatility and potential risk/reward.</li><li><strong>Expiration Impact:</strong> Gamma tends to increase significantly as expiration draws closer, making near-term ATM options highly sensitive to underlying price swings.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 2
          },
          {
            title: 'Theta',
            description: 'Time Decay - The Silent Killer',
            icon: '⏳',
            content: '<ul><li><strong>Measures Time Sensitivity:</strong> Theta quantifies the rate of time decay on an option\'s premium, representing how much value the option loses each day as it nears expiration.</li><li><strong>The Silent Killer for Buyers:</strong> Theta is generally negative for option buyers (meaning time works against them) and positive for option sellers (meaning time works in their favor).</li><li><strong>Accelerates Over Time:</strong> Time decay is not linear; it accelerates rapidly in the final weeks and days leading up to expiration, especially for at-the-money options.</li><li><strong>Targets Extrinsic Value:</strong> Theta only eats away at an option\'s extrinsic (time) value. It does not affect the intrinsic value of an option that is already in-the-money.</li><li><strong>Weekend Effect:</strong> While the market is closed, time decay still mathematically occurs, though market makers often price in weekend Theta decay by late Friday.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 3
          },
          {
            title: 'Vega',
            description: 'Volatility Risk',
            icon: '🌊',
            content: '<ul><li><strong>Measures Volatility Sensitivity:</strong> Vega indicates how much an option\'s price will change for a 1% shift in the underlying asset\'s implied volatility (IV).</li><li><strong>Positive for Buyers:</strong> When implied volatility increases, option premiums generally become more expensive, making Vega a positive force for option buyers and a risk for sellers.</li><li><strong>Impacts Longer-Term Options:</strong> Vega has the greatest impact on options with longer expiration dates, as there is more time for volatility to drastically affect the underlying asset.</li><li><strong>Highest at the Money:</strong> Like Gamma, Vega is most concentrated in at-the-money options and drops off for deep out-of-the-money or in-the-money contracts.</li><li><strong>The "IV Crush":</strong> A sudden drop in implied volatility (which frequently happens right after an anticipated event like an earnings report) can severely reduce an option\'s price, even if the stock moves in the desired direction.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 4
          },
          {
            title: 'Rho',
            description: 'Interest Rate Risk',
            icon: '🏦',
            content: '<ul><li><strong>Measures Interest Rate Sensitivity:</strong> Rho represents the expected change in an option\'s price for a 1% change in the risk-free interest rate (often tied to U.S. Treasury bills).</li><li><strong>Divergence Between Calls and Puts:</strong> Call options generally have a positive Rho (values increase as interest rates rise), while put options have a negative Rho (values decrease as rates rise).</li><li><strong>Minimal Short Term Impacts:</strong> For standard, short-term options trades, Rho is usually the least significant of the Greeks and has a negligible effect on daily pricing.</li><li><strong>Relevance for LEAPS:</strong> Rho becomes a much more critical factor for longer-term options, such as Long-Term Equity Anticipation Securities (LEAPS), where the cost of carrying the position over months or years is higher.</li><li><strong>Macroeconomic Factor:</strong> Because interest rates change infrequently compared to stock prices or market volatility, Rho is typically only monitored closely during periods of aggressive central bank policy shifts.</li></ul>',
            keyTakeaways: [],
            examples: [],
            videoUrl: '',
            estimatedTime: '10 min',
            order: 5
          }
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
    for (const categoryData of allCategories) {
      // Extract topics from category data
      const { topics, ...categoryFields } = categoryData;

      // Find or create category
      let category = await CourseCategory.findOne({ name: categoryData.name });
      if (category) {
        // Update existing category
        await CourseCategory.updateOne({ _id: category._id }, { $set: categoryFields });
      } else {
        // Create new category
        category = await CourseCategory.create(categoryFields);
      }

      // Process topics for this category
      for (const topicData of topics) {
        // Add category reference to topic data
        const topicWithCategory = { ...topicData, category: category._id };

        // Find or create topic
        let topic = await Topic.findOne({ category: category._id, title: topicData.title });
        if (topic) {
          // Update existing topic (preserve _id), and unset keyTakeaways/examples if not provided
          const updateObj = { $set: topicWithCategory };
          // If the topicData doesn't have keyTakeaways, unset it
          if (!('keyTakeaways' in topicData)) {
            updateObj.$unset = updateObj.$unset || {};
            updateObj.$unset.keyTakeaways = "";
          }
          // If the topicData doesn't have examples, unset it
          if (!('examples' in topicData)) {
            updateObj.$unset = updateObj.$unset || {};
            updateObj.$unset.examples = "";
          }
          await Topic.updateOne({ _id: topic._id }, updateObj);
        } else {
          // Create new topic
          await Topic.create(topicWithCategory);
        }
      }
    }

    // --- Process Quiz and Achievements ---
    // Keep original quiz and achievements
    const quizQuestions = [
      { category: 'Options Basics', difficulty: 'Easy', title: 'Options Basics Q1', question: 'What is the standard expiry day for weekly Index options (like Nifty 50) in India?', options: ['Every Friday', 'Every Thursday', 'Every Wednesday'], correctAnswer: 1, explanation: 'Weekly Nifty options in India expire every Thursday.' },
      { category: 'Options Basics', difficulty: 'Easy', title: 'Options Basics Q2', question: 'Unlike individual stocks, Nifty and Bank Nifty index options in India are:', options: ['American-style (exercised anytime)', 'European-style (exercised only at expiry)', 'Cash-settled only before Wednesday'], correctAnswer: 1, explanation: 'Index options in India are European-style and can only be exercised at expiry.' },
      { category: 'Options Basics', difficulty: 'Easy', title: 'Options Basics Q3', question: 'In India, if you hold an In-the-Money (ITM) stock option through expiry, how is it settled?', options: ['Cash settlement of the profit difference', 'Physical delivery (you must buy/deliver the actual shares)', 'The contract is canceled with zero value'], correctAnswer: 1, explanation: 'ITM stock options in India are physically settled at expiry.' },
      { category: 'Options Basics', difficulty: 'Easy', title: 'Options Basics Q4', question: 'If Nifty is at 23,000 and you buy a 23,200 Call option, this option is:', options: ['In-the-Money (ITM)', 'At-the-Money (ATM)', 'Out-of-the-Money (OTM)'], correctAnswer: 2, explanation: 'A call option with a strike price higher than the current market price is out-of-the-money.' },
      { category: 'Options Basics', difficulty: 'Easy', title: 'Options Basics Q5', question: 'Which index measures the expected volatility and "fear factor" in the Indian stock market?', options: ['India VIX', 'Nifty 500', 'Sectoral Index'], correctAnswer: 0, explanation: 'India VIX is the volatility index that measures market fear and expected volatility.' },
      { category: 'Options Basics', difficulty: 'Medium', title: 'Options Basics Q6', question: 'If you buy 1 lot of Nifty options, how many shares (lot size) are you controlling?', options: ['Exactly 100 shares', 'Exactly 25 or 75 shares (depending on current SEBI lot sizes)', 'Exactly 1 share'], correctAnswer: 1, explanation: 'SEBI adjusts Nifty lot sizes periodically, currently it varies (25 or 75 shares historically).' },
      { category: 'Options Basics', difficulty: 'Medium', title: 'Options Basics Q7', question: 'In India, option premiums are quoted in Rupees. If a premium is ₹50 and the lot size is 25, what is the total premium cost?', options: ['₹50', '₹1,250', '₹5,000'], correctAnswer: 1, explanation: 'Total cost = Premium per share × Lot size = 50 × 25 = ₹1,250.' },
      { category: 'Options Basics', difficulty: 'Medium', title: 'Options Basics Q8', question: 'To comply with SEBI regulations, an option SELLER (writer) in India must maintain:', options: ['No balance, just pay premium', 'SPAN and Exposure Margin in their demat/trading account', 'A fixed ₹10,000 deposit for every trade'], correctAnswer: 1, explanation: 'Option sellers must maintain SPAN and Exposure Margin as collateral.' },
      { category: 'Options Basics', difficulty: 'Hard', title: 'Options Basics Q9', question: 'What happens to the premium of an OTM Nifty option on the evening of its expiry day?', options: ['It becomes ₹0', 'It doubles in value', 'It remains equal to its intrinsic value'], correctAnswer: 0, explanation: 'Out-of-the-money options expire worthless, so their premium becomes zero.' },
      { category: 'Options Basics', difficulty: 'Hard', title: 'Options Basics Q10', question: 'What is the official settlement price used for index options at 3:30 PM on expiry day?', options: ['The exact last traded price (LTP) at 3:30 PM', 'The opening price of the day', 'The volume-weighted average price (VWAP) of the last 30 minutes of trading'], correctAnswer: 2, explanation: 'Index options in India settle at the VWAP of the last 30 minutes of trading on expiry day.' },
      { category: 'Charts & Candles', difficulty: 'Easy', title: 'Charts & Candles Q1', question: 'Which part of a candlestick represents the absolute highest price reached during a trading session?', options: ['The open price', 'The upper shadow (wick)', 'The real body', 'The lower shadow (wick)'], correctAnswer: 1, explanation: 'The upper shadow (wick) represents the highest price of the session.' },
      { category: 'Charts & Candles', difficulty: 'Easy', title: 'Charts & Candles Q2', question: 'If a candlestick has a very long real green body, what does it tell you about market momentum?', options: ['Sellers are completely dominating the session', 'Buyers are strongly dominating the session', 'The market is trapped in heavy indecision', 'Trading volume has hit zero'], correctAnswer: 1, explanation: 'A long green body indicates strong bullish momentum and buyer dominance.' },
      { category: 'Charts & Candles', difficulty: 'Easy', title: 'Charts & Candles Q3', question: 'What defines a standard Doji candlestick pattern?', options: ['Its body is twice as large as its wicks', 'It has no wicks on either side', 'The opening and closing prices are virtually equal', 'It always points straight downward'], correctAnswer: 2, explanation: 'A Doji forms when open and close prices are almost identical.' },
      { category: 'Charts & Candles', difficulty: 'Easy', title: 'Charts & Candles Q4', question: 'A Doji forming in the middle of a choppy, sideways trading range provides a highly reliable trend reversal signal.', options: ['True', 'False'], correctAnswer: 1, explanation: 'A Doji in the middle of a sideways range is not a reliable reversal signal.' },
      { category: 'Charts & Candles', difficulty: 'Medium', title: 'Charts & Candles Q5', question: 'Where must a valid Hammer candlestick pattern always appear to be a valid signal?', options: ['At the absolute peak of a strong uptrend', 'Right in the middle of a flat consolidation range', 'At the bottom of a defined downtrend', 'Only when a stock drops on a Sunday morning'], correctAnswer: 2, explanation: 'A Hammer is a valid bullish reversal pattern only at the bottom of a downtrend.' },
      { category: 'Charts & Candles', difficulty: 'Medium', title: 'Charts & Candles Q6', question: 'What is the strict structural rule regarding a Hammer\'s lower wick?', options: ['It must be shorter than the real body', 'It must be at least two to three times the length of the real body', 'It must be completely non-existent', 'It must match the length of the upper wick perfectly'], correctAnswer: 1, explanation: 'A Hammer\'s lower wick must be 2-3x the size of its real body.' },
      { category: 'Charts & Candles', difficulty: 'Medium', title: 'Charts & Candles Q7', question: 'What does the long upper shadow of a Shooting Star reveal?', options: ['Buyers pushed prices high but failed to maintain them by the close', 'Sellers tried to push prices down but failed completely', 'Buyers successfully held the highest price until the closing bell', 'The market has run out of available shares to trade'], correctAnswer: 0, explanation: 'Shooting Star\'s long upper shadow shows buyers failed to hold highs.' },
      { category: 'Charts & Candles', difficulty: 'Hard', title: 'Charts & Candles Q8', question: 'If the very next candle breaks and closes above the high wick of a Shooting Star, the bearish reversal signal is strictly invalidated.', options: ['True', 'False'], correctAnswer: 0, explanation: 'If next candle closes above Shooting Star high, signal is invalidated.' },
      { category: 'Charts & Candles', difficulty: 'Hard', title: 'Charts & Candles Q9', question: 'In a Bullish Engulfing pattern, what part of the first candle must the second green candle completely swallow?', options: ['Just the bottom lower wick', 'The entire real body of the first candle', 'The trading volume bar beneath the chart', 'The opening price only'], correctAnswer: 1, explanation: 'Bullish Engulfing requires second candle to engulf first\'s entire real body.' },
      { category: 'Charts & Candles', difficulty: 'Hard', title: 'Charts & Candles Q10', question: 'What type of market signal is a Morning Star pattern?', options: ['A bearish continuation signal', 'A bearish reversal signal', 'A bullish reversal signal', 'A sideways consolidation signal'], correctAnswer: 2, explanation: 'Morning Star is a bullish reversal pattern.' },
      { category: 'Option Greeks', difficulty: 'Easy', title: 'Option Greeks Q1', question: 'If an option has a Delta of 0.60, how much is its price expected to change if the underlying stock increases by $1?', options: ['It will increase by $1.00', 'It will increase by $0.60', 'It will decrease by $0.60', 'It will increase by 60%'], correctAnswer: 1, explanation: 'Delta indicates how much an option\'s price moves for a $1 change in the underlying asset.' },
      { category: 'Option Greeks', difficulty: 'Easy', title: 'Option Greeks Q2', question: 'In practical trading, what does a Delta of 0.25 roughly estimate?', options: ['A 25% return on investment at expiration', 'The option loses $0.25 of value every day', 'A 25% probability that the option will expire in-the-money', 'The underlying stock price will move by 25%'], correctAnswer: 2, explanation: 'Delta is often used as a rough estimate of an option\'s probability of expiring ITM.' },
      { category: 'Option Greeks', difficulty: 'Easy', title: 'Option Greeks Q3', question: 'Which option Greek measures the expected change in Delta for a $1 move in the underlying stock?', options: ['Gamma', 'Theta', 'Vega', 'Rho'], correctAnswer: 0, explanation: 'Gamma is the rate of change of Delta for every $1 move in the underlying stock.' },
      { category: 'Option Greeks', difficulty: 'Easy', title: 'Option Greeks Q4', question: 'At what strike price location is Gamma typically at its highest mathematical value?', options: ['Deep out-of-the-money (OTM) options', 'Deep in-the-money (ITM) options', 'At-the-money (ATM) options', 'It is equal across all strike prices'], correctAnswer: 2, explanation: 'Gamma is typically highest for at-the-money (ATM) options.' },
      { category: 'Option Greeks', difficulty: 'Medium', title: 'Option Greeks Q5', question: 'How does Theta primarily affect an investor holding a long (bought) option position?', options: ['It steadily erodes the extrinsic value of the option each day', 'It increases the intrinsic value of the option over time', 'It causes the underlying stock price to decline', 'It protects the option premium from market crashes'], correctAnswer: 0, explanation: 'Theta is negative for option buyers, eroding extrinsic value daily.' },
      { category: 'Option Greeks', difficulty: 'Medium', title: 'Option Greeks Q6', question: 'At what point does time decay (Theta) accelerate the fastest for an at-the-money option?', options: ['More than a year away from expiration', 'In the final weeks and days leading up to expiration', 'Immediately in the first 24 hours after the option is created', 'Time decay is completely linear and never changes speed'], correctAnswer: 1, explanation: 'Time decay accelerates rapidly in the final weeks/days before expiration, especially for ATM options.' },
      { category: 'Option Greeks', difficulty: 'Medium', title: 'Option Greeks Q7', question: 'If market-wide implied volatility (IV) suddenly spikes, which Greek indicates how much an option\'s premium will increase?', options: ['Delta', 'Gamma', 'Vega', 'Rho'], correctAnswer: 2, explanation: 'Vega measures an option\'s sensitivity to changes in implied volatility (IV).' },
      { category: 'Option Greeks', difficulty: 'Hard', title: 'Option Greeks Q8', question: 'What typically happens to an option\'s premium due to Vega immediately following a highly anticipated event like an earnings report?', options: ['The premium spikes aggressively because the event is over', 'The premium drops significantly due to a rapid collapse in implied volatility ("IV Crush")', 'The premium stays completely frozen until the next trading day', 'The intrinsic value immediately drops to zero'], correctAnswer: 1, explanation: 'After anticipated events, implied volatility often drops rapidly, causing an "IV Crush" that reduces option premiums.' },
      { category: 'Option Greeks', difficulty: 'Hard', title: 'Option Greeks Q9', question: 'For which type of option strategy is Rho (interest rate sensitivity) the most critical factor to actively monitor?', options: ['Zero days to expiration (0DTE) day trades', 'Weekly swing trades', 'Long-term options contracts, such as LEAPS (held for a year or more)', 'Overnight earnings gap plays'], correctAnswer: 2, explanation: 'Rho is most relevant for longer-term options like LEAPS, where interest rate impacts are more significant.' },
      { category: 'Option Greeks', difficulty: 'Hard', title: 'Option Greeks Q10', question: 'How do the standard Delta values of basic long Call options compare to basic long Put options?', options: ['Calls have a positive Delta, while Puts have a negative Delta', 'Calls have a negative Delta, while Puts have a positive Delta', 'Both Calls and Puts have a positive Delta', 'Both Calls and Puts have a neutral Delta of zero'], correctAnswer: 0, explanation: 'Long calls have positive Delta, long puts have negative Delta.' }
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

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedLearningData();
