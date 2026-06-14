import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaGoogle,
  FaTelegram,
  FaChartLine,
  FaStar,
  FaRedo
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { authApi } from '../../services/api';

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  const otpInputs = useRef([]);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    // Validate basic fields
    if (!fullName || !email || !phone || !password || !confirmPassword || !termsAccepted) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (phone.length < 10) {
      setError('Phone number must be at least 10 digits');
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.sendOtp(email);
      // Move to OTP step
      setStep(2);
      setCountdown(59);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      await authApi.sendOtp(email);

      setCountdown(59);
      setOtp(['', '', '', '', '', '']);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const enteredOtp = otp.join('');

    if (enteredOtp.length < 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);

    try {
      await authApi.verifyOtp(email, enteredOtp);
      setOtpVerified(true);
      setTimeout(() => {
        setStep(3);
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      const data = await authApi.signup({
        fullName,
        email,
        phone,
        password,
      });

      // Store token and user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white font-sans overflow-hidden relative">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 opacity-30">
        {/* Floating Particles */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-[#32CD32] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Glowing Orbs */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#32CD32]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#39FF14]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 max-[500px]:p-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl w-full"
        >
          {/* Back to Home Button */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all group max-[500px]:mb-4"
          >
            <FaArrowLeft className="w-4 h-4 text-[#B8C0D4] group-hover:text-white transition-colors" />
            <span className="text-sm text-[#B8C0D4] group-hover:text-white transition-colors">Back to Home</span>
          </Link>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel - Showcase */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-[#32CD32]/20 rounded-3xl p-8 shadow-[0_0_60px_rgba(50,205,50,0.1)] hidden lg:block"
            >
              {/* Logo & Illustration */}
              <div className="relative mb-8">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B1220] to-[#050816] border border-white/10 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="/BullBoom.jpeg"
                      alt="Bull Boom"
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-[#32CD32] to-[#39FF14] bg-clip-text text-transparent">
                        Bull Boom
                      </h2>
                      <p className="text-xs text-[#B8C0D4]">Trading Education Platform</p>
                    </div>
                  </div>

                  {/* Animated Candlestick Chart */}
                  <div className="mt-4">
                    <div className="flex items-end gap-1 h-28">
                      {[30, 50, 40, 70, 55, 85, 65, 95, 80, 100].map((height, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-[#32CD32] to-[#39FF14] rounded-t-sm"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.6 + i * 0.05, delay: 0.4 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h3 className="text-3xl sm:text-4xl font-black mb-3">Start Your Trading Journey</h3>
                <p className="text-[#B8C0D4] text-lg">
                  Join thousands of traders using smart risk management, advanced market insights, and comprehensive education to improve their trading skills.
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  // { value: "25K+", label: "Registered Traders" },
                  // { value: "1M+", label: "Trades Analyzed" },
                  // { value: "95%", label: "AI Accuracy" },
                  // { value: "₹100Cr+", label: "Trading Volume" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#32CD32]/30 hover:bg-[#32CD32]/5 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  >
                    <div className="text-xl sm:text-2xl font-black bg-gradient-to-r from-[#32CD32] to-[#39FF14] bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm text-[#B8C0D4] mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  "Trade Tracking & Journaling",
                  "Smart Market Watchlists",
                  "Risk Management Tools",
                  "Trading Psychology Insights",
                  "Options Learning Hub",
                  "Premium Trading Signals",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <FaCheck className="text-[#32CD32] w-4 h-4 flex-shrink-0" />
                    <span className="text-[#B8C0D4]">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="bg-gradient-to-r from-[#32CD32]/10 to-[#39FF14]/10 border border-[#32CD32]/20 rounded-2xl p-5">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-[#FFD700] w-4 h-4" />
                  ))}
                </div>
                <p className="text-sm italic mb-3 text-[#B8C0D4]">
                  "Bull Boom transformed my trading discipline and helped me improve my win rate significantly."
                </p>
                <div className="text-xs text-[#32CD32] font-semibold">
                  Professional Trader
                </div>
              </div>
            </motion.div>

            {/* Right Panel - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-[#32CD32]/20 rounded-3xl p-8 shadow-[0_0_60px_rgba(50,205,50,0.1)] max-[500px]:p-5 max-[500px]:rounded-2xl"
            >
              {/* Header */}
              <div className="text-center mb-8 max-[500px]:mb-6">
                <h3 className="text-xl font-bold mb-1 max-[500px]:text-lg">
                  {step === 1 ? "Create Account" : step === 2 ? "Verify Email" : "Success!"}
                </h3>
                <p className="text-[#B8C0D4] text-sm max-[500px]:text-xs">
                  {step === 1
                    ? "Join Bull Boom and start trading smarter today"
                    : step === 2
                    ? "We sent a 6 digit OTP to your email"
                    : "Your account is ready!"}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm max-[500px]:mb-3 max-[500px]:p-3 max-[500px]:text-xs">
                  {error}
                </div>
              )}

              {/* Step 1: Registration Form */}
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-5 max-[500px]:space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all max-[500px]:px-3 max-[500px]:py-3 max-[500px]:rounded-lg">
                      <FaUser className="text-[#32CD32] w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50 max-[500px]:text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all max-[500px]:px-3 max-[500px]:py-3 max-[500px]:rounded-lg">
                      <FaEnvelope className="text-[#32CD32] w-4 h-4" />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50 max-[500px]:text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <div className="flex gap-3 max-[500px]:gap-2">
                      <div className="flex items-center gap-2 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 max-[500px]:px-2 max-[500px]:py-3 max-[500px]:rounded-lg">
                        <span className="text-base max-[500px]:text-sm">🇮🇳</span>
                        <select className="bg-transparent text-white outline-none text-sm max-[500px]:text-xs">
                          <option>+91</option>
                        </select>
                      </div>
                      <div className="flex-1 flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all max-[500px]:px-3 max-[500px]:py-3 max-[500px]:rounded-lg">
                        <FaPhone className="text-[#32CD32] w-4 h-4 max-[500px]:w-3 max-[500px]:h-3" />
                        <input
                          type="tel"
                          placeholder="Enter your mobile number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50 max-[500px]:text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all max-[500px]:px-3 max-[500px]:py-3 max-[500px]:rounded-lg">
                      <FaLock className="text-[#32CD32] w-4 h-4" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50 max-[500px]:text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[#B8C0D4] hover:text-white transition-colors"
                      >
                        {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all max-[500px]:px-3 max-[500px]:py-3 max-[500px]:rounded-lg">
                      <FaLock className="text-[#32CD32] w-4 h-4" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50 max-[500px]:text-sm"
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

                  {/* Referral Code */}
                  {/* <div className="space-y-2">
                    <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all">
                      <FaGift className="text-[#32CD32] w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Enter referral code (optional)"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
                      />
                    </div>
                  </div> */}

                  {/* Terms Checkbox */}
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-[#050816] text-[#32CD32] focus:ring-[#32CD32] focus:ring-offset-0 mt-0.5"
                    />
                    <label className="text-sm text-[#B8C0D4] cursor-pointer max-[500px]:text-xs">
                      I agree to the <a href="#" className="text-[#32CD32] hover:underline">Terms & Conditions</a> and <a href="#" className="text-[#32CD32] hover:underline">Privacy Policy</a>
                    </label>
                  </div>

                  {/* Send OTP Button */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(50,205,50,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={!termsAccepted || loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed max-[500px]:py-3 max-[500px]:text-base max-[500px]:rounded-lg"
                  >
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </motion.button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <div className="space-y-6 max-[500px]:space-y-5">
                  {/* OTP Inputs */}
                  <div className="flex justify-center gap-2 sm:gap-3 max-[500px]:gap-1.5">
                    {otp.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(el) => (otpInputs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 bg-[#050816] outline-none transition-all max-[500px]:w-10 max-[500px]:h-12 max-[500px]:text-lg max-[500px]:rounded-lg ${
                          otpVerified ? 'border-[#32CD32] text-[#32CD32]' : 'border-white/10 text-white focus:border-[#32CD32] focus:shadow-[0_0_20px_rgba(50,205,50,0.2)]'
                        }`}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  {/* Success Checkmark Animation */}
                  {otpVerified && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="flex justify-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#32CD32] to-[#39FF14] flex items-center justify-center shadow-[0_0_30px_rgba(50,205,50,0.4)] max-[500px]:w-12 max-[500px]:h-12">
                        <FaCheck className="text-[#050816] w-8 h-8 max-[500px]:w-6 max-[500px]:h-6" />
                      </div>
                    </motion.div>
                  )}

                  {/* Countdown & Resend */}
                  <div className="flex flex-col items-center gap-2">
                    {countdown > 0 ? (
                      <p className="text-[#B8C0D4] text-sm max-[500px]:text-xs">
                        Resend OTP in <span className="text-[#32CD32] font-bold">00:{countdown.toString().padStart(2, '0')}</span>
                      </p>
                    ) : (
                      <button
                        onClick={handleResendOtp}
                        disabled={loading}
                        className="text-[#32CD32] hover:text-[#39FF14] font-medium text-sm flex items-center gap-1 transition-colors disabled:opacity-50 max-[500px]:text-xs"
                      >
                        <FaRedo className="w-3 h-3" />
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-3 max-[500px]:gap-2">
                    {!otpVerified && (
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(50,205,50,0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleVerifyOtp}
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed max-[500px]:py-3 max-[500px]:text-base max-[500px]:rounded-lg"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </motion.button>
                    )}

                    <button
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium transition-all hover:bg-white/10 disabled:opacity-50 max-[500px]:py-3 max-[500px]:text-sm max-[500px]:rounded-lg"
                    >
                      Back
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Success & Create Account */}
              {step === 3 && (
                <div className="flex flex-col items-center space-y-6 max-[500px]:space-y-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-[#32CD32] to-[#39FF14] flex items-center justify-center shadow-[0_0_40px_rgba(50,205,50,0.4)] max-[500px]:w-16 max-[500px]:h-16"
                  >
                    <FaCheck className="text-[#050816] w-10 h-10 max-[500px]:w-8 max-[500px]:h-8" />
                  </motion.div>

                  <div className="text-center">
                    <h4 className="text-2xl font-bold mb-2 max-[500px]:text-xl">Email Verified!</h4>
                    <p className="text-[#B8C0D4] max-[500px]:text-sm">
                      Your email has been verified successfully
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(50,205,50,0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSignup}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed max-[500px]:py-3 max-[500px]:text-base max-[500px]:rounded-lg"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </motion.button>
                </div>
              )}

              {/* Divider - Only show on step 1 */}
              {step === 1 && (
                <>
                  {/* <div className="my-8 flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-sm text-[#B8C0D4]">OR</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div> */}

                  {/* Social Login */}
                  {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <motion.button
                      whileHover={{ borderColor: "rgba(50,205,50,0.5)", backgroundColor: "rgba(255,255,255,0.05)" }}
                      className="flex items-center justify-center gap-2 py-4 rounded-xl border border-white/10 transition-all"
                    >
                      <FaGoogle className="w-5 h-5" />
                      <span className="font-medium">Continue with Google</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ borderColor: "rgba(50,205,50,0.5)", backgroundColor: "rgba(255,255,255,0.05)" }}
                      className="flex items-center justify-center gap-2 py-4 rounded-xl border border-white/10 transition-all"
                    >
                      <FaTelegram className="w-5 h-5" />
                      <span className="font-medium">Continue with Telegram</span>
                    </motion.button>
                  </div> */}
                </>
              )}

              {/* Sign In Link */}
              <div className="text-center mt-6 max-[500px]:mt-5">
                <span className="text-[#B8C0D4] max-[500px]:text-sm">Already have an account? </span>
                <Link to="/login" className="text-[#32CD32] font-semibold hover:underline max-[500px]:text-sm">
                  Sign In
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
