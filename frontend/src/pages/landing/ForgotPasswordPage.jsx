import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaRedo,
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const otpInputs = useRef([]);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Password strength indicator
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }
      setStep(2);
      setCountdown(59);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setError('');
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter complete OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-forgot-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'OTP verification failed');
      }
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    setError('');
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join(''), newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }
      setCountdown(59);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans overflow-hidden relative">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-30">
        {/* Floating Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#32CD32] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
        {/* Glowing Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#32CD32]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#39FF14]/10 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          {/* Back to Home Button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
          >
            <FaArrowLeft className="w-4 h-4 text-[#B8C0D4] group-hover:text-white transition-colors" />
            <span className="text-sm text-[#B8C0D4] group-hover:text-white transition-colors">Back to Login</span>
          </Link>

          {/* Forgot Password Card */}
          <motion.div
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-[#32CD32]/20 rounded-3xl p-8 shadow-[0_0_60px_rgba(50,205,50,0.1)]"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold mb-1">
                {step === 1
                  ? 'Forgot Password'
                  : step === 2
                  ? 'Verify OTP'
                  : step === 3
                  ? 'Reset Password'
                  : 'Success'}
              </h3>
              <p className="text-[#B8C0D4] text-sm">
                {step === 1
                  ? 'Enter your email to receive OTP'
                  : step === 2
                  ? 'Enter the 6-digit code sent to your email'
                  : step === 3
                  ? 'Create your new password'
                  : 'Your password has been reset successfully'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all">
                    <FaEnvelope className="text-[#32CD32] w-4 h-4" />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
                      required
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(50,205,50,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </motion.button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-center gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 bg-[#050816] outline-none transition-all border-white/10 text-white focus:border-[#32CD32] focus:shadow-[0_0_20px_rgba(50,205,50,0.2)]"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <div className="flex flex-col items-center gap-2">
                  {countdown > 0 ? (
                    <p className="text-[#B8C0D4] text-sm">
                      Resend OTP in <span className="text-[#32CD32] font-bold">00:{countdown.toString().padStart(2, '0')}</span>
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-[#32CD32] hover:text-[#39FF14] font-medium text-sm flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <FaRedo className="w-3 h-3" />
                      Resend OTP
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(50,205,50,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </motion.button>
                  <button
                    onClick={() => setStep(1)}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium transition-all hover:bg-white/10 disabled:opacity-50"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Reset Password */}
            {step === 3 && (
              <div className="space-y-6">
                {/* New Password */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all">
                    <FaLock className="text-[#32CD32] w-4 h-4" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[#B8C0D4] hover:text-white transition-colors"
                    >
                      {showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-white/10'}`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength > 0 ? 'text-[#32CD32]' : 'text-[#B8C0D4]'}`}>
                        {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : ''}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all">
                    <FaLock className="text-[#32CD32] w-4 h-4" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-[#B8C0D4] hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(50,205,50,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password'}
                  </motion.button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium transition-all hover:bg-white/10 disabled:opacity-50"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success Screen */}
            {step === 4 && (
              <div className="flex flex-col items-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#32CD32] to-[#39FF14] flex items-center justify-center shadow-[0_0_40px_rgba(50,205,50,0.4)]"
                >
                  <FaCheck className="text-[#050816] w-10 h-10" />
                </motion.div>
                <div className="text-center">
                  <h4 className="text-2xl font-bold mb-2">Password Reset Successfully</h4>
                  <p className="text-[#B8C0D4]">
                    Your password has been updated. You can now login with your new password.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(50,205,50,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all"
                >
                  Go To Login
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
