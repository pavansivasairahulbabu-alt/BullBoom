import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { dashboardApi } from '../services/api';
import { socketService } from '../services/socketService.js';

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num || 0);
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      const res = await dashboardApi.getDashboard();
      if (res.success) {
        setDashboardData(res);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    const handleRemoteUpdate = () => fetchDashboardData();
    socketService.on('portfolioUpdated', handleRemoteUpdate);
    socketService.on('triggerExecuted', handleRemoteUpdate);
    socketService.on('positionUpdated', handleRemoteUpdate);

    return () => {
      socketService.off('portfolioUpdated', handleRemoteUpdate);
      socketService.off('triggerExecuted', handleRemoteUpdate);
      socketService.off('positionUpdated', handleRemoteUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-[#32CD32] text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  const portfolioStats = [
    { 
      label: 'Virtual Balance', 
      value: `₹${formatNumber(dashboardData?.virtualBalance || 0)}`, 
      icon: '💰', 
      color: 'from-[#32CD32] to-[#39FF14]' 
    },
    { 
      label: 'Available Balance', 
      value: `₹${formatNumber(dashboardData?.availableBalance || 0)}`, 
      icon: '💵', 
      color: 'from-[#32CD32] to-[#39FF14]' 
    },
    { 
      label: 'Portfolio Value', 
      value: `₹${formatNumber(dashboardData?.portfolioValue || 0)}`, 
      icon: '📊', 
      color: 'from-[#32CD32] to-[#39FF14]' 
    },
    { 
      label: 'Invested Amount', 
      value: `₹${formatNumber(dashboardData?.investedAmount || 0)}`, 
      icon: '💎', 
      color: 'from-[#FFD700] to-[#FFA500]' 
    },
    { 
      label: 'Total P&L', 
      value: `${(dashboardData?.totalPnL || 0) >= 0 ? '+' : ''}₹${formatNumber(dashboardData?.totalPnL || 0)}`, 
      icon: '📈', 
      color: 'from-[#32CD32] to-[#39FF14]' 
    },
    { 
      label: 'Realized P&L', 
      value: `${(dashboardData?.realizedPnL || 0) >= 0 ? '+' : ''}₹${formatNumber(dashboardData?.realizedPnL || 0)}`, 
      icon: '✅', 
      color: 'from-[#32CD32] to-[#39FF14]' 
    },
    { 
      label: 'Unrealized P&L', 
      value: `${(dashboardData?.unrealizedPnL || 0) >= 0 ? '+' : ''}₹${formatNumber(dashboardData?.unrealizedPnL || 0)}`, 
      icon: '📊', 
      color: 'from-[#32CD32] to-[#39FF14]' 
    },
    { 
      label: "Today's P&L", 
      value: `${(dashboardData?.todaysPnL || 0) >= 0 ? '+' : ''}₹${formatNumber(dashboardData?.todaysPnL || 0)}`, 
      icon: '🔥', 
      color: 'from-[#FFD700] to-[#FFA500]' 
    },
    { 
      label: 'Open Positions', 
      value: dashboardData?.openPositions || 0, 
      icon: '🎯', 
      color: 'from-[#32CD32] to-[#39FF14]' 
    },
    { 
      label: 'Closed Positions', 
      value: dashboardData?.closedPositions || 0, 
      icon: '📦', 
      color: 'from-[#FFD700] to-[#FFA500]' 
    },
    { 
      label: 'Win Rate', 
      value: `${dashboardData?.winRate || 0}%`, 
      icon: '🏆', 
      color: 'from-[#32CD32] to-[#39FF14]' 
    },
    { 
      label: 'Total Trades', 
      value: dashboardData?.totalTrades || 0, 
      icon: '📉', 
      color: 'from-[#FFD700] to-[#FFA500]' 
    }
  ];

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
            {/* Recent Trades/Positions */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Recent Positions</h2>
              <div className="overflow-x-auto">
                {dashboardData?.positions && dashboardData.positions.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-[#B8C0D4] text-sm border-b border-white/10">
                        <th className="pb-3 font-semibold">Symbol</th>
                        <th className="pb-3 font-semibold">Entry Price</th>
                        <th className="pb-3 font-semibold">Current Price</th>
                        <th className="pb-3 font-semibold">P&L</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.positions.slice(0, 5).map((trade, index) => {
                        const investedAmount = trade.quantity * trade.entryPrice;
                        const currentValue = trade.quantity * trade.currentPrice;
                        const pnl = currentValue - investedAmount;
                        const isProfit = pnl >= 0;

                        return (
                          <tr key={index} className="border-b border-white/5 last:border-0">
                            <td className="py-3 font-semibold">{trade.symbol}</td>
                            <td className="py-3 text-[#B8C0D4]">₹{formatNumber(trade.entryPrice)}</td>
                            <td className="py-3 text-[#B8C0D4]">₹{formatNumber(trade.currentPrice)}</td>
                            <td className={`py-3 font-semibold ${isProfit ? 'text-[#32CD32]' : 'text-red-400'}`}>
                              {isProfit ? '+' : ''}₹{formatNumber(pnl)}
                            </td>
                            <td className="py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                trade.status === 'OPEN'
                                  ? 'bg-[#32CD32]/10 text-[#32CD32]' 
                                  : 'bg-gray-500/10 text-gray-400'
                              }`}>
                                {trade.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-8 text-[#B8C0D4]">
                    No positions yet. Start trading!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
                >
                  Create New Order
                </button>
                <button
                  onClick={() => navigate('/watchlist')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:border-[#32CD32]/30 transition-all"
                >
                  View Watchlist
                </button>
                <button
                  onClick={() => navigate('/positions')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:border-[#32CD32]/30 transition-all"
                >
                  View Positions
                </button>
              </div>
            </div>

            {/* Learning Hub Preview */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">Continue Learning</h2>
              <button
                onClick={() => navigate('/education')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32]/20 to-[#39FF14]/20 border border-[#32CD32]/30 text-[#32CD32] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.2)] transition-all"
              >
                Go to Learning Hub
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
