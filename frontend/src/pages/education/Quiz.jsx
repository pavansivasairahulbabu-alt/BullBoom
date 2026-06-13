import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { educationApi } from '../../services/api';
import {
  ArrowLeft,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(600);
  const [category, setCategory] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [currentQuestionResult, setCurrentQuestionResult] = useState(null);

  useEffect(() => {
    fetchQuizData();
  }, [id]);

  useEffect(() => {
    if (showResult || loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [showResult, loading]);

  const fetchQuizData = async () => {
    try {
      setLoading(true);
      const catRes = await educationApi.getCategory(id);
      if (catRes.data.success) {
        setCategory(catRes.data.data.category);
      }
      const res = await educationApi.getQuizByCategory(id);
      if (res.data.success) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) {
      toast.error('Please select an answer');
      return;
    }
    try {
      const currentQuestion = questions[currentIndex];
      const payload = { quizId: currentQuestion._id, selectedAnswer };
      const res = await educationApi.submitQuiz(payload);
      if (res.data.success) {
        setCurrentQuestionResult(res.data);
        setAnsweredQuestions(prev => [...prev, {
          question: currentQuestion,
          selectedAnswer,
          isCorrect: res.data.isCorrect,
          correctAnswer: res.data.correctAnswer,
          attempt: res.data.attempt
        }]);
        setShowResult(true);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit answer');
    }
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setCurrentQuestionResult(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFinishQuiz = () => {
    navigate(`/education/category/${id}`);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    const correctCount = answeredQuestions.filter(q => q.isCorrect).length;
    return Math.round((correctCount / questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#32CD32]"></div>
      </div>
    );
  }

  if (answeredQuestions.length === questions.length) {
    const score = calculateScore();
    const passed = score >= 70;
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8">
        <button
          onClick={() => navigate(`/education/category/${id}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Category</span>
        </button>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#0B1220] rounded-2xl border border-white/5 p-8 text-center"
        >
          <div className="text-8xl mb-6">{passed ? '🎉' : '📚'}</div>
          <h1 className="text-4xl font-bold text-white mb-3">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h1>
          <p className="text-gray-400 text-lg mb-6">
            {passed ? 'You passed the quiz! Achievement unlocked!' : 'You can try again after reviewing the topics.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-6">
              <div className="text-4xl font-bold text-[#32CD32]">{score}%</div>
              <div className="text-gray-400 mt-1">Score</div>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <div className="text-4xl font-bold text-[#32CD32]">
                {answeredQuestions.filter(q => q.isCorrect).length}
              </div>
              <div className="text-gray-400 mt-1">Correct</div>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <div className="text-4xl font-bold text-gray-400">{questions.length}</div>
              <div className="text-gray-400 mt-1">Total</div>
            </div>
          </div>

          {passed && (
            <div className="bg-gradient-to-r from-[#32CD32]/20 to-[#39FF14]/20 border border-[#32CD32]/30 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-center gap-3 text-[#32CD32]">
                <Trophy className="w-8 h-8" />
                <span className="text-2xl font-bold">Achievement Unlocked!</span>
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setAnsweredQuestions([]);
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setCurrentQuestionResult(null);
              }}
              className="px-6 py-3 bg-white/5 text-white font-semibold rounded-xl transition-all hover:bg-white/10 border border-white/20"
            >
              Retake Quiz
            </button>
            <button
              onClick={handleFinishQuiz}
              className="px-6 py-3 bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold rounded-xl transition-all"
            >
              Back to Category
            </button>
          </div>
        </motion.div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Review Answers</h2>
          {answeredQuestions.map((result, idx) => (
            <div
              key={idx}
              className={`bg-[#0B1220] rounded-xl border p-6 ${
                result.isCorrect ? 'border-green-500/30' : 'border-red-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={result.isCorrect ? 'text-green-500' : 'text-red-500'}>
                  {result.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <XCircle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-3">Q{idx + 1}. {result.question.question}</h3>
                  <div className="space-y-2">
                    {result.question.options.map((option, oidx) => (
                      <div
                        key={oidx}
                        className={`px-4 py-2 rounded-lg border ${
                          oidx === result.correctAnswer
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : oidx === result.selectedAnswer && !result.isCorrect
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : 'bg-white/5 border-white/5 text-gray-400'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  {result.question.explanation && (
                    <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-gray-400 text-sm">
                        <strong>Explanation:</strong> {result.question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate(`/education/category/${id}`)}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Category</span>
      </button>

      <div className="bg-[#0B1220] rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{category?.name} Quiz</h1>
            <p className="text-gray-400 mt-1">Question {currentIndex + 1} of {questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold ${
            timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-[#32CD32]/20 text-[#32CD32]'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-[#32CD32] font-semibold">{currentIndex + 1}/{questions.length}</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#32CD32] to-[#39FF14] transition-all"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {questions.length > 0 && (
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0B1220] rounded-2xl border border-white/5 p-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">{currentQuestion.question}</h2>

          {!showResult ? (
            <>
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSelect(idx)}
                    className={`w-full text-left px-6 py-4 rounded-xl border transition-all ${
                      selectedAnswer === idx
                        ? 'border-[#32CD32] bg-[#32CD32]/10 text-white'
                        : 'border-white/5 hover:border-white/20 bg-white/5 text-gray-300'
                    }`}
                  >
                    <span className="font-semibold mr-3">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            </>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                currentQuestionResult.isCorrect
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  {currentQuestionResult.isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className={`font-semibold ${
                    currentQuestionResult.isCorrect ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {currentQuestionResult.isCorrect ? 'Correct!' : 'Incorrect!'}
                  </span>
                </div>
                {currentQuestion.explanation && (
                  <p className="text-gray-400 text-sm">
                    Explanation: {currentQuestion.explanation}
                  </p>
                )}
              </div>

              <button
                onClick={
                  currentIndex < questions.length - 1 ? handleNextQuestion : handleFinishQuiz
                }
                className="w-full px-6 py-3 bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {currentIndex < questions.length - 1 ? (
                  <>Next Question <ArrowRight className="w-4 h-4" /></>
                ) : (
                  'Finish Quiz'
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}

      <div className="flex gap-2 flex-wrap justify-center">
        {questions.map((_, idx) => {
          const answered = answeredQuestions.find(a => a.question._id === questions[idx]._id);
          return (
            <button
              key={idx}
              onClick={() => !answered && setCurrentIndex(idx)}
              disabled={!!answered}
              className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                currentIndex === idx
                  ? 'bg-[#32CD32] text-[#050816]'
                  : answered
                  ? answered.isCorrect
                    ? 'bg-green-500/30 text-green-400 border border-green-500/30'
                    : 'bg-red-500/30 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-gray-500 border border-white/5'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
