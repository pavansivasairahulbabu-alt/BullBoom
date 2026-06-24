import { useState, useEffect, useMemo } from 'react';
import {
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTimes,
  FaCheck,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { positionApi, orderApi } from '../services/api.js';
import { marketStore } from '../services/marketStore.js';

// Helper to format numbers
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num || 0);
};

const PARTICLES = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 2,
}));

const isOpenPosition = (position) => position.status === 'OPEN';

const isShortPosition = (position) => {
  const orderType = String(position.orderType || '').toUpperCase();
  return orderType === 'SELL' || orderType === 'SHORT';
};

const calculateUnrealizedPnl = (position, quantity = position.quantity) => {
  const currentPrice = Number(position.currentPrice) || 0;
  const entryPrice = Number(position.entryPrice) || 0;
  const numericQuantity = Number(quantity) || 0;
  const directionMultiplier = isShortPosition(position) ? -1 : 1;

  return (currentPrice - entryPrice) * numericQuantity * directionMultiplier;
};

const getLivePosition = (position, liveMarketData) => {
  const symbolData = liveMarketData[position.symbol];
  const currentPrice = Number(symbolData?.currentPrice);

  if (!isOpenPosition(position) || Number.isNaN(currentPrice)) {
    return position;
  }

  const entryPrice = Number(position.entryPrice) || 0;
  const quantity = Number(position.quantity) || 0;
  const priceDifference = currentPrice - entryPrice;
  const currentValue = currentPrice * quantity;
  const pnl = calculateUnrealizedPnl({ ...position, currentPrice }, quantity);
  const pnlPercentage = entryPrice
    ? (priceDifference / entryPrice) * 100 * (isShortPosition(position) ? -1 : 1)
    : 0;

  return {
    ...position,
    currentPrice,
    currentValue,
    pnl,
    pnlPercentage,
  };
};

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [liveMarketData, setLiveMarketData] = useState({});
  const [addForm, setAddForm] = useState({
    symbol: '',
    exchange: 'NSE',
    orderType: 'BUY',
    quantity: '',
    entryPrice: '',
    targetPrice: '',
    stopLossPrice: '',
    currentPrice: ''
  });
  const [editForm, setEditForm] = useState({
    currentPrice: '',
    quantity: '',
    targetPrice: '',
    stopLossPrice: '',
    status: ''
  });
  const [sellForm, setSellForm] = useState({ quantity: 1, loading: false });

  // Fetch positions
  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await positionApi.getPositions();
      if (res.success) {
        setPositions(res.positions);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      toast.error('Failed to fetch positions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchPositions, 0);
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchPositions, 5000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = marketStore.subscribe((data) => {
      const nextMarketData = {};
      Object.keys(data).forEach((symbol) => {
        nextMarketData[symbol] = { ...data[symbol] };
      });
      setLiveMarketData(nextMarketData);
    });

    return unsubscribe;
  }, []);

  // Calculate portfolio summary
  const portfolioSummary = useMemo(() => {
    const totalPositions = positions.length;
    const openPositions = positions.filter(p => p.status === 'OPEN').length;
    const closedPositions = positions.filter(p => p.status === 'CLOSED').length;

    const totalInvestment = positions.reduce((sum, p) => sum + (p.investedAmount || 0), 0);
    const totalPnl = positions.reduce((sum, p) => sum + (p.pnl || 0), 0);

    return {
      totalPositions,
      openPositions,
      closedPositions,
      totalInvestment,
      totalPnl
    };
  }, [positions]);

  // Filtered positions
  const filteredPositions = useMemo(() => {
    return positions.filter(pos => {
      const matchesSearch =
        !searchQuery ||
        pos.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pos.exchange.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        filterType === 'All' || pos.orderType === filterType;

      const matchesStatus =
        filterStatus === 'All' || pos.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [positions, searchQuery, filterType, filterStatus]);

  const displayPositions = useMemo(
    () => filteredPositions.map((pos) => getLivePosition(pos, liveMarketData)),
    [filteredPositions, liveMarketData],
  );

  const selectedLivePosition = useMemo(
    () =>
      selectedPosition
        ? getLivePosition(selectedPosition, liveMarketData)
        : null,
    [selectedPosition, liveMarketData],
  );

  const sellQuantity = Number(sellForm.quantity) || 0;
  const selectedSellPnl = selectedLivePosition
    ? calculateUnrealizedPnl(selectedLivePosition, sellQuantity)
    : 0;
  const selectedSellValue = selectedLivePosition
    ? (Number(selectedLivePosition.currentPrice) || 0) * sellQuantity
    : 0;

  // Handle add position
  const handleAddPosition = async (e) => {
    e.preventDefault();
    try {
      await positionApi.createPosition(addForm);
      toast.success('Position added successfully');
      setIsAddModalOpen(false);
      setAddForm({
        symbol: '',
        exchange: 'NSE',
        orderType: 'BUY',
        quantity: '',
        entryPrice: '',
        currentPrice: ''
      });
      fetchPositions();
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error(error.response?.data?.message || 'Failed to add position');
    }
  };

  // Handle edit position
  const handleEditPosition = async (e) => {
    e.preventDefault();
    if (!selectedPosition) return;
    try {
      await positionApi.updatePosition(selectedPosition._id, editForm);
      toast.success('Position updated successfully');
      setIsEditModalOpen(false);
      setSelectedPosition(null);
      fetchPositions();
    } catch (error) {
      console.error('Error updating position:', error);
      toast.error(error.response?.data?.message || 'Failed to update position');
    }
  };

  // Handle sell position
  const handleSellPosition = async () => {
    if (!selectedPosition) return;
    setSellForm(prev => ({ ...prev, loading: true }));
    try {
      const res = await orderApi.sell({
        positionId: selectedPosition._id,
        quantity: Number(sellForm.quantity)
      });
      if (res.success) {
        toast.success('Position sold successfully');
        setIsSellModalOpen(false);
        setSelectedPosition(null);
        fetchPositions();
      }
    } catch (error) {
      console.error('Error selling position:', error);
      toast.error(error.response?.data?.message || 'Failed to sell position');
    } finally {
      setSellForm(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle close position (manual close)
  const handleClosePosition = async (position) => {
    try {
      await positionApi.deletePosition(position._id);
      toast.success('Position closed successfully');
      fetchPositions();
    } catch (error) {
      console.error('Error closing position:', error);
      toast.error(error.response?.data?.message || 'Failed to close position');
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {PARTICLES.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-[#32CD32] rounded-full"
            style={{ left: particle.left, top: particle.top }}
            animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: particle.duration, repeat: Infinity, ease: "easeInOut", delay: particle.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Positions</h1>
            <p className="text-[#B8C0D4] text-sm md:text-base">Track your active and closed trades</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Position</span>
          </button>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Total Positions</div>
            <div className="text-2xl font-bold">{portfolioSummary.totalPositions}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Open Positions</div>
            <div className="text-2xl font-bold text-blue-400">{portfolioSummary.openPositions}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Closed Positions</div>
            <div className="text-2xl font-bold text-gray-400">{portfolioSummary.closedPositions}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Total Investment</div>
            <div className="text-2xl font-bold">₹{formatNumber(portfolioSummary.totalInvestment)}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${portfolioSummary.totalPnl >= 0 ? 'text-[#32CD32]' : 'text-red-400'}`}>
              {portfolioSummary.totalPnl >= 0 ? '+' : ''}₹{formatNumber(portfolioSummary.totalPnl)}
            </div>
          </motion.div>
        </div>

        {/* Search & Filters */}
        <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#050816] border border-white/10">
              <FaSearch className="text-[#B8C0D4] w-4 h-4" />
              <input
                type="text"
                placeholder="Search by symbol or exchange..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none"
            >
              <option value="All">All Types</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none"
            >
              <option value="All">All Status</option>
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>

        {/* Positions Table */}
        <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
          {loading ? (
            <div className="py-10 text-center text-[#B8C0D4]">Loading positions...</div>
          ) : displayPositions.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold mb-2">No Positions Yet</h3>
              <p className="text-[#B8C0D4] mb-6">Start trading or add a position manually</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
              >
                <FaPlus className="w-4 h-4 inline mr-2" />
                Add Your First Position
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#B8C0D4] text-sm border-b border-white/10">
                    <th className="pb-3 font-semibold">Symbol</th>
                    <th className="pb-3 font-semibold">Exchange</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Qty</th>
                    <th className="pb-3 font-semibold">Entry Price</th>
                    <th className="pb-3 font-semibold">Target Price</th>
                    <th className="pb-3 font-semibold">Stop Loss</th>
                    <th className="pb-3 font-semibold">Current Price</th>
                    <th className="pb-3 font-semibold">Invested</th>
                    <th className="pb-3 font-semibold">Current Value</th>
                    <th className="pb-3 font-semibold">P&L</th>
                    <th className="pb-3 font-semibold">P&L %</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayPositions.map((pos) => (
                    <motion.tr
                      key={pos._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ backgroundColor: 'rgba(50,205,50,0.05)' }}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-4 font-semibold">{pos.symbol}</td>
                      <td className="py-4 text-[#B8C0D4]">{pos.exchange}</td>
                      <td className="py-4">
                        <span className={`font-semibold ${pos.orderType === 'BUY' ? 'text-[#32CD32]' : 'text-red-400'}`}>
                          {pos.orderType}
                        </span>
                      </td>
                      <td className="py-4">{pos.quantity}</td>
                      <td className="py-4">₹{formatNumber(pos.entryPrice)}</td>
                      <td className="py-4 text-[#32CD32]">{pos.targetPrice ? `₹${formatNumber(pos.targetPrice)}` : '-'}</td>
                      <td className="py-4 text-red-400">{pos.stopLossPrice ? `₹${formatNumber(pos.stopLossPrice)}` : '-'}</td>
                      <td className="py-4">₹{formatNumber(pos.currentPrice)}</td>
                      <td className="py-4">₹{formatNumber(pos.investedAmount)}</td>
                      <td className="py-4">₹{formatNumber(pos.currentValue)}</td>
                      <td className={`py-4 font-semibold ${pos.pnl >= 0 ? 'text-[#32CD32]' : 'text-red-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}₹{formatNumber(pos.pnl)}
                      </td>
                      <td className={`py-4 font-semibold ${pos.pnlPercentage >= 0 ? 'text-[#32CD32]' : 'text-red-400'}`}>
                        {pos.pnlPercentage >= 0 ? '+' : ''}{formatNumber(pos.pnlPercentage)}%
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pos.status === 'OPEN'
                            ? 'bg-blue-500/20 border border-blue-400/30 text-blue-400'
                            : 'bg-gray-500/20 border border-gray-400/30 text-gray-400'
                        }`}>
                          {pos.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPosition(pos);
                              setIsViewModalOpen(true);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded bg-[#050816] border border-white/10 text-white hover:border-[#32CD32]/30 hover:text-[#32CD32] transition-all"
                            title="View"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          {pos.status === 'OPEN' && (
                            <button
                              onClick={() => {
                                setSelectedPosition(pos);
                                setEditForm({
                                  currentPrice: pos.currentPrice,
                                  quantity: pos.quantity,
                                  targetPrice: pos.targetPrice || '',
                                  stopLossPrice: pos.stopLossPrice || '',
                                  status: pos.status
                                });
                                setIsEditModalOpen(true);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded bg-[#050816] border border-white/10 text-white hover:border-[#32CD32]/30 hover:text-[#32CD32] transition-all"
                              title="Edit"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                          )}
                          {pos.status === 'OPEN' && (
                            <button
                              onClick={() => {
                                setSelectedPosition(pos);
                                setSellForm({ quantity: pos.quantity, loading: false });
                                setIsSellModalOpen(true);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded bg-red-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all"
                              title="Sell"
                            >
                              S
                            </button>
                          )}
                          {pos.status === 'OPEN' && (
                            <button
                              onClick={() => handleClosePosition(pos)}
                              className="flex items-center justify-center w-8 h-8 rounded bg-[#050816] border border-white/10 text-white hover:border-red-400/30 hover:text-red-400 transition-all"
                              title="Close Position"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Position Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Add Position</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPosition} className="space-y-4">
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Symbol</label>
                <input
                  type="text"
                  required
                  value={addForm.symbol}
                  onChange={(e) => setAddForm({ ...addForm, symbol: e.target.value })}
                  placeholder="e.g. NIFTY, RELIANCE"
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Exchange</label>
                <select
                  value={addForm.exchange}
                  onChange={(e) => setAddForm({ ...addForm, exchange: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none"
                >
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Order Type</label>
                <select
                  value={addForm.orderType}
                  onChange={(e) => setAddForm({ ...addForm, orderType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none"
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={addForm.quantity}
                  onChange={(e) => setAddForm({ ...addForm, quantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Entry Price</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={addForm.entryPrice}
                  onChange={(e) => setAddForm({ ...addForm, entryPrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Target Price (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.targetPrice}
                  onChange={(e) => setAddForm({ ...addForm, targetPrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Stop Loss (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.stopLossPrice}
                  onChange={(e) => setAddForm({ ...addForm, stopLossPrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Current Price (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={addForm.currentPrice}
                  onChange={(e) => setAddForm({ ...addForm, currentPrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
                >
                  Add Position
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Position Modal */}
      {isViewModalOpen && selectedLivePosition && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Position Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Symbol</span>
                <span className="font-semibold">{selectedLivePosition.symbol}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Exchange</span>
                <span>{selectedLivePosition.exchange}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Order Type</span>
                <span className={`font-semibold ${selectedLivePosition.orderType === 'BUY' ? 'text-[#32CD32]' : 'text-red-400'}`}>
                  {selectedLivePosition.orderType}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Quantity</span>
                <span>{selectedLivePosition.quantity}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Entry Price</span>
                <span className="font-semibold">₹{formatNumber(selectedLivePosition.entryPrice)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Target Price</span>
                <span className="font-semibold text-[#32CD32]">{selectedLivePosition.targetPrice ? `₹${formatNumber(selectedLivePosition.targetPrice)}` : '-'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Stop Loss</span>
                <span className="font-semibold text-red-400">{selectedLivePosition.stopLossPrice ? `₹${formatNumber(selectedLivePosition.stopLossPrice)}` : '-'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Current Price</span>
                <span className="font-semibold">₹{formatNumber(selectedLivePosition.currentPrice)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Invested Amount</span>
                <span className="font-semibold">₹{formatNumber(selectedLivePosition.investedAmount)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Current Value</span>
                <span className="font-semibold">₹{formatNumber(selectedLivePosition.currentValue)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">P&L</span>
                <span className={`font-semibold ${selectedLivePosition.pnl >= 0 ? 'text-[#32CD32]' : 'text-red-400'}`}>
                  {selectedLivePosition.pnl >= 0 ? '+' : ''}₹{formatNumber(selectedLivePosition.pnl)}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">P&L %</span>
                <span className={`font-semibold ${selectedLivePosition.pnlPercentage >= 0 ? 'text-[#32CD32]' : 'text-red-400'}`}>
                  {selectedLivePosition.pnlPercentage >= 0 ? '+' : ''}{formatNumber(selectedLivePosition.pnlPercentage)}%
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedLivePosition.status === 'OPEN'
                    ? 'bg-blue-500/20 border border-blue-400/30 text-blue-400'
                    : 'bg-gray-500/20 border border-gray-400/30 text-gray-400'
                }`}>
                  {selectedLivePosition.status}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="mt-6 w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Edit Position Modal */}
      {isEditModalOpen && selectedPosition && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Edit Position</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditPosition} className="space-y-4">
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Current Price</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={editForm.currentPrice}
                  onChange={(e) => setEditForm({ ...editForm, currentPrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Target Price (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.targetPrice}
                  onChange={(e) => setEditForm({ ...editForm, targetPrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Stop Loss (Optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.stopLossPrice}
                  onChange={(e) => setEditForm({ ...editForm, stopLossPrice: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
                >
                  Update Position
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Sell Position Modal */}
      {isSellModalOpen && selectedLivePosition && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Sell {selectedLivePosition.symbol}</h3>
              <button onClick={() => setIsSellModalOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-[#050816] rounded-xl p-4 border border-white/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#B8C0D4]">Symbol</span>
                  <span className="font-semibold">{selectedLivePosition.symbol}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#B8C0D4]">Quantity Available</span>
                  <span>{selectedLivePosition.quantity}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#B8C0D4]">Entry Price</span>
                  <span>₹{formatNumber(selectedLivePosition.entryPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#B8C0D4]">Current Price</span>
                  <span>₹{formatNumber(selectedLivePosition.currentPrice)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Quantity to Sell</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedLivePosition.quantity}
                  value={sellForm.quantity}
                  onChange={(e) => setSellForm({ ...sellForm, quantity: Number(e.target.value) })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>

              <div className="bg-[#050816] rounded-xl p-4 border border-white/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#B8C0D4]">Estimated P&L</span>
                  <span className={`font-semibold ${selectedSellPnl >= 0 ? 'text-[#32CD32]' : 'text-red-400'}`}>
                    {selectedSellPnl >= 0 ? '+' : ''}₹{formatNumber(selectedSellPnl)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#B8C0D4]">Estimated Value</span>
                  <span className="font-semibold">₹{formatNumber(selectedSellValue)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsSellModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSellPosition}
                  disabled={sellForm.loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
                >
                  {sellForm.loading ? 'Selling...' : 'Sell Position'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
