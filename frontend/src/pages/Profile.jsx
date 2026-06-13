import { useState, useEffect } from "react";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaCamera,
  FaShieldAlt,
  FaLock,
  FaBell,
  FaCreditCard,
  FaChartBar,
  FaTrophy,
  FaLink,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
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

  // Fetch user profile on mount
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/user/profile");
      if (response.data.success) {
        setUser(response.data.user);
        setEditForm({
          fullName: response.data.user.fullName || "",
          username: response.data.user.username || "",
          phone: response.data.user.phone || "",
          location: response.data.user.location || "",
          tradingExperience: response.data.user.tradingExperience || "",
          riskProfile: response.data.user.riskProfile || "",
        });
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
  const completionPercentage =
    user?.profileCompletion ||
    Math.round((completedSteps / profileCompletionSteps.length) * 100);

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
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-[#32CD32] text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8 pb-24 md:pb-8 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#32CD32] rounded-full"
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

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-3">
              <FaUser className="text-[#39FF14]" />
              My Profile
            </h1>
            <p className="text-[#B8C0D4] text-sm md:text-base">
              Manage your account, trading preferences, and security settings.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10">
              <span className="text-sm text-[#B8C0D4]">Profile Completion</span>
              <span className="text-lg font-bold text-[#32CD32]">
                {completionPercentage}%
              </span>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all"
            >
              <FaEdit className="w-4 h-4" />
              Edit Profile
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-400 font-semibold hover:bg-red-500/30 transition-all"
            >
              <FaTrash className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left & Middle Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Completion Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Profile Completion</h3>
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#B8C0D4]">
                    {completionPercentage}% Complete
                  </span>
                  <span className="text-sm font-semibold">
                    {completedSteps}/{profileCompletionSteps.length} Steps
                  </span>
                </div>
                <div className="w-full h-3 bg-[#050816] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPercentage}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-[#32CD32] to-[#39FF14]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {profileCompletionSteps.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${step.completed ? "bg-[#32CD32] text-[#050816]" : "border border-white/20 text-[#B8C0D4]"}`}
                    >
                      {step.completed ? "✓" : ""}
                    </div>
                    <span
                      className={`text-sm ${step.completed ? "text-[#32CD32]" : "text-[#B8C0D4]"}`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6"
            >
              <h3 className="text-lg font-semibold mb-6">
                Personal Information
              </h3>

              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#32CD32]/30 cursor-pointer hover:border-[#32CD32] transition-all"
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
                      <img
                        src="/BullBoom.jpeg"
                        alt="Default Profile"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    id="profile-image-input"
                    accept="image/jpg,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <button
                    onClick={() =>
                      document.getElementById("profile-image-input").click()
                    }
                    disabled={isUploading}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#050816] border border-white/10 text-sm hover:border-[#32CD32]/30 transition-all disabled:opacity-50"
                  >
                    {isUploading ? (
                      "Uploading..."
                    ) : (
                      <>
                        <FaCamera className="w-3 h-3" /> Upload Photo
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-[#B8C0D4] mb-1 block">
                      Full Name
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-[#050816] border border-white/10">
                      {user?.fullName}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#B8C0D4] mb-1 block">
                      Username
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-[#050816] border border-white/10">
                      {user?.username ? `@${user.username}` : "Not set"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#B8C0D4] mb-1 block">
                      Email Address
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-[#050816] border border-white/10">
                      {user?.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#B8C0D4] mb-1 block">
                      Phone Number
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-[#050816] border border-white/10">
                      {user?.phone}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#B8C0D4] mb-1 block">
                      Membership
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30">
                      <span className="text-[#FFD700] font-semibold">
                        {user?.membership}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-[#B8C0D4] mb-1 block">
                      Location
                    </label>
                    <div className="px-4 py-3 rounded-xl bg-[#050816] border border-white/10">
                      {user?.location || "Not set"}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Overview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Quick Overview</h3>
              <div className="space-y-3">
                {[
                  {
                    label: "Profile Completion",
                    value: `${completionPercentage}%`,
                  },
                  { label: "Membership", value: user?.membership },
                  {
                    label: "Trading Experience",
                    value: user?.tradingExperience || "Not set",
                  },
                  {
                    label: "Risk Profile",
                    value: user?.riskProfile || "Not set",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="text-[#B8C0D4] text-sm">{item.label}</span>
                    <span className="font-semibold text-[#32CD32]">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6"
            >
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[{ id: 1, type: "Profile Updated", time: "Just now" }].map(
                  (activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-[#050816] border border-white/5"
                    >
                      <div className="mt-1 w-2 h-2 rounded-full bg-[#32CD32]" />
                      <div className="flex-1">
                        <div className="text-sm font-semibold">
                          {activity.type}
                        </div>
                        <div className="text-xs text-[#B8C0D4]/70 mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </motion.div>
            {/* Trader Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6"
            >
              <h3 className="text-lg font-semibold mb-6">Trader Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-[#B8C0D4] mb-2 block">
                    Trading Experience
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-[#050816] border border-white/10">
                    {user?.tradingExperience || "Not set"}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#B8C0D4] mb-2 block">
                    Risk Profile
                  </label>
                  <div className="px-4 py-3 rounded-xl bg-[#050816] border border-white/10">
                    {user?.riskProfile || "Not set"}
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#B8C0D4] hover:text-white transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">
                  Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-2 block">
                  Trading Experience
                </label>
                <select
                  value={editForm.tradingExperience}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tradingExperience: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                >
                  <option value="">Select Experience</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-2 block">
                  Risk Profile
                </label>
                <select
                  value={editForm.riskProfile}
                  onChange={(e) =>
                    setEditForm({ ...editForm, riskProfile: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                >
                  <option value="">Select Risk Profile</option>
                  <option value="Low Risk">Low Risk</option>
                  <option value="Moderate Risk">Moderate Risk</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Aggressive">Aggressive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white font-semibold hover:bg-[#050816]/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all"
              >
                Save
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
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-red-400">Delete Account</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-[#B8C0D4] hover:text-white transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#B8C0D4] mb-6">
              Are you sure you want to delete your account? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white font-semibold hover:bg-[#050816]/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-400 font-semibold hover:bg-red-500/30 transition-all"
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
