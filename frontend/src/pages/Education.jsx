import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { educationApi } from '../services/api';
import {
  BookOpen,
  Trophy,
  TrendingUp,
  CheckCircle2,
  Clock,
  GraduationCap,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

const StatCard = ({ icon, value, label, change }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: '0 0 30px rgba(50, 205, 50, 0.15)' }}
    className="bg-[#0B1220] rounded-2xl p-6 border border-white/5 relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-[#32CD32]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative z-10">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
      {change && <div className="text-[#32CD32] text-xs mt-2">{change}</div>}
    </div>
  </motion.div>
);

const CategoryCard = ({ category, onClick }) => (
  <motion.div
    whileHover={{ y: -5, boxShadow: '0 0 30px rgba(50, 205, 50, 0.15)' }}
    onClick={onClick}
    className="bg-[#0B1220] rounded-2xl p-6 border border-white/5 hover:border-[#32CD32]/40 cursor-pointer transition-all"
  >
    <div className="flex items-start justify-between mb-4">
      <span className="text-4xl">{category.icon}</span>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        category.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
        category.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
        'bg-red-500/20 text-red-400'
      }`}>
        {category.difficulty}
      </span>
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{category.description}</p>
    <div className="space-y-2 mb-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{category.topicCount} Topics</span>
        <span className="text-[#32CD32]">{category.completedCount} Completed</span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#32CD32] to-[#39FF14] transition-all duration-500"
          style={{ width: `${category.progress}%` }}
        />
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className="text-gray-500 text-sm">{category.progress}% Progress</span>
      <ChevronRight className="w-5 h-5 text-gray-500 transition-colors" />
    </div>
  </motion.div>
);

export default function Education() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await educationApi.getDashboard();
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#32CD32]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center md:text-left">
        <div className="flex items-center gap-3 mb-3">
          <GraduationCap className="text-[#32CD32] w-10 h-10" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">Learning Hub</h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          Master Trading, Options, Risk Management, and Trading Psychology with Bull Boom.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          icon="📚"
          value={dashboardData?.stats?.coursesEnrolled || 0}
          label="Courses Enrolled"
        />
        <StatCard
          icon="✅"
          value={dashboardData?.stats?.coursesCompleted || 0}
          label="Courses Completed"
        />
        <StatCard
          icon="⏱️"
          value={dashboardData?.stats?.learningHours || 0}
          label="Learning Hours"
        />
        <StatCard
          icon="🔥"
          value={dashboardData?.stats?.currentStreak || 0}
          label="Current Streak"
        />
        <StatCard
          icon="🏆"
          value={dashboardData?.stats?.certificates || 0}
          label="Certificates"
        />
        <StatCard
          icon="📊"
          value={`${dashboardData?.stats?.skillScore || 0}`}
          label="Skill Score"
        />
      </div>

      {/* Overall Progress */}
      <div className="bg-[#0B1220] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-[#32CD32] w-6 h-6" />
            Overall Learning Progress
          </h2>
          <span className="text-2xl font-bold text-[#32CD32]">
            {dashboardData?.stats?.overallProgress || 0}%
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
          <span>
            <span className="text-white font-semibold">{dashboardData?.stats?.completedTopics || 0}</span> / {dashboardData?.stats?.totalTopics || 0} Topics Completed
          </span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dashboardData?.stats?.overallProgress || 0}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#32CD32] to-[#39FF14]"
          />
        </div>
      </div>

      {/* Continue Learning */}
      {dashboardData?.continueLearning && (
        <div className="bg-[#0B1220] rounded-2xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-[#32CD32] w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Continue Learning</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#32CD32]/20 to-[#39FF14]/20 rounded-xl flex items-center justify-center text-4xl">
              {dashboardData.continueLearning.thumbnail}
            </div>
            <div className="flex-1">
              <div className="text-gray-400 text-sm mb-1">{dashboardData.continueLearning.categoryName}</div>
              <h3 className="text-xl font-bold text-white mb-2">{dashboardData.continueLearning.topicTitle}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                <span>{dashboardData.continueLearning.progress}% Complete</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/education/topic/${dashboardData.continueLearning.topicId}`)}
              className="px-6 py-3 bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#32CD32]/30 transition-all flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-[#32CD32] w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Course Categories</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(dashboardData?.categories || []).map((category) => (
            <CategoryCard
              key={category._id}
              category={category}
              onClick={() => navigate(`/education/category/${category._id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
