import User from '../models/User.model.js';
import cloudinary from '../../config/cloudinary.js';

// @desc    Get logged-in user profile
// @route   GET /api/user/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    // User is already attached to req.user by protect middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, phone, location, tradingExperience, riskProfile } = req.body;

    // Validate inputs
    if (fullName && fullName.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 3 characters',
      });
    }
    if (phone && phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be at least 10 digits',
      });
    }

    // Check if phone is already taken by another user
    if (phone && phone !== req.user.phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists',
        });
      }
    }

    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already exists',
        });
      }
    }

    // Update user (DO NOT update profileImage here)
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(fullName && { fullName }),
        ...(username && { username }),
        ...(phone && { phone }),
        ...(location !== undefined && { location }),
        ...(tradingExperience && { tradingExperience }),
        ...(riskProfile && { riskProfile }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Upload profile image
// @route   POST /api/user/upload-profile
// @access  Private
export const uploadProfileImage = async (req, res) => {
  try {
    console.log('📤 Uploading profile image...');
    
    if (!req.file) {
      console.log("REQ.FILE =", req.file);
      console.log('❌ No file uploaded');
      return res.status(400).json({
        success: false,
        message: 'Please upload an image',
      });
    }

    console.log('✅ Cloudinary Upload Success');
    console.log('Image URL:', req.file.path);

    // Update user with new profile image URL
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: req.file.path },
      { new: true }
    ).select('-password');

    console.log('✅ MongoDB User Updated');
    console.log('✅ Profile Image URL Saved:', req.file.path);

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl: req.file.path,
      user: updatedUser,
    });
  } catch (error) {
  console.error('====================');
  console.error(error);
  console.error(error.message);
  console.error(error.stack);
  console.error('====================');
    
    // Handle specific errors
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.message.includes('File too large')) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    // Delete user profile image from Cloudinary if exists
    if (req.user.profileImage) {
      try {
        // Extract public_id from Cloudinary URL
        const parts = req.user.profileImage.split('/');
        const folderIndex = parts.indexOf('bullboom');
        const publicIdWithFolder = parts.slice(folderIndex).join('/').split('.')[0];
        
        console.log('🗑️ Deleting image from Cloudinary:', publicIdWithFolder);
        
        await cloudinary.uploader.destroy(publicIdWithFolder);
        console.log('✅ Cloudinary Image Deleted');
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with account deletion even if image deletion fails
      }
    }

    // Delete user from database
    await User.findByIdAndDelete(req.user._id);
    console.log('✅ User Deleted from MongoDB');

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
