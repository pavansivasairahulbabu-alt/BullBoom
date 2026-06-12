import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { educationApi } from '../../services/api';
import { ArrowLeft, CheckCircle2, BookOpen, Lightbulb, FileText, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Topic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    fetchTopicData();
  }, [id]);

  const fetchTopicData = async () => {
    try {
      setLoading(true);
      const res = await educationApi.getTopic(id);
      if (res.success) {
        setData(res.data);
        // Fetch category topics to get prev/next
        const categoryId = res.data.topic.category?._id || res.data.topic.category;
        if (categoryId) {
          const catRes = await educationApi.getCategory(categoryId);
          if (catRes.success) {
            setTopics(catRes.data.topics);
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load topic');
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async () => {
    try {
      await educationApi.markTopicComplete(id);
      toast.success('Topic marked complete!');
      fetchTopicData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to mark complete');
    }
  };

  const currentIndex = topics.findIndex(t => t._id === id);
  const prevTopic = currentIndex > 0 ? topics[currentIndex - 1] : null;
  const nextTopic = currentIndex < topics.length - 1 ? topics[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#32CD32]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <button
        onClick={() => navigate(`/education/category/${data?.topic.category._id}`)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Category</span>
      </button>

      <div className="bg-[#0B1220] rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-4xl">{data?.topic.icon}</span>
                {data?.userProgress?.completed && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#32CD32]/20 text-[#32CD32] text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">{data?.topic.title}</h1>
              <p className="text-gray-400 text-lg">{data?.topic.description}</p>
            </div>
          </div>

          {data?.topic.content && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#32CD32]">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Lesson Content</h2>
              </div>
              <div 
                className="text-gray-300 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: data.topic.content }}
              />
            </div>
          )}

          {data?.topic.examples?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#32CD32]">
                <Lightbulb className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Examples</h2>
              </div>
              <div className="space-y-3">
                {data.topic.examples.map((example, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-5 border border-white/5">
                    <h3 className="font-semibold text-white mb-2">{example.title}</h3>
                    <p className="text-gray-400">{example.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.topic.keyTakeaways?.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#32CD32]">
                <FileText className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Key Takeaways</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.topic.keyTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="bg-[#32CD32]/10 border border-[#32CD32]/20 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#32CD32] shrink-0 mt-0.5" />
                    <span className="text-gray-300">{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              {prevTopic && (
                <button
                  onClick={() => navigate(`/education/topic/${prevTopic._id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
                >
                  <ArrowLeftCircle className="w-5 h-5" />
                  Previous
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {!data?.userProgress?.completed && (
                <button
                  onClick={markComplete}
                  className="px-6 py-3 bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold rounded-xl hover:shadow-lg hover:shadow-[#32CD32]/30 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Mark Complete
                </button>
              )}
              {nextTopic && (
                <button
                  onClick={() => navigate(`/education/topic/${nextTopic._id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-300"
                >
                  Next
                  <ArrowRightCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>  
        </div>
      </div>
    </div>
  );
}
