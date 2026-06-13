import mongoose from "mongoose";
import dotenv from "dotenv";
import CourseCategory from "../src/models/CourseCategory.model.js";
import Topic from "../src/models/Topic.model.js";
import Quiz from "../src/models/Quiz.model.js";

dotenv.config();

const updateOptionsBasics = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Find or create "Options Basics" category
    let category = await CourseCategory.findOne({ name: "Options Basics" });
    if (!category) {
      category = await CourseCategory.create({
        name: "Options Basics",
        description:
          "Learn the fundamentals of options trading including calls, puts, strike prices, premiums, expiry and margin.",
        icon: "🎯",
        difficulty: "Beginner",
        estimatedHours: 7,
        order: 1,
      });
      console.log('Created "Options Basics" category');
    } else {
      console.log('Found existing "Options Basics" category');
    }

    // Delete existing topics for this category
    const deletedTopics = await Topic.deleteMany({ category: category._id });
    console.log(`Deleted ${deletedTopics.deletedCount} existing topics`);

    // Delete existing quiz questions for this category
    const deletedQuizzes = await Quiz.deleteMany({ category: category.name });
    console.log(
      `Deleted ${deletedQuizzes.deletedCount} existing quiz questions`,
    );

    // Define new topics with the provided content
    const topicsData = [
      {
        title: "What are Options?",
        description:
          "An introduction to options contracts, including American vs European, rights vs obligations, and contract sizes.",
        category: category._id,
        icon: "📚",
        content: `
<h2>What are Options?</h2>

<h3>American vs. European Options:</h3>
<ul>
  <li>American options allow exercise at any point up to the expiration date.</li>
  <li>European options can only be exercised at the exact moment of expiration.</li>
  <li>Most individual stock options are American-style.</li>
  <li>Most broad market index options (like SPX) are European-style.</li>
</ul>

<h3>Rights vs Obligations:</h3>
<ul>
  <li>Option buyers pay a premium to obtain rights.</li>
  <li>Option buyers have no obligations; they choose whether to trade.</li>
  <li>Option sellers receive a premium and take on obligations.</li>
  <li>Sellers must fulfill the contract if the buyer decides to exercise.</li>
</ul>

<h3>Contract Size:</h3>
<ul>
  <li>One standard equity option contract represents exactly 100 shares of stock.</li>
  <li>Premium prices are quoted per share, so multiply by 100 for the total cost.</li>
  <li>An option quoted at $2.00 actually costs $200 to purchase.</li>
  <li>All gains, losses, and risk calculations scale by this 100-share multiplier.</li>
</ul>
        `,
        keyTakeaways: [
          "Know the difference between American and European options",
          "Buyers have rights, sellers have obligations",
          "One contract = 100 shares",
        ],
        examples: [
          {
            title: "Contract Cost Example",
            description:
              "A $2.00 option costs $200 total per contract (100 shares x $2.00)",
          },
        ],
        estimatedTime: "10 min",
        order: 1,
      },
      {
        title: "Call Options",
        description:
          "Learn about buying call options, breakeven price, and maximum risk.",
        category: category._id,
        icon: "📈",
        content: `
<h2>Call Options</h2>

<h3>Buying Calls (Long Call):</h3>
<ul>
  <li>Traders buy calls when they have a bullish market outlook.</li>
  <li>It profits when the underlying stock price moves sharply upward.</li>
  <li>It offers a cheaper way to control shares without buying stock directly.</li>
  <li>It provides high leverage, magnifying percentage gains relative to the capital risked.</li>
</ul>

<h3>Breakeven Price:</h3>
<ul>
  <li>Calculated as the Strike Price plus the Premium paid.</li>
  <li>If you buy a $50 strike call for $3, breakeven is $53.</li>
  <li>The stock must rise past this point at expiry to net a profit.</li>
  <li>Selling the option before expiry can yield profits below this line.</li>
</ul>

<h3>Maximum Risk:</h3>
<ul>
  <li>The risk is strictly capped at the total premium paid plus commissions.</li>
  <li>You cannot lose more money than your initial trade entry cost.</li>
  <li>Maximum loss occurs if the stock finishes below the strike price at expiry.</li>
  <li>The option simply expires completely worthless, resulting in a 100% loss.</li>
</ul>
        `,
        keyTakeaways: [
          "Calls profit from upward price movement",
          "Breakeven = Strike + Premium",
          "Maximum loss = Premium paid",
        ],
        examples: [
          {
            title: "Breakeven Example",
            description: "Buy $50 strike call for $3 → Breakeven at $53",
          },
        ],
        estimatedTime: "12 min",
        order: 2,
      },
      {
        title: "Put Options",
        description:
          "Learn about put options, how they compare to short selling, flat stock movement effects, and married puts.",
        category: category._id,
        icon: "📉",
        content: `
<h2>Put Options</h2>

<h3>Puts vs. Short-Selling:</h3>
<ul>
  <li>Buying puts has strictly capped risk (the premium paid).</li>
  <li>Shorting stock carries theoretically unlimited risk if the price spikes.</li>
  <li>Puts do not require borrowing shares from a broker.</li>
  <li>Puts do not incur daily stock borrowing fees or dividend obligations.</li>
</ul>

<h3>Flat Stock Movement Effect:</h3>
<ul>
  <li>A stagnant stock price causes the put to lose value daily.</li>
  <li>This loss is caused by time decay (Theta) eating extrinsic value.</li>
  <li>Implied volatility drops can accelerate this value loss.</li>
  <li>Holding a flat option until expiry results in total loss of premium.</li>
</ul>

<h3>Married Puts (Insurance):</h3>
<ul>
  <li>A strategy combining buying 100 shares of stock and 1 put option.</li>
  <li>The put acts as an insurance policy against a severe market crash.</li>
  <li>It establishes a concrete price floor where you can sell your shares.</li>
  <li>It allows you to participate in upside gains while limiting maximum downside.</li>
</ul>
        `,
        keyTakeaways: [
          "Puts have limited risk",
          "Time decay hurts long options",
          "Married puts provide downside protection",
        ],
        examples: [
          {
            title: "Married Put Example",
            description:
              "Buy 100 shares for $50 and a $45 put for $2 → Max loss $700",
          },
        ],
        estimatedTime: "12 min",
        order: 3,
      },
      {
        title: "Strike Price",
        description:
          "Learn about ITM, ATM, OTM, strike selection and strike selection.",
        category: category._id,
        icon: "🎯",
        content: `
<h2>Strike Price</h2>

<h3>ITM, ATM, and OTM Definitions:</h3>
<ul>
  <li>In-the-Money (ITM): Calls have strikes below stock price; Puts have strikes above.</li>
  <li>At-the-Money (ATM): The strike price is identical to the current stock price.</li>
  <li>Out-of-the-Money (OTM): Calls have strikes above stock price; Puts have strikes below.</li>
  <li>ITM options hold intrinsic value, while OTM options consist purely of time value.</li>
</ul>

<h3>Strike Selection and Probability:</h3>
<ul>
  <li>OTM strikes are cheap but have a lower probability of finishing profitable.</li>
  <li>ITM strikes are expensive but have a higher mathematical probability of success.</li>
  <li>Choosing further OTM increases leverage but decreases your win rate.</li>
  <li>Choosing deep ITM mimics owning the actual stock with less premium erosion.</li>
</ul>
        `,
        keyTakeaways: [
          "Understand ITM, ATM, OTM",
          "Select strike based on risk tolerance",
          "ITM has higher probability, OTM higher leverage",
        ],
        examples: [
          {
            title: "Strike Selection Example",
            description:
              "Stock at $100 → $90 is ITM call, $100 is ATM, $110 is OTM",
          },
        ],
        estimatedTime: "10 min",
        order: 4,
      },
      {
        title: "Premium",
        description:
          "Understand intrinsic vs extrinsic value, implied volatility impact, and time decay.",
        category: category._id,
        icon: "💵",
        content: `
<h2>Premium</h2>

<h3>Intrinsic vs. Extrinsic Value:</h3>
<ul>
  <li>Intrinsic value is the real, tangible value if exercised right now.</li>
  <li>Only In-the-Money (ITM) options possess intrinsic value.</li>
  <li>Extrinsic value represents time value and market volatility expectations.</li>
  <li>At expiration, all extrinsic value drops to zero.</li>
</ul>

<h3>Implied Volatility (IV) Impact:</h3>
<ul>
  <li>IV measures the market's expectation of future price swings.</li>
  <li>Higher IV expands premiums, making options more expensive to buy.</li>
  <li>Lower IV deflates premiums, making options cheaper to buy.</li>
  <li>Buying options right before major events (like earnings) risks an "IV crush."</li>
</ul>

<h3>Time Decay:</h3>
<ul>
  <li>Theta represents the daily loss of an option's extrinsic value.</li>
  <li>Time decay is non-linear and accelerates as expiration approaches.</li>
  <li>The erosion becomes steepest during the final 30 to 45 days.</li>
  <li>Theta hurts option buyers but directly benefits option sellers.</li>
</ul>
        `,
        keyTakeaways: [
          "Premium = Intrinsic + Extrinsic",
          "IV impacts premium cost",
          "Time decay accelerates near expiry",
        ],
        examples: [
          {
            title: "Intrinsic Value Example",
            description: "Stock at $105, $100 call has $5 intrinsic value",
          },
        ],
        estimatedTime: "12 min",
        order: 5,
      },
      {
        title: "Expiry",
        description:
          "Learn about holding ITM through expiry, automatic exercise, and expiration cycles.",
        category: category._id,
        icon: "📅",
        content: `
<h2>Expiry</h2>

<h3>Holding ITM Through Expiry:</h3>
<ul>
  <li>Brokers automatically exercise options that are ITM by $0.01 or more.</li>
  <li>Long calls will be converted into buying 100 shares of stock.</li>
  <li>Long puts will be converted into shorting 100 shares of stock.</li>
  <li>If your account lacks the cash or margin, the broker may force-close it early.</li>
</ul>

<h3>Expiration Cycles:</h3>
<ul>
  <li>Weeklies expire every Friday, offering short-term, high-risk trading targets.</li>
  <li>Monthlies expire on the third Friday of the month and have the highest liquidity.</li>
  <li>LEAPS are long-term options with expiration dates spanning up to 1–3 years.</li>
  <li>Shorter cycles experience rapid time decay; longer cycles decay much slower.</li>
</ul>
        `,
        keyTakeaways: [
          "ITM options auto-exercise at expiry",
          "Different expiration cycles exist",
          "Time decay is faster near expiry",
        ],
        examples: [
          {
            title: "LEAPs Example",
            description: "LEAPS can have expiry dates up to 3 years out",
          },
        ],
        estimatedTime: "10 min",
        order: 6,
      },
      {
        title: "Margin",
        description:
          "Understand margin requirements for buyers vs sellers, and margin calls.",
        category: category._id,
        icon: "🔒",
        content: `
<h2>Margin</h2>

<h3>Sellers vs. Buyers Margin:</h3>
<ul>
  <li>Buyers have defined risk, so they only pay the initial premium cost.</li>
  <li>Sellers face undefined, potentially unlimited risk if the trade goes wrong.</li>
  <li>Brokers mandate a collateral deposit (margin) to cover potential selling losses.</li>
  <li>This margin fluctuates dynamically as the underlying stock price moves.</li>
</ul>

<h3>Margin Calls and Liquidation:</h3>
<ul>
  <li>A margin call happens when account equity falls below maintenance requirements.</li>
  <li>Brokers demand you deposit cash immediately or close losing trades.</li>
  <li>If ignored, the broker will force-liquidate positions without your consent.</li>
  <li>Liquidation often occurs at worst-case market prices, lock-in steep losses.</li>
</ul>
        `,
        keyTakeaways: [
          "Option sellers require margin",
          "Buyers only pay premium",
          "Margin calls can force liquidation",
        ],
        examples: [
          {
            title: "Margin Call Example",
            description:
              "Account equity drops below maintenance → broker demands more cash",
          },
        ],
        estimatedTime: "11 min",
        order: 7,
      },
    ];

    // Insert new topics
    const createdTopics = await Topic.insertMany(topicsData);
    console.log(`Created ${createdTopics.length} topics`);

    // Define quiz questions
    const quizData = [
      {
        title: "Options Basics Q1",
        question:
          "What is the standard expiry day for weekly Index options (like Nifty 50) in India?",
        options: ["Every Friday", "Every Thursday", "Every Wednesday"],
        correctAnswer: 1,
        category: category.name,
        difficulty: "Easy",
        explanation: "Weekly index options in India expire every Thursday.",
      },
      {
        title: "Options Basics Q2",
        question:
          "Unlike individual stocks, Nifty and Bank Nifty index options in India are:",
        options: [
          "American-style (exercised anytime)",
          "European-style (exercised only at expiry)",
          "Cash-settled only before Wednesday",
        ],
        correctAnswer: 1,
        category: category.name,
        difficulty: "Easy",
        explanation:
          "Index options in India are European-style, meaning they can only be exercised at expiry.",
      },
      {
        title: "Options Basics Q3",
        question:
          "In India, if you hold an In-the-Money (ITM) stock option through expiry, how is it settled?",
        options: [
          "Cash settlement of the profit difference",
          "Physical delivery (you must buy/deliver the actual shares)",
          "The contract is canceled with zero value",
        ],
        correctAnswer: 1,
        category: category.name,
        difficulty: "Medium",
        explanation:
          "Stock options in India are physically settled, meaning shares are delivered/received if ITM at expiry.",
      },
      {
        title: "Options Basics Q4",
        question:
          "If Nifty is at 23,000 and you buy a 23,200 Call option, this option is:",
        options: [
          "In-the-Money (ITM)",
          "At-the-Money (ATM)",
          "Out-of-the-Money (OTM)",
        ],
        correctAnswer: 2,
        category: category.name,
        difficulty: "Easy",
        explanation:
          "A call option with a strike price above the current market price is Out-of-the-Money (OTM).",
      },
      {
        title: "Options Basics Q5",
        question:
          'Which index measures the expected volatility and "fear factor" in the Indian stock market?',
        options: ["India VIX", "Nifty 500", "Sectoral Index"],
        correctAnswer: 0,
        category: category.name,
        difficulty: "Easy",
        explanation:
          "India VIX is the volatility index for Nifty, measuring market expectations of near-term volatility.",
      },
      {
        title: "Options Basics Q6",
        question:
          "If you buy 1 lot of Nifty options, how many shares (lot size) are you controlling?",
        options: [
          "Exactly 100 shares",
          "Exactly 25 or 75 shares (depending on current SEBI lot sizes)",
          "Exactly 1 share",
        ],
        correctAnswer: 1,
        category: category.name,
        difficulty: "Easy",
        explanation:
          "Nifty options lot sizes are set by SEBI and can be 25, 50, or 75 shares depending on the index level.",
      },
      {
        title: "Options Basics Q7",
        question:
          "In India, option premiums are quoted in Rupees. If a premium is ₹50 and the lot size is 25, what is the total premium cost?",
        options: ["₹50", "₹1,250", "₹5,000"],
        correctAnswer: 1,
        category: category.name,
        difficulty: "Medium",
        explanation:
          "Total premium = Premium per share × Lot size = ₹50 × 25 = ₹1,250.",
      },
      {
        title: "Options Basics Q8",
        question:
          "To comply with SEBI regulations, an option SELLER (writer) in India must maintain:",
        options: [
          "No balance, just pay premium",
          "SPAN and Exposure Margin in their demat/trading account",
          "A fixed ₹10,000 deposit for every trade",
        ],
        correctAnswer: 1,
        category: category.name,
        difficulty: "Medium",
        explanation:
          "Option sellers must maintain SPAN and Exposure Margin as collateral to cover potential losses.",
      },
      {
        title: "Options Basics Q9",
        question:
          "What happens to the premium of an OTM Nifty option on the evening of its expiry day?",
        options: [
          "It becomes ₹0",
          "It doubles in value",
          "It remains equal to its intrinsic value",
        ],
        correctAnswer: 0,
        category: category.name,
        difficulty: "Easy",
        explanation:
          "Out-of-the-Money (OTM) options expire worthless and their premium becomes zero at expiry.",
      },
      {
        title: "Options Basics Q10",
        question:
          "What is the official settlement price used for index options at 3:30 PM on expiry day?",
        options: [
          "The exact last traded price (LTP) at 3:30 PM",
          "The opening price of the day",
          "The volume-weighted average price (VWAP) of the last 30 minutes of trading",
        ],
        correctAnswer: 2,
        category: category.name,
        difficulty: "Hard",
        explanation:
          "Index options settlement price is based on the VWAP of the underlying index in the last 30 minutes of trading on expiry day.",
      },
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log("Successfully updated Options Basics content!");
    process.exit(0);
  } catch (error) {
    console.error("Error updating Options Basics:", error);
    process.exit(1);
  }
};

updateOptionsBasics();
