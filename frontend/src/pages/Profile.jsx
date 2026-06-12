import { useState, useEffect } from "react";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaCamera,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaTrash,
  FaTrophy,
  FaChartLine,
  FaCalendar,
  FaTrendingUp,
  FaShield,
} from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Progress ring component
const ProgressRing = ({ percentage }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#32CD32" />
            <stop offset="100%" stopColor="#39FF14" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{percentage}%</span>
        <span className="text-[10px] text-[#94a3b8]">Complete</span>
      </div>
    </div>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    phone: "",
    location: "",
    tradingExperience: "",
    riskProfile: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch user profile and dashboard stats on mount
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, dashboardRes] = await Promise.all([
        api.get("/user/profile"),
        api.get("/user/dashboard"),
      ]);

      if (profileRes.data.success) {
        setUser(profileRes.data.user);
        setEditForm({
          fullName: profileRes.data.user.fullName || "",
          username: profileRes.data.user.username || "",
          phone: profileRes.data.user.phone || "",
          location: profileRes.data.user.location || "",
          tradingExperience: profileRes.data.user.tradingExperience || "",
          riskProfile: profileRes.data.user.riskProfile || "",
        });
      }

      if (dashboardRes.data.success) {
        setDashboardData(dashboardRes.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Profile completion checklist
  const getProfileCompletionSteps = () => {
    return [
      {
        id: 1,
        label: "Upload Profile Photo",
        completed: user?.profileImage && user.profileImage !== "",
      },
      {
        id: 2,
        label: "Add Full Name",
        completed: user?.fullName && user.fullName.trim() !== "",
      },
      {
        id: 3,
        label: "Add Username",
        completed: user?.username && user.username.trim() !== "",
      },
      {
        id: 4,
        label: "Add Phone Number",
        completed: user?.phone && user.phone.trim() !== "",
      },
      {
        id: 5,
        label: "Add Location",
        completed: user?.location && user.location.trim() !== "",
      },
      {
        id: 6,
        label: "Add Trading Experience",
        completed: user?.tradingExperience && user.tradingExperience !== "",
      },
      {
        id: 7,
        label: "Add Risk Profile",
        completed: user?.riskProfile && user.riskProfile !== "",
      },
    ];
  };

  const profileCompletionSteps = getProfileCompletionSteps();
  const completedSteps = profileCompletionSteps.filter(
    (s) => s.completed,
  ).length;
  const completionPercentage = Math.round(
    (completedSteps / profileCompletionSteps.length) * 100
  );

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await api.post("/user/upload-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setUser(response.data.user);
        toast.success("Profile image updated");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Upload failed");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle edit profile save
  const handleEditSave = async () => {
    try {
      const response = await api.put("/user/profile", editForm);
      if (response.data.success) {
        setUser(response.data.user);
        setIsEditModalOpen(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      await api.delete("/user/account");
      localStorage.removeItem("token");
      navigate("/login");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-[#39FF14] text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-8 pb-24 md:pb-8 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#39FF14] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -25, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{
              duration: 3.5 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#081225] border border-[#1a2b45] rounded-3xl p-6 md:p-8 relative overflow-hidden"
        >
          {/* Decorative gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#39FF14]/10 to-transparent rounded-full blur-3xl" />

          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start relative z-10">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#39FF14]/20 cursor-pointer hover:border-[#39FF14] transition-all group"
                  onClick={() =>
                    document.getElementById("profile-image-input").click()
                  }
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#081225] to-[#1a2b45] flex items-center justify-center">
                      <FaUser className="text-5xl text-[#94a3b8]" />
                    </div>
                  )}
                </div>
                <div
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#39FF14] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform group-hover:animate-pulse"
                  onClick={() =>
                    document.getElementById("profile-image-input").click()
                  }
                >
                  <FaCamera className="text-[#020617] text-sm" />
                </div>
              </div>
              <input
                type="file"
                id="profile-image-input"
                accept="image/jpg,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
              {isUploading && (
                <span className="text-sm text-[#94a3b8] mt-2">Uploading...</span>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col items-center lg:items-start gap-2 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {user?.fullName || "Full Name"}
                </h1>
                <div className="flex items-center gap-3 flex-wrap justify-center lg:justify-start">
                  {user?.username && (
                    <span className="text-[#94a3b8] font-medium">
                      @{user.username}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30 rounded-full text-[#FFD700] text-sm font-semibold">
                    {user?.membership || "Bronze Member"}
                  </span>
                  {user?.tradingExperience && (
                    <span className="px-3 py-1 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-full text-[#39FF14] text-sm font-semibold">
                      {user.tradingExperience}
                    </span>
                  )}
                  {user?.riskProfile && (
                    <span className="px-3 py-1 bg-[#00BFFF]/10 border border-[#00BFFF]/30 rounded-full text-[#00BFFF] text-sm font-semibold">
                      {user.riskProfile}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-[#94a3b8] mb-6 max-w-2xl">
                {user?.location ? `Trader from ${user.location}` : "Start your trading journey today"}
              </p>

              {/* Portfolio Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="bg-[#020617] border border-[#1a2b45] rounded-2xl p-4">
                  <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Total Trades</div>
                  <div className="text-2xl font-bold text-white">
                    {dashboardData?.totalTrades || 0}
                  </div>
                </div>
                <div className="bg-[#020617] border border-[#1a2b45] rounded-2xl p-4">
                  <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-[#39FF14]">
                    {dashboardData?.winRate || 0}%
                  </div>
                </div>
                <div className="bg-[#020617] border border-[#1a2b45] rounded-2xl p-4">
                  <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Profit/Loss</div>
                  <div className="text-2xl font-bold text-[#39FF14]">
                    ₹{dashboardData?.totalPnL?.toLocaleString() || "0"}
                  </div>
                </div>
                <div className="bg-[#020617] border border-[#1a2b45] rounded-2xl p-4">
                  <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-1">Member Since</div>
                  <div className="text-lg font-semibold text-white">
                    {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="flex flex-col items-center gap-4 bg-[#020617] border border-[#1a2b45] rounded-2xl p-6 min-w-[200px]">
              <ProgressRing percentage={completionPercentage} />
              <div className="text-center">
                <div className="text-lg font-bold text-white mb-1">
                  {completedSteps}/{profileCompletionSteps.length} Steps
                </div>
                <div className="w-full h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-[#32CD32] to-[#39FF14]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="mt-8 flex gap-3 flex-wrap justify-center lg:justify-end">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#020617] font-bold hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all"
            >
              <FaEdit className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/10 border border-red-400/30 text-red-400 font-semibold hover:bg-red-500/20 transition-all"
            >
              <FaTrash className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#081225] border border-[#1a2b45] rounded-3xl p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaUser className="text-[#39FF14]" />
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[#94a3b8] text-sm uppercase tracking-wider">Full Name</span>
                  <div className="text-white font-semibold text-lg">
                    {user?.fullName || "Not set"}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[#94a3b8] text-sm uppercase tracking-wider">Username</span>
                  <div className="text-white font-semibold text-lg">
                    {user?.username ? `@${user.username}` : "Not set"}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[#94a3b8] text-sm uppercase tracking-wider">Email</span>
                  <div className="text-white font-semibold text-lg">
                    {user?.email}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[#94a3b8] text-sm uppercase tracking-wider">Phone</span>
                  <div className="text-white font-semibold text-lg">
                    {user?.phone || "Not set"}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[#94a3b8] text-sm uppercase tracking-wider">Location</span>
                  <div className="text-white font-semibold text-lg">
                    {user?.location || "Not set"}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[#94a3b8] text-sm uppercase tracking-wider">Member Since</span>
                  <div className="text-white font-semibold text-lg">
                    {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#081225] border border-[#1a2b45] rounded-3xl p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaCalendar className="text-[#39FF14]" />
                Recent Activity
              </h2>

              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    icon: FaCheckCircle,
                    title: "Profile Updated",
                    time: "Just now",
                  },
                  {
                    id: 2,
                    icon: FaTrophy,
                    title: "Completed Learning Module",
                    time: "Yesterday",
                  },
                  {
                    id: 3,
                    icon: FaTrendingUp,
                    title: "First Trade Executed",
                    time: "2 days ago",
                  },
                  {
                    id: 4,
                    icon: FaShield,
                    title: "Account Created",
                    time: user?.createdAt ? formatDate(user.createdAt) : "N/A",
                  },
                ].map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-[#020617] border border-[#1a2b45] hover:border-[#39FF14]/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#39FF14]/10 flex items-center justify-center text-[#39FF14]">
                      <activity.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-semibold">{activity.title}</div>
                      <div className="text-[#94a3b8] text-sm">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Trader Insights */}
          <div className="space-y-8">
            {/* Trader Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#081225] border border-[#1a2b45] rounded-3xl p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <FaChartLine className="text-[#39FF14]" />
                Trader Insights
              </h2>

              <div className="space-y-6">
                {/* Trading Experience */}
                <div className="p-4 rounded-2xl bg-[#020617] border border-[#1a2b45]">
                  <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-2">Trading Experience</div>
                  <div className="text-white font-semibold text-lg">
                    {user?.tradingExperience || "Beginner"}
                  </div>
                </div>

                {/* Risk Profile */}
                <div className="p-4 rounded-2xl bg-[#020617] border border-[#1a2b45]">
                  <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-2">Risk Category</div>
                  <div className="text-white font-semibold text-lg">
                    {user?.riskProfile || "Moderate Risk"}
                  </div>
                </div>

                {/* Portfolio Value */}
                <div className="p-4 rounded-2xl bg-[#020617] border border-[#1a2b45]">
                  <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-2">Simulation Portfolio Value</div>
                  <div className="text-2xl font-bold text-[#39FF14]">
                    ₹{dashboardData?.portfolioValue?.toLocaleString() || "0"}
                  </div>
                </div>

                {/* Best Trade */}
                <div className="p-4 rounded-2xl bg-[#020617] border border-[#1a2b45]">
                  <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-2">Best Trade</div>
                  <div className="text-xl font-bold text-white">
                    {dashboardData?.bestTrade ? `₹${dashboardData.bestTrade.profitLoss?.toLocaleString()}` : "No trades yet"}
                  </div>
                </div>

                {/* Learning Progress */}
                <div className="p-4 rounded-2xl bg-[#020617] border border-[#1a2b45]">
                  <div className="text-[#94a3b8] text-xs uppercase tracking-wider mb-2">Current Learning Progress</div>
                  <div className="text-white font-semibold text-lg">
                    65% Complete
                  </div>
                  <div className="w-full h-2 bg-[#1e3a5f] rounded-full mt-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-[#32CD32] to-[#39FF14]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#081225] border border-[#1a2b45] rounded-3xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-10 h-10 rounded-full bg-[#020617] border border-[#1a2b45] flex items-center justify-center text-[#94a3b8] hover:text-white hover:border-[#39FF14]/30 transition-all"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[#94a3b8] text-sm uppercase tracking-wider mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-[#020617] border border-[#1a2b45] text-white outline-none focus:border-[#39FF14]/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] text-sm uppercase tracking-wider mb-2 block">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-[#020617] border border-[#1a2b45] text-white outline-none focus:border-[#39FF14]/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] text-sm uppercase tracking-wider mb-2 block">Phone Number</label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-[#020617] border border-[#1a2b45] text-white outline-none focus:border-[#39FF14]/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] text-sm uppercase tracking-wider mb-2 block">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-[#020617] border border-[#1a2b45] text-white outline-none focus:border-[#39FF14]/30 transition-all"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] text-sm uppercase tracking-wider mb-2 block">Trading Experience</label>
                <select
                  value={editForm.tradingExperience}
                  onChange={(e) => setEditForm({ ...editForm, tradingExperience: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-[#020617] border border-[#1a2b45] text-white outline-none focus:border-[#39FF14]/30 transition-all"
                >
                  <option value="">Select Experience</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="text-[#94a3b8] text-sm uppercase tracking-wider mb-2 block">Risk Profile</label>
                <select
                  value={editForm.riskProfile}
                  onChange={(e) => setEditForm({ ...editForm, riskProfile: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl bg-[#020617] border border-[#1a2b45] text-white outline-none focus:border-[#39FF14]/30 transition-all"
                >
                  <option value="">Select Risk Profile</option>
                  <option value="Low Risk">Low Risk</option>
                  <option value="Moderate Risk">Moderate Risk</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-[#020617] border border-[#1a2b45] text-white font-semibold hover:bg-[#020617]/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#020617] font-bold hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Account Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081225] border border-red-400/30 rounded-3xl w-full max-w-md p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-red-400 flex items-center gap-2">
                <FaExclamationCircle className="w-6 h-6" />
                Delete Account
              </h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-10 h-10 rounded-full bg-[#020617] border border-[#1a2b45] flex items-center justify-center text-[#94a3b8] hover:text-white transition-all"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#94a3b8] mb-8 leading-relaxed">
              Are you sure you want to delete your account? This action cannot be undone, and all your data will be permanently removed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl bg-[#020617] border border-[#1a2b45] text-white font-semibold hover:bg-[#020617]/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-6 py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
