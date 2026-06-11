import express from 'express';
import {
  getAllCourses,
  getDashboard,
  getCategories,
  getCategory,
  getTopic,
  markTopicComplete,
  getQuizByCategory,
  submitQuiz,
  getProgress,
  getLearningStats,
  getLeaderboard
} from '../controllers/educationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/categories', getCategories);
router.get('/leaderboard', getLeaderboard);

// Protected routes
router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/categories', getCategories);
router.get('/category/:id', getCategory);
router.get('/topic/:id', getTopic);
router.post('/topic/complete', markTopicComplete);
router.get('/quiz/:categoryId', getQuizByCategory);
router.post('/quiz/submit', submitQuiz);
router.get('/progress', getProgress);
router.get('/stats', getLearningStats);
router.get('/courses', getAllCourses);

export default router;
