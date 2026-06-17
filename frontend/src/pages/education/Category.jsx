import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { educationApi } from "../../services/api";
import { ArrowLeft, CheckCircle2, BookOpen, Trophy, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function Category() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchCategoryData();
  }, [id]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const res = await educationApi.getCategory(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load category");
    } finally {
      setLoading(false);
    }
  };

  const allTopicsCompleted = data?.topics.every((t) => t.completed);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#32CD32]"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 space-y-6 overflow-hidden">
      <button
        onClick={() => navigate("/education")}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Learning Hub</span>
      </button>

      <div className="bg-[#0B1220] rounded-2xl border border-white/5 p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="text-6xl">{data?.category.icon}</div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 break-words">
              {data?.category.name}
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg mb-4 break-words">
              {data?.category.description}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-6 text-sm">
              <span className="px-3 py-1 rounded-full bg-[#32CD32]/20 text-[#32CD32] font-medium">
                {data?.category.difficulty}
              </span>
              <span className="text-gray-400">
                <Clock className="w-4 h-4 inline mr-1" />
                {data?.category.estimatedHours} hours
              </span>
              <span className="text-gray-400">
                {data?.completedCount}/{data?.totalCount} topics completed
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Category Progress</span>
            <span className="text-[#32CD32] font-semibold">
              {data?.progress}%
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data?.progress}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-[#32CD32] to-[#39FF14]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="text-[#32CD32] w-6 h-6" />
          <h2 className="text-xl font-bold text-white">Topics</h2>
        </div>
        <div className="space-y-3">
          {data?.topics.map((topic, index) => (
            <motion.div
              key={topic._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/education/topic/${topic._id}`)}
              className="bg-[#0B1220] rounded-xl border border-white/5 p-3 sm:p-4 md:p-6 hover:border-[#32CD32]/40 cursor-pointer transition-all group"
            >
              <div className="flex items-start gap-2 min-w-0">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    topic.completed ? "bg-[#32CD32]/20" : "bg-white/5"
                  }`}
                >
                  {topic.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-[#32CD32]" />
                  ) : (
                    topic.icon
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-semibold break-words ${
                        topic.completed
                          ? "text-gray-400 line-through"
                          : "text-white"
                      }`}
                    >
                      {topic.order}. {topic.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm mt-1 break-words">
                    {topic.description}
                  </p>
                  {topic.estimatedTime && (
                    <span className="text-xs text-gray-500 mt-1 block">
                      {topic.estimatedTime}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 flex-shrink-0 text-gray-500 group-hover:text-[#32CD32] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() =>
            allTopicsCompleted && navigate(`/education/quiz/${id}`)
          }
          disabled={!allTopicsCompleted}
          className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all ${
            allTopicsCompleted
              ? "bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] hover:shadow-lg hover:shadow-[#32CD32]/30"
              : "bg-white/5 text-gray-500 cursor-not-allowed"
          }`}
        >
          {allTopicsCompleted ? (
            <>
              <Trophy className="w-6 h-6" />
              Take Quiz
            </>
          ) : (
            <>
              <Lock className="w-6 h-6" />
              Complete all topics first
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Clock({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ArrowRight({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
