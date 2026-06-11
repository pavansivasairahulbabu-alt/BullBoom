import mongoose from 'mongoose';

const userTopicProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Topic ID is required'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CourseCategory',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

userTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

const UserTopicProgress = mongoose.model('UserTopicProgress', userTopicProgressSchema);
export default UserTopicProgress;
