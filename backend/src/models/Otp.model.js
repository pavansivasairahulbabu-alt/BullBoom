import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: [true, 'OTP is required'],
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration time is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Create index to automatically delete expired OTPs after 5 minutes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
