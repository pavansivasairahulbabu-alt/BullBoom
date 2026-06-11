import { useState } from 'react';
import { FaRobot, FaChartPie, FaBrain, FaLightbulb, FaExclamationTriangle, FaStar, FaArrowUp, FaArrowDown, FaDownload, FaPlus, FaComment, FaBook, FaShieldAlt, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#32CD32', '#FF6347', '#FFD700', '#39FF14', '#FFA500'];

const dailyPnLData = [
  { day: 'Mon', profit: 5200 },
  { day: 'Tue', profit: -1800 },
  { day: 'Wed', profit: 3400 },
  { day: 'Thu', profit: 7200 },
  { day: 'Fri', profit: -900 },
  { day: 'Sat', profit: 4100 },
  { day: 'Sun', profit: 2800 },
];

const weeklyPnLData = [
  { week: 'Week 1', profit: 12000 },
  { week: 'Week 2', profit: -3200 },
  { week: 'Week 3', profit: 18500 },
  { week: 'Week 4', profit: 15000 },
];

const winLossData = [
  { name: 'Wins', value: 72 },
  { name: 'Losses', value: 28 },
];

export default function AIAnalysis() {
  const [selectedTrade, setSelectedTrade] = useState('RELIANCE 2024-05-20');

  const performanceMetrics = [
    { label: 'AI Trading Score', value: 85, color: 'from-[#32CD32] to-[#39FF14]' },
    { label: 'Win Rate', value: 72, color: 'from-[#32CD32] to-[#39FF14]' },
    { label: 'Risk Score', value: 90, color: 'from-[#FFD700] to-[#FFA500]' },
    { label: 'Discipline Score', value: 88, color: 'from-[#32CD32] to-[#39FF14]' },
    { label: 'Profitability Score', value: 79, color: 'from-[#32CD32] to-[#39FF14]' },
  ];

  const commonMistakes = [
    {
      title: 'Over Trading',
      severity: 'High',
      description: 'You take 40% more trades than optimal',
      suggestion: 'Limit to 3 trades per day'
    },
    {
      title: 'Revenge Trading',
      severity: 'Medium',
      description: '20% of trades follow losing positions',
      suggestion: 'Take a 30-minute break after losses'
    },
    {
      title: 'Late Entries',
      severity: 'Medium',
      description: 'Missing 30% of optimal entry points',
      suggestion: 'Use entry confirmation signals'
    },
    {
      title: 'Early Exits',
      severity: 'Low',
      description: 'Exiting 25% of winning trades too soon',
      suggestion: 'Follow your profit targets'
    },
    {
      title: 'Risk Violations',
      severity: 'High',
      description: '15% of trades exceed 2% risk',
      suggestion: 'Use position size calculator'
    },
  ];

  const psychologyMetrics = [
    { label: 'Patience', value: 78, description: 'Need improvement on waiting for setups' },
    { label: 'Confidence', value: 85, description: 'Good confidence in your trading system' },
    { label: 'Discipline', value: 80, description: 'Mostly follow your rules' },
    { label: 'Emotional Control', value: 72, description: 'Emotions affect decisions occasionally' },
    { label: 'Consistency', value: 75, description: 'Inconsistent results week to week' },
  ];

  const aiRecommendations = [
    { title: 'Reduce Position Size', priority: 'High', improvement: '+15%' },
    { title: 'Improve Stop Loss Usage', priority: 'High', improvement: '+20%' },
    { title: 'Avoid High Volatility', priority: 'Medium', improvement: '+10%' },
    { title: 'Follow Entry Confirmation', priority: 'High', improvement: '+12%' },
    { title: 'Improve Risk Management', priority: 'Critical', improvement: '+25%' },
  ];

  const tradeJournal = [
    { title: 'Best Strategy', value: 'Trend Following' },
    { title: 'Worst Strategy', value: 'Scalping' },
    { title: 'Best Trading Day', value: 'Wednesday' },
    { title: 'Worst Trading Day', value: 'Friday' },
    { title: 'Most Profitable Sector', value: 'IT' },
    { title: 'Most Loss-Making Sector', value: 'Pharma' },
  ];

  const aiStockPicks = [
    { symbol: 'RELIANCE', sector: 'Energy', confidence: '92%', expectedMove: '+4%', risk: 'Low', action: 'Buy' },
    { symbol: 'TCS', sector: 'IT', confidence: '88%', expectedMove: '+3%', risk: 'Medium', action: 'Buy' },
    { symbol: 'HDFCBANK', sector: 'Banking', confidence: '85%', expectedMove: '+2.5%', risk: 'Low', action: 'Hold' },
    { symbol: 'INFY', sector: 'IT', confidence: '90%', expectedMove: '+3.5%', risk: 'Medium', action: 'Buy' },
  ];

  const riskMetrics = [
    { label: 'Risk Per Trade', value: '1.8%', status: 'Good' },
    { label: 'Max Drawdown', value: '12.5%', status: 'Warning' },
    { label: 'Capital Allocation', value: '75%', status: 'Good' },
    { label: 'Risk Reward Ratio', value: '1:2.5', status: 'Excellent' },
    { label: 'Portfolio Risk Score', value: '78%', status: 'Good' },
  ];

  const chatMessages = [
    { text: 'How can I improve my win rate?', type: 'user' },
    { text: 'Focus on high probability setups only and avoid revenge trading. This alone can improve your win rate by 10-15%.', type: 'ai' },
  ];

  const quickSuggestions = [
    'Improve stop loss usage',
    'Reduce trade frequency',
    'Focus on trending stocks',
    'Better risk management'
  ];

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8 pb-24 md:pb-8">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#32CD32] rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + Math.random() * 5, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 flex items-center gap-3">
              <FaRobot className="text-[#39FF14]" />
              Bull Boom AI Analysis
            </h1>
            <p className="text-[#B8C0D4] text-sm md:text-base">
              Analyze your trading behavior and improve performance with AI-powered insights.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 text-white hover:border-[#32CD32]/30 transition-all">
              <FaPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Analyze New Trade</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all">
              <FaBrain className="w-4 h-4" />
              <span className="hidden sm:inline">Generate AI Report</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 text-white hover:border-[#32CD32]/30 transition-all">
              <FaDownload className="w-4 h-4" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </motion.div>

        {/* AI Performance Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {performanceMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 0 30px rgba(50,205,50,0.2)' }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-[#32CD32]/20 rounded-2xl p-5 transition-all"
            >
              <div className="relative w-20 h-20 mx-auto mb-3">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="35" stroke="#1a1f3a" strokeWidth="8" fill="none" />
                  <motion.circle
                    cx="40" cy="40" r="35" stroke="url(#metric-gradient)" strokeWidth="8" fill="none" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: metric.value / 100 }} transition={{ duration: 1.5, delay: index * 0.1 }}
                  />
                  <defs>
                    <linearGradient id="metric-gradient">
                      <stop offset="0%" stopColor="#32CD32" />
                      <stop offset="100%" stopColor="#39FF14" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{metric.value}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-[#B8C0D4]">{metric.label}</div>
                {metric.label !== 'AI Trading Score' && <div className="text-xs">/ 100</div>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left & Center Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Trade Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2"><FaBrain /> Recent Trade Analysis</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <select value={selectedTrade} onChange={(e) => setSelectedTrade(e.target.value)} className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30">
                  <option>RELIANCE 2024-05-20</option>
                  <option>TCS 2024-05-19</option>
                  <option>HDFCBANK 2024-05-18</option>
                </select>
                <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)]">Analyze Trade</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#050816] rounded-xl p-4 text-center">
                  <div className="text-sm text-[#B8C0D4] mb-1">Trade Grade</div>
                  <div className="text-3xl font-bold text-[#39FF14]">A+</div>
                </div>
                <div className="bg-[#050816] rounded-xl p-4 text-center">
                  <div className="text-sm text-[#B8C0D4] mb-1">Confidence</div>
                  <div className="text-3xl font-bold text-[#32CD32]">92%</div>
                </div>
                <div className="bg-[#050816] rounded-xl p-4 text-center">
                  <div className="text-sm text-[#B8C0D4] mb-1">Risk Level</div>
                  <div className="text-3xl font-bold text-[#FFD700]">Medium</div>
                </div>
                <div className="bg-[#050816] rounded-xl p-4 text-center">
                  <div className="text-sm text-[#B8C0D4] mb-1">Overall</div>
                  <div className="text-3xl font-bold text-[#32CD32]">Excellent</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#050816] border border-[#32CD32]/30">
                  <FaCheck className="text-[#32CD32]" />
                  <span>Good Entry</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#050816] border border-yellow-500/30">
                  <FaExclamationTriangle className="text-yellow-500" />
                  <span>Stop Loss Missing</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#050816] border border-yellow-500/30">
                  <FaExclamationTriangle className="text-yellow-500" />
                  <span>Position Size Too Large</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#050816] border border-[#32CD32]/30">
                  <FaCheck className="text-[#32CD32]" />
                  <span>Exit Was Correct</span>
                </div>
              </div>
            </motion.div>

            {/* AI Mistake Detector */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2"><FaExclamationTriangle /> Common Mistakes Identified</h2>
              <div className="space-y-4">
                {commonMistakes.map((mistake, index) => (
                  <div key={index} className="bg-[#050816] rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold">{mistake.title}</div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        mistake.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                        mistake.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{mistake.severity}</span>
                    </div>
                    <p className="text-sm text-[#B8C0D4] mb-2">{mistake.description}</p>
                    <p className="text-sm text-[#32CD32]"><FaLightbulb className="inline mr-2" />{mistake.suggestion}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trading Psychology Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2"><FaBrain /> Trading Psychology Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {psychologyMetrics.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" stroke="#1a1f3a" strokeWidth="8" fill="none" />
                        <motion.circle cx="48" cy="48" r="40" stroke="url(#psy-gradient)" strokeWidth="8" fill="none" strokeLinecap="round" initial={{ pathLength:0 }} animate={{ pathLength: item.value/100 }} transition={{ duration: 1.5, delay: 0.5 + index*0.1 }} />
                        <defs><linearGradient id="psy-gradient"><stop offset="0%" stopColor="#32CD32"/><stop offset="100%" stopColor="#39FF14"/></linearGradient></defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold">{item.value}%</span>
                      </div>
                    </div>
                    <div className="font-semibold mb-1">{item.label}</div>
                    <div className="text-xs text-[#B8C0D4]">{item.description}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* P&L Insights */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2"><FaChartPie /> Profit & Loss Insights</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4">Daily P&L</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyPnLData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="day" stroke="#B8C0D4" />
                      <YAxis stroke="#B8C0D4" />
                      <Tooltip contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #32CD32' }} />
                      <Line type="monotone" dataKey="profit" stroke="#32CD32" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Win/Loss Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={winLossData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                        {winLossData.map((entry, index) => <Cell key={index} fill={COLORS[index]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0B1220', border: '1px solid #32CD32' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* AI Recommendations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2"><FaLightbulb /> Bull Boom Recommendations</h2>
              <div className="space-y-3">
                {aiRecommendations.map((rec, index) => (
                  <div key={index} className="bg-[#050816] rounded-xl p-4 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-semibold mb-1">{rec.title}</div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${
                        rec.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'High' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>{rec.priority}</span>
                    </div>
                    <div className="text-[#32CD32] font-bold">{rec.improvement}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Stock Picker */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2"><FaStar /> Today's AI Picks</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead><tr className="text-left text-[#B8C0D4] text-sm border-b border-white/10">
                    <th className="pb-3 font-semibold">Symbol</th>
                    <th className="pb-3 font-semibold hidden sm:table-cell">Sector</th>
                    <th className="pb-3 font-semibold">Confidence</th>
                    <th className="pb-3 font-semibold hidden md:table-cell">Expected Move</th>
                    <th className="pb-3 font-semibold">Risk</th>
                    <th className="pb-3 font-semibold">Action</th>
                  </tr></thead>
                  <tbody>
                    {aiStockPicks.map((pick, index) => (
                      <tr key={index} className="border-b border-white/5 last:border-0">
                        <td className="py-3 font-semibold">{pick.symbol}</td>
                        <td className="py-3 text-[#B8C0D4] hidden sm:table-cell">{pick.sector}</td>
                        <td className="py-3 text-[#32CD32] font-bold">{pick.confidence}</td>
                        <td className="py-3 text-[#32CD32] hidden md:table-cell">{pick.expectedMove}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            pick.risk === 'Low' ? 'bg-[#32CD32]/20 text-[#32CD32]' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>{pick.risk}</span>
                        </td>
                        <td className="py-3">
                          <button className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                            pick.action === 'Buy' ? 'bg-[#32CD32] text-[#050816]' : 'bg-gray-500/20 text-gray-300'
                          }`}>{pick.action}</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Risk Management Center */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2"><FaShieldAlt /> Risk Management Center</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {riskMetrics.map((metric, index) => (
                  <div key={index} className="bg-[#050816] rounded-xl p-4 border border-white/10 text-center">
                    <div className="text-sm text-[#B8C0D4] mb-1">{metric.label}</div>
                    <div className="text-lg font-bold mb-1">{metric.value}</div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      metric.status === 'Excellent' ? 'bg-[#32CD32]/20 text-[#32CD32]' :
                      metric.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-[#32CD32]/20 text-[#32CD32]'
                    }`}>{metric.status}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Assistant Chat */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaRobot /> Bull Boom AI Assistant</h2>
              <div className="space-y-3 mb-4 h-64 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl ${
                      msg.type === 'user' ? 'bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816]' : 'bg-[#050816] border border-white/10'
                    }`}>{msg.text}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button key={index} className="w-full text-left px-3 py-2 rounded-lg bg-[#050816] border border-white/10 hover:border-[#32CD32]/30 transition-all text-sm">
                    <FaLightbulb className="inline mr-2 text-[#39FF14]" />
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Trade Journal Insights */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaBook /> AI Trade Journal</h2>
              <div className="space-y-3">
                {tradeJournal.map((item, index) => (
                  <div key={index} className="bg-[#050816] rounded-xl p-3 border border-white/10 flex justify-between items-center">
                    <span className="text-[#B8C0D4]">{item.title}</span>
                    <span className="font-semibold text-[#32CD32]">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Generate Report */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1 }} className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-bold text-lg hover:shadow-[0_0_30px_rgba(50,205,50,0.4)] transition-all mb-4">
                <FaDownload className="w-5 h-5" />
                Generate Full Report
              </button>
              <div className="text-sm text-[#B8C0D4] space-y-2">
                <div>• Trading Summary</div>
                <div>• Performance Score</div>
                <div>• Mistakes Identified</div>
                <div>• AI Recommendations</div>
                <div>• Next Week Goals</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
