import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPhone, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaChartLine, FaChevronRight, FaTelegram } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { authApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Email regex to check if identifier is email or phone
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const requestBody = {
        password,
      };

      // Determine if identifier is email or phone
      if (emailRegex.test(identifier)) {
        requestBody.email = identifier;
      } else {
        requestBody.phone = identifier;
      }

      const response = await authApi.login(requestBody);

      if (response.data.success) {
        // Store token and user in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect to dashboard
        navigate('/dashboard');
        toast.success('Login successful!');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const response = await authApi.googleLogin(credentialResponse.credential);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
        toast.success('Login successful!');
      }
    } catch (err) {
      console.error('Google login error:', err);
      toast.error(err.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed. Please try again.');
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
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Glowing Orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#32CD32]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#39FF14]/10 rounded-full blur-3xl" />
        
        {/* Animated Chart Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#32CD32" />
              <stop offset="100%" stopColor="#39FF14" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,500 Q250,300 500,400 T1000,300"
            fill="none"
            stroke="url(#chartLineGradient)"
            strokeWidth="2"
            strokeDasharray="10 5"
            animate={{
              strokeDashoffset: [0, -30],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl w-full"
        >
          {/* Back to Home Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"
      >
            <FaArrowLeft className="w-4 h-4 text-[#B8C0D4] group-hover:text-white transition-colors" />
            <span className="text-sm text-[#B8C0D4] group-hover:text-white transition-colors">Back to Home</span>
          </Link>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-[#32CD32]/20 rounded-3xl p-8 shadow-[0_0_60px_rgba(50,205,50,0.1)] hover:shadow-[0_0_80px_rgba(50,205,50,0.15)] transition-all"
            >
              {/* Logo Image Container */}
              <div className="relative mb-8">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0B1220] to-[#050816] border border-white/10">
                  <img 
                    src="/BullBoom.jpeg" 
                    alt="Bull Boom" 
                    className="w-full h-100 object-cover"
                  />
                  
                  {/* Overlay Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-transparent" />
                  
                  {/* Candlestick Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end gap-1 h-20">
                      {[20, 35, 25, 60, 45, 70, 55, 85, 70, 95].map((height, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-[#32CD32] to-[#39FF14] rounded-t-sm"
                          style={{ height: `${height}%` }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.5 + i * 0.05, delay: 0.3 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Welcome Text */}
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-black mb-3">Welcome Back, Trader</h2>
                <p className="text-[#B8C0D4] text-lg">
                  Continue your trading journey with comprehensive education, smart tracking, and risk management tools.
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "10K+", label: "Active Traders" },
                  { value: "95%", label: "Learner Success" },
                  { value: "₹50Cr+", label: "Trades Analyzed" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="text-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#32CD32]/30 hover:bg-[#32CD32]/5 transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                  >
                    <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#32CD32] to-[#39FF14] bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-[#B8C0D4] mt-1">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Panel - Login Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-[#32CD32]/20 rounded-3xl p-8 shadow-[0_0_60px_rgba(50,205,50,0.1)]"
            >
              {/* Header */}
              <div className="text-center mb-8">
                {/* <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#32CD32] to-[#39FF14] flex items-center justify-center">
                    <FaChartLine className="text-[#050816] w-5 h-5" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-[#32CD32] to-[#39FF14] bg-clip-text text-transparent">
                    Bull Boom
                  </span>
                </div> */}
                <h3 className="text-xl font-bold mb-1">Sign In</h3>
                <p className="text-[#B8C0D4] text-sm">Access your trading education and practice dashboard</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Phone/Email */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all">
                    <div className="flex gap-1.5">
                      <FaPhone className="text-[#32CD32] w-4 h-4" />
                      <FaEnvelope className="text-[#32CD32] w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter phone number or email"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-[#050816] border border-white/10 focus-within:border-[#32CD32]/50 focus-within:shadow-[0_0_20px_rgba(50,205,50,0.15)] transition-all">
                    <FaLock className="text-[#32CD32] w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
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

                {/* Options */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 bg-[#050816] text-[#32CD32] focus:ring-[#32CD32] focus:ring-offset-0"
                    />
                    <span className="text-sm text-[#B8C0D4]">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-[#32CD32] hover:underline">
                    Forgot Password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(50,205,50,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-[#B8C0D4]">OR</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Google Login */}
              {googleClientId ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  render={(renderProps) => (
                    <motion.button
                      onClick={renderProps.onClick}
                      disabled={renderProps.disabled || loading}
                      whileHover={!loading ? { scale: 1.02, boxShadow: '0 0 40px rgba(57,255,20,0.25)' } : {}}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-green-500/30 bg-[#0B1220] text-white hover:border-green-400 hover:bg-white/5 transition-all duration-300"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-400 rounded-full animate-spin" />
                          <span className="font-medium">Connecting to Google...</span>
                        </>
                      ) : (
                        <>
                          <FaGoogle className="w-5 h-5" />
                          <span className="font-medium">Continue with Google</span>
                        </>
                      )}
                    </motion.button>
                  )}
                />
              ) : (
                <motion.button
                  onClick={() => toast.info('Google Login is currently being configured.')}
                  whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(57,255,20,0.25)' }}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-green-500/30 bg-[#0B1220] text-white hover:border-green-400 hover:bg-white/5 transition-all duration-300 cursor-pointer"
                >
                  <FaGoogle className="w-5 h-5" />
                  <span className="font-medium">Continue with Google</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ borderColor: "rgba(50,205,50,0.5)", backgroundColor: "rgba(255,255,255,0.05)" }}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-white/10 transition-all"
              >
                <FaTelegram className="w-5 h-5" />
                <span className="font-medium">Continue with Telegram</span>
              </motion.button>
              {/* Create Account Link */}
              <div className="text-center mt-8 mb-6">
                <span className="text-[#B8C0D4]">Don't have an account? </span>
                <Link to="/signup" className="text-[#32CD32] font-semibold hover:underline inline-flex items-center gap-1">
                  Create Account <FaChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Footer Text */}
              <div className="text-center text-xs text-[#B8C0D4]/60">
                By signing in, you agree to our Terms & Conditions and Privacy Policy
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
