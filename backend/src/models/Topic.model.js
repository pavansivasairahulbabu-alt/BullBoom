import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  title: String,
  duration: String,
  type: {
    type: String,
    enum: ['video', 'text'],
    default: 'text',
  },
  content: String,
  videoUrl: String,
});

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
    },
    description: {
      type: String,
      required: [true, 'Topic description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseCategory',
      required: [true, 'Category is required'],
    },
    icon: {
      type: String,
      default: '📖',
    },
    estimatedTime: {
      type: String,
      default: '10 min',
    },
    order: {
      type: Number,
      default: 0,
    },
    content: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    examples: [
      {
        title: String,
        description: String,
      },
    ],
    keyTakeaways: [String],
    quiz: [
      {
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
      },
    ],
  },
  { timestamps: true }
);

const Topic = mongoose.model('Topic', topicSchema);
export default Topic;
