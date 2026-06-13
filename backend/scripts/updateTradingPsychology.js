import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseCategory from '../src/models/CourseCategory.model.js';
import Topic from '../src/models/Topic.model.js';
import Quiz from '../src/models/Quiz.model.js';

dotenv.config();

const updateTradingPsychology = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create "Trading Psychology" category
    let category = await CourseCategory.findOne({ name: 'Trading Psychology' });
    if (!category) {
      category = await CourseCategory.create({
        name: 'Trading Psychology',
        description: 'Learn the psychological principles of successful trading.',
        icon: '🧠',
        difficulty: 'Medium',
        estimatedHours: 5,
        order: 7
      });
      console.log('Created "Trading Psychology" category');
    } else {
      console.log('Found existing "Trading Psychology" category');
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
        title: 'Discipline',
        description: 'Learn why discipline is the foundation of trading success.',
        category: category._id,
        icon: '⚡',
        content: `
<h2>Discipline</h2>
<ul>
  <li><strong>Stick to the plan:</strong> Always execute trades based on your pre-defined trading strategy, regardless of what the market is doing.</li>
  <li><strong>Consistency is key:</strong> Apply your risk management rules (like stop-losses) uniformly on every single trade to protect your capital.</li>
  <li><strong>Avoid overtrading:</strong> Have the discipline to sit on your hands and do nothing when your setup isn't present in the market.</li>
  <li><strong>Treat it like a business:</strong> Approach trading with structured routines rather than treating it like a gamble or a game.</li>
</ul>
        `,
        keyTakeaways: [
          'Stick to your plan',
          'Consistent risk management',
          'Avoid overtrading'
        ],
        examples: [{
          title: 'Discipline Example',
          description: 'Wait for your exact setup even when the market seems tempting to trade without it.'
        }],
        estimatedTime: '10 min',
        order: 1
      },
      {
        title: 'Emotional Control',
        description: 'Learn to master your emotions and trade objectively.',
        category: category._id,
        icon: '🎯',
        content: `
<h2>Emotional Control</h2>
<ul>
  <li><strong>Accept the losses:</strong> Understand that losing trades are a normal, unavoidable business expense in trading.</li>
  <li><strong>Stay objective:</strong> Base your decisions on data, technical analysis, and market structure rather than "gut feelings."</li>
  <li><strong>Avoid impulsivity:</strong> Never enter or exit a trade out of sudden panic, boredom, or excitement.</li>
  <li><strong>Take strategic breaks:</strong> Step away from the screen after an unusually large win or loss to reset your mental state.</li>
</ul>
        `,
        keyTakeaways: [
          'Accept losses as normal',
          'Trade with data, not gut feelings',
          'Take breaks to reset'
        ],
        examples: [{
          title: 'Emotional Control Example',
          description: 'After a big win, step away for an hour to avoid overconfidence.'
        }],
        estimatedTime: '10 min',
        order: 2
      },
      {
        title: 'Fear and Greed',
        description: 'Learn to recognize and manage fear and greed in your trading.',
        category: category._id,
        icon: '⚖️',
        content: `
<h2>Fear and Greed</h2>
<ul>
  <li><strong>The danger of fear:</strong> Fear can make you hesitate on valid trade setups or cause you to exit winning trades far too early.</li>
  <li><strong>The trap of greed:</strong> Greed leads to holding onto losing positions hoping they reverse, or using excessive leverage to get rich quick.</li>
  <li><strong>Beware of FOMO:</strong> "Fear Of Missing Out" often tempts traders into buying at the very top or selling at the very bottom just because the price is moving fast.</li>
  <li><strong>Automate your exits:</strong> Set firm take-profit and stop-loss orders the moment you enter a trade to remove these two emotions from the equation.</li>
</ul>
        `,
        keyTakeaways: [
          'Fear causes hesitation/early exits',
          'Greed causes bad decisions',
          'Avoid FOMO'
        ],
        examples: [{
          title: 'Fear and Greed Example',
          description: 'Don\'t buy just because everyone else is buying; wait for your setup.'
        }],
        estimatedTime: '10 min',
        order: 3
      },
      {
        title: 'Revenge Trading',
        description: 'Learn to recognize and avoid the dangers of revenge trading.',
        category: category._id,
        icon: '🛑',
        content: `
<h2>Revenge Trading</h2>
<ul>
  <li><strong>Driven by ego:</strong> Revenge trading happens when you try to immediately "win back" money you just lost to the market.</li>
  <li><strong>Irrational setups:</strong> These trades are usually taken out of anger, ignoring your strategy and bypassing all normal entry criteria.</li>
  <li><strong>Increased risk:</strong> Traders often double their position size during a revenge trade, compounding their losses and risking account blow-ups.</li>
  <li><strong>The best defense:</strong> The only way to beat revenge trading is a strict rule to walk away from your desk for the day after hitting your daily loss limit.</li>
</ul>
        `,
        keyTakeaways: [
          'Revenge trading is ego-driven',
          'Irrational, high-risk trades',
          'Walk away after daily loss limit'
        ],
        examples: [{
          title: 'Revenge Trading Example',
          description: 'After a losing trade, take a 30-minute break instead of immediately entering another trade.'
        }],
        estimatedTime: '10 min',
        order: 4
      },
      {
        title: 'Trading Journal',
        description: 'Learn how to use a trading journal to improve your performance.',
        category: category._id,
        icon: '📖',
        content: `
<h2>Trading Journal</h2>
<ul>
  <li><strong>Log the data:</strong> Record the entry price, exit price, position size, and the technical reason for taking every single trade.</li>
  <li><strong>Track your mindset:</strong> Write down exactly how you felt before, during, and after the trade to identify emotional triggers.</li>
  <li><strong>Review regularly:</strong> Dedicate time at the end of every week to study your journal and look for patterns in your winning and losing streaks.</li>
  <li><strong>Refine your edge:</strong> Use the hard data from your journal to tweak your strategy, eliminate bad habits, and improve your future performance.</li>
</ul>
        `,
        keyTakeaways: [
          'Log all trade data',
          'Track your mindset',
          'Review and refine regularly'
        ],
        examples: [{
          title: 'Trading Journal Example',
          description: 'Every Sunday evening, review the previous week\'s trades to find what worked and what didn\'t.'
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
        title: 'Trading Psychology Q1',
        question: 'What is the primary purpose of a pre-trade routine?',
        options: ['To guarantee a winning trade', 'To remove doubt and ensure execution is based on rules, not instinct', 'To find more trading opportunities', 'To increase the speed of your entries'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Pre-trade routines ensure rule-based execution, not instinct.'
      },
      {
        title: 'Trading Psychology Q2',
        question: 'According to trading discipline, when should you judge a trade\'s success?',
        options: ['By whether it made a profit or loss', 'By how much money was made relative to the risk', 'By how well you followed your trading plan', 'By how quickly the price hit your target'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'Judge trade success by how well you followed your plan, not just profit/loss.'
      },
      {
        title: 'Trading Psychology Q3',
        question: 'Which emotion typically causes a trader to hold a losing position for too long, hoping for a turnaround?',
        options: ['Greed', 'Fear of missing out (FOMO)', 'Overconfidence', 'Fear of taking a loss'],
        correctAnswer: 0,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Greed makes traders hold losing positions hoping for a turnaround.'
      },
      {
        title: 'Trading Psychology Q4',
        question: 'Why is emotional discipline considered critical in volatile markets?',
        options: ['It helps you predict future market movements', 'it allows you to make rational decisions based on analysis rather than panic', 'It eliminates all risk of financial loss', 'It ensures you catch every market move'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Emotional discipline allows rational decisions, not panic, in volatile markets.'
      },
      {
        title: 'Trading Psychology Q5',
        question: 'What behavior is often a result of greed in a bullish market?',
        options: ['Setting tight stop-losses', 'Reducing position sizes', 'Holding onto winning investments too long to squeeze out extra profit', 'Exiting trades early'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Greed makes traders hold winning positions too long.'
      },
      {
        title: 'Trading Psychology Q6',
        question: 'A trader hesitates to enter a valid setup because of a previous loss. Which psychological factor is this?',
        options: ['Greed', 'Overconfidence', 'Fear', 'Revenge trading'],
        correctAnswer: 2,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Fear causes hesitation after previous losses.'
      },
      {
        title: 'Trading Psychology Q7',
        question: 'What is the defining characteristic of "Revenge Trading"?',
        options: ['Trading with a very small lot size', 'Taking impulsive, emotional trades to quickly "make back" a recent loss', 'Following a backtested strategy strictly', 'Waiting for the perfect setup after a loss'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Revenge trading = impulsive trades to make back recent losses.'
      },
      {
        title: 'Trading Psychology Q8',
        question: 'Which of the following is a common trigger for revenge trading behavior?',
        options: ['Following a strict daily profit limit', 'A devastating loss, such as 20% of the account', 'Keeping a detailed trading journal', 'Taking a planned break after a loss'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Big losses are a common trigger for revenge trading.'
      },
      {
        title: 'Trading Psychology Q9',
        question: 'In addition to profit and loss, what should a professional trading journal track to improve psychology?',
        options: ['The names of other traders you follow', 'Your emotional state before, during, and after every trade', 'Only the trades that were successful', 'News headlines from mainstream media'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Easy',
        explanation: 'Track emotional state in your journal to improve psychology.'
      },
      {
        title: 'Trading Psychology Q10',
        question: 'How can a trading journal help identify why you break your rules?',
        options: ['By showing you which stocks are the most profitable', 'By mapping triggers like lack of sleep, stress, or recent big wins/losses', 'By automatically correcting your future trades', 'By predicting tomorrow\'s market trend'],
        correctAnswer: 1,
        category: category.name,
        difficulty: 'Medium',
        explanation: 'Journal helps identify triggers like stress, lack of sleep, big wins/losses.'
      }
    ];

    // Insert quiz questions
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quiz questions`);

    console.log('Successfully updated "Trading Psychology" content!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating "Trading Psychology":', error);
    process.exit(1);
  }
};

updateTradingPsychology();
