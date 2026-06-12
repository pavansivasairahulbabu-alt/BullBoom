import express from 'express';
import { 
  signupUser, 
  loginUser, 
  sendOtp, 
  verifyOtp,
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
  resetPassword,
  validateToken
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Send OTP route
router.post('/send-otp', sendOtp);

// Verify OTP route
router.post('/verify-otp', verifyOtp);

// Forgot Password - Send OTP
router.post('/forgot-password', sendForgotPasswordOtp);

// Forgot Password - Verify OTP
router.post('/verify-forgot-otp', verifyForgotPasswordOtp);

// Reset Password
router.post('/reset-password', resetPassword);

// Signup route
router.post('/signup', signupUser);

// Login route
router.post('/login', loginUser);

// Validate token
router.get('/validate', protect, validateToken);

export default router;
