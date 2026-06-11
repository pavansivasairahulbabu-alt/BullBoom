import mongoose from 'mongoose';
import Course from '../models/Course.model.js';
import UserCourse from '../models/UserCourse.model.js';
import Quiz from '../models/Quiz.model.js';
import QuizAttempt from '../models/QuizAttempt.model.js';
import Achievement from '../models/Achievement.model.js';
import UserAchievement from '../models/UserAchievement.model.js';
import User from '../models/User.model.js';
import CourseCategory from '../models/CourseCategory.model.js';
import Topic from '../models/Topic.model.js';
import UserTopicProgress from '../models/UserTopicProgress.model.js';
import Certificate from '../models/Certificate.model.js';

// Helper functions
const getUserProgress = async (userId) => {
  const totalTopics = await Topic.countDocuments();
  const completedTopics = await UserTopicProgress.countDocuments({ userId, completed: true });
  const totalCategories = await CourseCategory.countDocuments();
  const categories = await CourseCategory.find();
  let completedCategories = 0;
  for (const cat of categories) {
    const topicsInCat = await Topic.countDocuments({ category: cat._id });
    const completedInCat = await UserTopicProgress.countDocuments({ userId, categoryId: cat._id, completed: true });
    if (topicsInCat > 0 && completedInCat === topicsInCat) {
      completedCategories++;
    }
  }
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  return { totalTopics, completedTopics, totalCategories, completedCategories, overallProgress };
};

// Get dashboard data
export const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    // Get categories with progress
    const categories = await CourseCategory.find().sort({ order: 1 });
    const categoriesWithProgress = await Promise.all(categories.map(async (cat) => {
      const topicCount = await Topic.countDocuments({ category: cat._id });
      const completedCount = await UserTopicProgress.countDocuments({ userId, categoryId: cat._id, completed: true });
      const progress = topicCount > 0 ? Math.round((completedCount / topicCount) * 100) : 0;
      return { ...cat.toObject(), topicCount, completedCount, progress };
    }));
    // Get stats
    const progress = await getUserProgress(userId);
    const myCourses = await UserCourse.find({ userId }).populate('courseId');
    const achievements = await Achievement.find();
    const leaderboardData = await getLeaderboardData();
    const dailyQuiz = await Quiz.aggregate([{ $sample: { size: 1 } }]);
    const continueLearning = await getContinueLearningData(userId);
    res.status(200).json({
      success: true,
      data: {
        categories: categoriesWithProgress,
        stats: {
          coursesEnrolled: myCourses.length,
          coursesCompleted: myCourses.filter(c => c.progress === 100).length,
          learningHours: progress.completedCategories * 5 + Math.floor(progress.completedTopics / 5),
          currentStreak: 0,
          certificates: progress.completedCategories,
          skillScore: Math.min(100, Math.round(progress.completedTopics * 2 + progress.completedCategories * 10)),
          ...progress
        },
        continueLearning,
        myCourses,
        achievements,
        leaderboard: leaderboardData,
        dailyQuiz: dailyQuiz[0] || null,
        recommendedCourses: await Course.find().sort({ rating: -1 }).limit(6)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get categories
export const getCategories = async (req, res) => {
  try {
    const userId = req.user?._id;
    const categories = await CourseCategory.find().sort({ order: 1 });
    const categoriesWithProgress = await Promise.all(categories.map(async (cat) => {
      const topicCount = await Topic.countDocuments({ category: cat._id });
      const completedCount = userId ? await UserTopicProgress.countDocuments({ userId, categoryId: cat._id, completed: true }) : 0;
      const progress = topicCount > 0 ? Math.round((completedCount / topicCount) * 100) : 0;
      return { ...cat.toObject(), topicCount, completedCount, progress };
    }));
    res.status(200).json({ success: true, data: categoriesWithProgress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get category details
export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }
    const userId = req.user?._id;
    const category = await CourseCategory.findById(id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    const topics = await Topic.find({ category: id }).sort({ order: 1 });
    const topicsWithProgress = await Promise.all(topics.map(async (topic) => {
      const progress = userId ? await UserTopicProgress.findOne({ userId, topicId: topic._id }) : null;
      return { ...topic.toObject(), completed: progress?.completed || false, progress: progress?.progress || 0 };
    }));
    const completedCount = topicsWithProgress.filter(t => t.completed).length;
    const quizQuestions = await Quiz.find({ category: category.name }).limit(10);
    res.status(200).json({ success: true, data: { category, topics: topicsWithProgress, completedCount, totalCount: topics.length, progress: topics.length > 0 ? Math.round((completedCount / topics.length) * 100) : 0, quizQuestions } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get topic details
export const getTopic = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid topic ID' });
    }
    const userId = req.user?._id;
    const topic = await Topic.findById(id).populate('category');
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    let progress = userId ? await UserTopicProgress.findOne({ userId, topicId: id }) : null;
    if (!progress && userId) {
      progress = await UserTopicProgress.create({ userId, topicId: id, categoryId: topic.category._id, progress: 0, completed: false });
    }
    res.status(200).json({ success: true, data: { topic, userProgress: progress } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mark topic complete
export const markTopicComplete = async (req, res) => {
  try {
    const { topicId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(topicId)) {
      return res.status(400).json({ success: false, message: 'Invalid topic ID' });
    }
    const userId = req.user._id;
    const topic = await Topic.findById(topicId);
    if (!topic) return res.status(404).json({ success: false, message: 'Topic not found' });
    let progress = await UserTopicProgress.findOne({ userId, topicId });
    if (!progress) {
      progress = await UserTopicProgress.create({ userId, topicId, categoryId: topic.category, progress: 100, completed: true, completedAt: new Date() });
    } else {
      progress = await UserTopicProgress.findByIdAndUpdate(progress._id, { progress: 100, completed: true, completedAt: new Date() }, { new: true });
    }
    // Check if category is completed to issue certificate
    const topicCount = await Topic.countDocuments({ category: topic.category });
    const completedCount = await UserTopicProgress.countDocuments({ userId, categoryId: topic.category, completed: true });
    if (topicCount === completedCount) {
      const category = await CourseCategory.findById(topic.category);
      const existingCert = await Certificate.findOne({ userId, categoryId: topic.category });
      if (!existingCert) {
        await Certificate.create({ userId, categoryId: topic.category, certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, title: `${category.name} Completion Certificate`, description: `Completed ${category.name}` });
      }
    }
    res.status(200).json({ success: true, message: 'Topic marked as complete', data: progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get quiz by category
export const getQuizByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: 'Invalid category ID' });
    }
    const category = await CourseCategory.findById(categoryId);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    const quizzes = await Quiz.find({ category: category.name }).limit(10);
    res.status(200).json({ success: true, data: quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Submit quiz
export const submitQuiz = async (req, res) => {
  try {
    console.log("REQ BODY", req.body);
    const { quizId, selectedAnswer } = req.body;

    if (!quizId || selectedAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message: "quizId and selectedAnswer required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID"
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    const isCorrect =
      Number(selectedAnswer) ===
      Number(quiz.correctAnswer);

    const attempt =
      await QuizAttempt.create({
        userId: req.user._id,
        quizId,
        selectedAnswer,
        isCorrect
      });

    res.status(200).json({
      success: true,
      isCorrect,
      correctAnswer: quiz.correctAnswer,
      attempt
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get progress
export const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await UserTopicProgress.find({ userId });
    res.status(200).json({ success: true, data: progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ success: true, data: courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Helper for leaderboard data
const getLeaderboardData = async () => {
  const allProgress = await UserTopicProgress.aggregate([
    { $group: { _id: '$userId', completedTopics: { $sum: { $cond: ['$completed', 1, 0] } } } },
    { $sort: { completedTopics: -1 } },
    { $limit: 20 }
  ]);
  const userIds = allProgress.map(p => p._id);
  const users = await User.find({ _id: { $in: userIds } });
  return allProgress.map((p, i) => ({
    rank: i + 1,
    name: users.find(u => u._id.toString() === p._id.toString())?.fullName || 'Anonymous',
    points: p.completedTopics * 10,
    courses: Math.floor(p.completedTopics / 8),
    badges: Math.floor(p.completedTopics / 10)
  }));
};

const getContinueLearningData = async (userId) => {
  const lastProgress = await UserTopicProgress.findOne({ userId }).sort({ updatedAt: -1 }).populate('topicId');
  if (lastProgress && lastProgress.topicId) {
    const topic = lastProgress.topicId;
    const category = await CourseCategory.findById(topic.category);
    return { topicId: topic._id, topicTitle: topic.title, categoryName: category?.name, progress: lastProgress.progress, thumbnail: '📚' };
  }
  return null;
};

// Learning stats
export const getLearningStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const progress = await getUserProgress(userId);
    res.status(200).json({ success: true, data: progress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const leaderboardData = await getLeaderboardData();
    res.status(200).json({ success: true, data: leaderboardData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
