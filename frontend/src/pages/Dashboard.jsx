import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaUserCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { positionService } from '../services/positionService';

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num || 0);
};

export default function Dashboard() {
  const [watchlistSearch, setWatchlistSearch] = useState('');
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await positionService.getPositions();
        if (data.success) {
          setPositions(data.positions);
        }
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const portfolioStats = useMemo(() => {
    const totalPositions = positions.length;
    const openPositions = positions.filter(p => p.status === 'OPEN').length;
    const totalPnl = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);
    const portfolioValue = positions.reduce((sum, p) => sum + (p.currentValue || 0), 0);

    return [
      { 
        label: 'Portfolio Value', 
        value: `₹${formatNumber(portfolioValue)}`, 
        icon: '📊', 
        color: 'from-[#32CD32] to-[#39FF14]' 
      },
      { 
        label: "Today's P&L", 
        value: `${totalPnl >= 0 ? '+' : ''}₹${formatNumber(totalPnl)}`, 
        icon: '📈', 
        color: 'from-[#32CD32] to-[#39FF14]' 
      },
      { 
        label: 'Total Positions', 
        value: totalPositions.toString(), 
        icon: '📋', 
        color: 'from-[#FFD700] to-[#FFA500]' 
      },
      { 
        label: 'Open Positions', 
        value: openPositions.toString(), 
        icon: '🎯', 
        color: 'from-[#32CD32] to-[#39FF14]' 
      },
    ];
  }, [positions]);

  const watchlist = [
    { name: 'NIFTY 50', price: '23,450', change: '+0.82%', isPositive: true },
    { name: 'BANK NIFTY', price: '54,750', change: '+1.12%', isPositive: true },
    { name: 'SENSEX', price: '78,900', change: '+0.56%', isPositive: true },
    { name: 'FINNIFTY', price: '24,890', change: '+0.31%', isPositive: true },
  ];

  const aiInsights = [
    { label: 'Trade Discipline', value: 85 },
    { label: 'Risk Management', value: 90 },
    { label: 'Emotional Control', value: 75 },
    { label: 'AI Confidence', value: 88 },
  ];

  const recentTrades = [
    { symbol: 'NIFTY CE', entry: '₹120', exit: '₹165', pnl: '+₹450', isProfit: true, status: 'Profit' },
    { symbol: 'BANKNIFTY PE', entry: '₹220', exit: '₹190', pnl: '-₹300', isProfit: false, status: 'Loss' },
    { symbol: 'SENSEX CE', entry: '₹80', exit: '₹110', pnl: '+₹300', isProfit: true, status: 'Profit' },
    { symbol: 'FINNIFTY PE', entry: '₹150', exit: '₹130', pnl: '-₹200', isProfit: false, status: 'Loss' },
    { symbol: 'NIFTY PE', entry: '₹95', exit: '₹140', pnl: '+₹450', isProfit: true, status: 'Profit' },
    { symbol: 'BANKNIFTY CE', entry: '₹250', exit: '₹310', pnl: '+₹600', isProfit: true, status: 'Profit' },
    { symbol: 'SENSEX PE', entry: '₹100', exit: '₹90', pnl: '-₹100', isProfit: false, status: 'Loss' },
    { symbol: 'FINNIFTY CE', entry: '₹180', exit: '₹220', pnl: '+₹400', isProfit: true, status: 'Profit' },
  ];

  const learningProgress = [
    { title: 'Options Basics', progress: 80 },
    { title: 'Option Greeks', progress: 45 },
    { title: 'Risk Management', progress: 65 },
  ];

  const marketNews = [
    { title: 'NIFTY gains 1%', time: '2 hours ago' },
    { title: 'Banking stocks rally', time: '3 hours ago' },
    { title: 'AI predicts bullish trend', time: '5 hours ago' },
  ];

  const filteredWatchlist = watchlist.filter(item => 
    item.name.toLowerCase().includes(watchlistSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#32CD32] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Top Navbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              Welcome Back, Trader 👋
            </h1>
            <p className="text-[#B8C0D4] text-sm md:text-base">
              Let's dominate the markets today.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 w-80">
              <FaSearch className="text-[#B8C0D4] w-4 h-4" />
              <input
                type="text"
                placeholder="Search stocks, indices, options..."
                className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
              />
            </div>

            {/* Notification Bell */}
            <button className="w-10 h-10 rounded-xl bg-[#0B1220] border border-white/10 flex items-center justify-center hover:border-[#32CD32]/30 transition-all">
              <FaBell className="text-[#B8C0D4] w-4 h-4" />
            </button>

            {/* Profile Avatar */}
            <button
              id="profile"
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#32CD32] to-[#39FF14] flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
            >
              <FaUserCircle className="text-[#050816] w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {portfolioStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 0 30px rgba(50,205,50,0.2)' }}
              className="bg-[#0B1220]/80 backdrop-blur-xl border border-[#32CD32]/20 rounded-2xl p-5 transition-all"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-[#B8C0D4] text-sm mb-1">{stat.label}</div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Watchlist Section */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Market Watchlist</h2>
              </div>

              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 mb-4">
                <FaSearch className="text-[#B8C0D4] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Symbol"
                  value={watchlistSearch}
                  onChange={(e) => setWatchlistSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredWatchlist.map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -2, boxShadow: '0 0 20px rgba(50,205,50,0.15)' }}
                    className="bg-[#050816] border border-white/10 rounded-xl p-4 hover:border-[#32CD32]/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{item.name}</div>
                      <div className={`text-sm ${item.isPositive ? 'text-[#32CD32]' : 'text-red-400'}`}>
                        {item.change}
                      </div>
                    </div>
                    <div className="text-2xl font-bold mt-1">{item.price}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[#B8C0D4] text-sm border-b border-white/10">
                      <th className="pb-3 font-semibold">Symbol</th>
                      <th className="pb-3 font-semibold">Entry</th>
                      <th className="pb-3 font-semibold">Exit</th>
                      <th className="pb-3 font-semibold">P&L</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrades.map((trade, index) => (
                      <tr key={index} className="border-b border-white/5 last:border-0">
                        <td className="py-3 font-semibold">{trade.symbol}</td>
                        <td className="py-3 text-[#B8C0D4]">{trade.entry}</td>
                        <td className="py-3 text-[#B8C0D4]">{trade.exit}</td>
                        <td className={`py-3 font-semibold ${trade.isProfit ? 'text-[#32CD32]' : 'text-red-400'}`}>
                          {trade.pnl}
                        </td>
                        <td className="py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            trade.isProfit 
                              ? 'bg-[#32CD32]/10 text-[#32CD32]' 
                              : 'bg-red-400/10 text-red-400'
                          }`}>
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Bull Boom AI Insights</h2>
              <div className="grid grid-cols-2 gap-4">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-2">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="40"
                          cy="40"
                          r="35"
                          stroke="#1a1f3a"
                          strokeWidth="6"
                          fill="none"
                        />
                        <motion.circle
                          cx="40"
                          cy="40"
                          r="35"
                          stroke="url(#progress-gradient)"
                          strokeWidth="6"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: insight.value / 100 }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                        />
                        <defs>
                          <linearGradient id="progress-gradient">
                            <stop offset="0%" stopColor="#32CD32" />
                            <stop offset="100%" stopColor="#39FF14" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">{insight.value}%</span>
                      </div>
                    </div>
                    <div className="text-[#B8C0D4] text-sm">{insight.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Learning Hub Preview */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
              <div className="space-y-4">
                {learningProgress.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="text-sm text-[#32CD32]">{item.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#050816] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-[#32CD32] to-[#39FF14]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market News Widget */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Market Pulse</h2>
              <div className="space-y-3">
                {marketNews.map((news, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#050816] hover:border-[#32CD32]/30 border border-white/5 transition-all"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#32CD32]" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{news.title}</div>
                      <div className="text-xs text-[#B8C0D4]">{news.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
