import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
    },
    question: {
      type: String,
      required: [true, 'Quiz question is required'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Quiz options are required'],
    },
    correctAnswer: {
      type: Number,
      required: [true, 'Correct answer is required'],
    },
    explanation: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Quiz category is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Quiz difficulty is required'],
    },
  },
  {
    timestamps: true,
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
