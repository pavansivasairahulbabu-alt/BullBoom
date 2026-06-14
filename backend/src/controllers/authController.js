import User from "../models/User.model.js";
import Otp from "../models/Otp.model.js";
import Watchlist from "../models/Watchlist.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateOtp } from "../utils/generateOtp.js";
import {
  sendOtpEmail,
  sendForgotPasswordOtpEmail,
} from "../services/emailService.js";
import mongoose from "mongoose";
import { OAuth2Client } from "google-auth-library";
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Validate token
export const validateToken = async (req, res) => {
  try {
    // Token is already validated by protect middleware and user is in req.user
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Validate token error:", error);
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

// Send OTP
export const sendOtp = async (req, res) => {
  try {
    console.log("STEP 1: Request received");

    const { email } = req.body;
    console.log("STEP 2:", email);
    console.log("Mongo State:", mongoose.connection.readyState);
    await Otp.deleteMany({ email });
    console.log("STEP 3: Old OTP deleted");

    const otp = generateOtp();
    console.log("STEP 4: OTP generated", otp);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({
      email,
      otp,
      expiresAt,
    });
    console.log("STEP 5: OTP saved in DB");

    await sendOtpEmail(email, otp);
    console.log("STEP 6: Email sent");

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("FULL ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find OTP record
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // OTP is valid, delete it to prevent reuse
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Signup user
export const signupUser = async (req, res) => {
  try {
    let {
      fullName,
      email,
      phone,
      password,
      referralCode,
      otp,
      tradingExperience,
      riskProfile,
    } = req.body;

    // Basic validations
    if (!fullName) {
      return res.status(400).json({
        success: false,
        message: "Full name is required",
      });
    }
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Validate phone length
    if (phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be at least 10 digits",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check if user already exists by email
    const existingUserEmail = await User.findOne({ email });
    if (existingUserEmail) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Check if user already exists by phone
    const existingUserPhone = await User.findOne({ phone });
    if (existingUserPhone) {
      return res.status(409).json({
        success: false,
        message: "User with this phone number already exists",
      });
    }

    // Handle empty strings for tradingExperience and riskProfile
    if (!tradingExperience || tradingExperience.trim() === "") {
      tradingExperience = "Beginner";
    } else {
      // Validate enum
      const validTradingExperiences = [
        "Beginner",
        "Intermediate",
        "Advanced",
        "Professional",
      ];
      if (!validTradingExperiences.includes(tradingExperience)) {
        return res.status(400).json({
          success: false,
          message: "Invalid trading experience value",
        });
      }
    }

    if (!riskProfile || riskProfile.trim() === "") {
      riskProfile = "Moderate Risk";
    } else {
      // Validate enum
      const validRiskProfiles = [
        "Low Risk",
        "Moderate Risk",
        "High Risk",
        "Aggressive",
      ];
      if (!validRiskProfiles.includes(riskProfile)) {
        return res.status(400).json({
          success: false,
          message: "Invalid risk profile value",
        });
      }
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      referralCode,
      tradingExperience,
      riskProfile,
      isVerified: true, // Mark as verified since OTP was verified
    });

    // Add default watchlist items for new user
    const defaultSymbols = ["NIFTY", "BANKNIFTY", "RELIANCE", "INFY", "TCS"];
    const defaultWatchlistItems = defaultSymbols.map((symbol) => ({
      userId: user._id,
      symbol,
      exchange: "NSE",
    }));
    await Watchlist.insertMany(defaultWatchlistItems);

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    // Validate password is required
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Validate either email or phone is provided
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Email or Phone is required",
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email }, { phone }],
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize wallet fields for old users if missing
    let needsSave = false;
    if (user.virtualBalance === undefined || user.virtualBalance === null) {
      user.virtualBalance = 1500000;
      needsSave = true;
    }
    if (user.availableBalance === undefined || user.availableBalance === null) {
      user.availableBalance = 1500000;
      needsSave = true;
    }
    if (user.investedAmount === undefined || user.investedAmount === null) {
      user.investedAmount = 0;
      needsSave = true;
    }
    if (user.portfolioValue === undefined || user.portfolioValue === null) {
      user.portfolioValue = 1500000;
      needsSave = true;
    }
    if (user.totalPnL === undefined || user.totalPnL === null) {
      user.totalPnL = 0;
      needsSave = true;
    }
    if (user.realizedPnL === undefined || user.realizedPnL === null) {
      user.realizedPnL = 0;
      needsSave = true;
    }
    if (user.unrealizedPnL === undefined || user.unrealizedPnL === null) {
      user.unrealizedPnL = 0;
      needsSave = true;
    }

    if (needsSave) {
      await user.save();
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Send Forgot Password OTP
export const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email });

    // Generate new OTP
    const otp = generateOtp();

    // Calculate expiration time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Create OTP record
    await Otp.create({
      email,
      otp,
      expiresAt,
    });

    // Send OTP email
    await sendForgotPasswordOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Send Forgot Password OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify Forgot Password OTP
export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find OTP record
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // OTP is valid, we don't delete it yet so user can reset password
    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify Forgot Password OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;

    // Validate inputs
    if (!email || !newPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Verify OTP one last time before resetting
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    // Delete OTP record after successful reset
    await Otp.deleteOne({ _id: otpRecord._id });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Google Login
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Check if user already exists with Google ID
    let user = await User.findOne({ googleId });

    if (user) {
      // User exists, log them in
      // Initialize wallet fields for old users if missing
      let needsSave = false;
      if (user.virtualBalance === undefined || user.virtualBalance === null) {
        user.virtualBalance = 1500000;
        needsSave = true;
      }
      if (
        user.availableBalance === undefined ||
        user.availableBalance === null
      ) {
        user.availableBalance = 1500000;
        needsSave = true;
      }
      if (user.investedAmount === undefined || user.investedAmount === null) {
        user.investedAmount = 0;
        needsSave = true;
      }
      if (user.portfolioValue === undefined || user.portfolioValue === null) {
        user.portfolioValue = 1500000;
        needsSave = true;
      }
      if (user.totalPnL === undefined || user.totalPnL === null) {
        user.totalPnL = 0;
        needsSave = true;
      }
      if (user.realizedPnL === undefined || user.realizedPnL === null) {
        user.realizedPnL = 0;
        needsSave = true;
      }
      if (user.unrealizedPnL === undefined || user.unrealizedPnL === null) {
        user.unrealizedPnL = 0;
        needsSave = true;
      }

      if (needsSave) {
        await user.save();
      }

      // Generate token
      const tokenJwt = generateToken(user._id, user.role);

      res.status(200).json({
        success: true,
        message: "Login successful",
        token: tokenJwt,
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    } else {
      // Check if user exists with this email
      let existingUser = await User.findOne({ email });

      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = googleId;
        existingUser.authProvider = "google";
        if (picture && !existingUser.avatar) {
          existingUser.avatar = picture;
        }
        await existingUser.save();

        // Initialize wallet fields for old users if missing
        let needsSave = false;
        if (
          existingUser.virtualBalance === undefined ||
          existingUser.virtualBalance === null
        ) {
          existingUser.virtualBalance = 1500000;
          needsSave = true;
        }
        if (
          existingUser.availableBalance === undefined ||
          existingUser.availableBalance === null
        ) {
          existingUser.availableBalance = 1500000;
          needsSave = true;
        }
        if (
          existingUser.investedAmount === undefined ||
          existingUser.investedAmount === null
        ) {
          existingUser.investedAmount = 0;
          needsSave = true;
        }
        if (
          existingUser.portfolioValue === undefined ||
          existingUser.portfolioValue === null
        ) {
          existingUser.portfolioValue = 1500000;
          needsSave = true;
        }
        if (
          existingUser.totalPnL === undefined ||
          existingUser.totalPnL === null
        ) {
          existingUser.totalPnL = 0;
          needsSave = true;
        }
        if (
          existingUser.realizedPnL === undefined ||
          existingUser.realizedPnL === null
        ) {
          existingUser.realizedPnL = 0;
          needsSave = true;
        }
        if (
          existingUser.unrealizedPnL === undefined ||
          existingUser.unrealizedPnL === null
        ) {
          existingUser.unrealizedPnL = 0;
          needsSave = true;
        }

        if (needsSave) {
          await existingUser.save();
        }

        const tokenJwt = generateToken(existingUser._id, existingUser.role);
        res.status(200).json({
          success: true,
          message: "Login successful",
          token: tokenJwt,
          user: {
            _id: existingUser._id,
            fullName: existingUser.fullName,
            email: existingUser.email,
            phone: existingUser.phone,
            role: existingUser.role,
          },
        });
      } else {
        // Create new user
        const newUser = await User.create({
          googleId,
          authProvider: "google",
          fullName: name,
          email,
          avatar: picture,
          isVerified: true,
        });

        // Add default watchlist items for new user
        const defaultSymbols = [
          "NIFTY",
          "BANKNIFTY",
          "RELIANCE",
          "INFY",
          "TCS",
        ];
        const defaultWatchlistItems = defaultSymbols.map((symbol) => ({
          userId: newUser._id,
          symbol,
          exchange: "NSE",
        }));
        await Watchlist.insertMany(defaultWatchlistItems);

        // Generate token
        const tokenJwt = generateToken(newUser._id, newUser.role);

        res.status(201).json({
          success: true,
          message: "User registered successfully",
          token: tokenJwt,
          user: {
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
          },
        });
      }
    }
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
