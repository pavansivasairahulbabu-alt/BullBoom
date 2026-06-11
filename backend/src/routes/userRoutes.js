import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  deleteAccount,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../../config/multer.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

// Upload profile image
router.post('/upload-profile', upload.single('profileImage'), uploadProfileImage);

// Delete user account
router.delete('/account', deleteAccount);

export default router;
