import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    username: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    referralCode: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    tradingExperience: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
      default: 'Beginner',
    },
    riskProfile: {
      type: String,
      enum: ['Low Risk', 'Moderate Risk', 'High Risk', 'Aggressive'],
      default: 'Moderate Risk',
    },
    membership: {
      type: String,
      enum: ['Free', 'Basic', 'Premium', 'Pro'],
      default: 'Free',
    },
    virtualBalance: { type: Number, default: 1500000, min: 0 }, // ₹15L virtual capital
    investedAmount: { type: Number, default: 0, min: 0 },
    availableBalance: { type: Number, default: 1500000, min: 0 },
    portfolioValue: { type: Number, default: 1500000 },
    totalPnL: { type: Number, default: 0 },
    realizedPnL: { type: Number, default: 0 },
    unrealizedPnL: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for profile completion
userSchema.virtual('profileCompletion').get(function () {
  let completed = 0;
  const total = 7; // removed pan number, so total steps 7 now

  if (this.profileImage && this.profileImage !== '') completed++;
  if (this.fullName && this.fullName.trim() !== '') completed++;
  if (this.username && this.username.trim() !== '') completed++;
  if (this.phone && this.phone.trim() !== '') completed++;
  if (this.location && this.location.trim() !== '') completed++;
  if (this.tradingExperience && this.tradingExperience !== '') completed++;
  if (this.riskProfile && this.riskProfile !== '') completed++;

  return Math.round((completed / total) * 100);
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
