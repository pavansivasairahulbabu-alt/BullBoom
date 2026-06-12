import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('[AUTH] Received token:', token.substring(0, 20) + '...');

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[AUTH] Decoded token:', decoded);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      console.log('[AUTH] Found user:', req.user ? req.user._id : 'NOT FOUND');

      // Check if user exists
      if (!req.user) {
        console.log('[AUTH] User not found, returning 401');
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
        });
      }

      // User exists, proceed
      next();
    } catch (error) {
      console.error('[AUTH] Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }
  } else {
    console.log('[AUTH] No token provided');
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
};
