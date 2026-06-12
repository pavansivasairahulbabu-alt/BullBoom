
import React, { useState, useEffect, useMemo } from 'react';
import {
  FaSearch,
  FaPlus,
  FaTrash,
  FaChartArea,
  FaTimes,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { orderApi } from '../services/api';

// --- Common Indian Stocks & Indices ---
const COMMON_SYMBOLS = [
  'NIFTY',
  'BANKNIFTY',
  'RELIANCE',
  'INFY',
  'TCS',
  'HDFCBANK',
  'ICICIBANK',
  'SBIN',
  'HINDUNILVR',
  'ITC',
  'TATAMOTORS',
  'MARUTI',
  'ASIANPAINT',
  'WIPRO',
  'BHARTIARTL',
  'AXISBANK',
  'KOTAKBANK',
  'BAJFINANCE',
  'BAJAJFINSV',
  'HCLTECH',
];

// --- Watchlist Row Component ---
const WatchlistRow = ({
  item,
  onDelete,
  onBuy,
  onSell,
  onChart,
}) => {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: 'rgba(50, 205, 50, 0.05)' }}
      className="border-b border-white/5 last:border-0 transition-colors"
    >
      <td className="py-4 font-semibold">{item.symbol}</td>
      <td className="py-4 text-[#B8C0D4]">{item.exchange}</td>
      <td className="py-4 font-semibold">{item.price?.toFixed(2) || '-'}</td>
      <td className={`py-4 font-semibold ${item.change >= 0 ? 'text-[#32CD32]' : 'text-red-400'}`}>
        {item.change >= 0 ? '+' : ''}{item.change?.toFixed(2) || '-'}
      </td>
      <td className={`py-4 font-semibold ${item.changePercent >= 0 ? 'text-[#32CD32]' : 'text-red-400'}`}>
        {item.changePercent >= 0 ? '+' : ''}{item.changePercent?.toFixed(2) || '-'}%
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBuy(item)}
            className="flex items-center justify-center w-8 h-8 rounded bg-[#32CD32] text-[#050816] font-bold hover:shadow-lg hover:shadow-[#32CD32]/30 transition-all"
            title="Buy"
          >
            B
          </button>
          <button
            onClick={() => onSell(item)}
            className="flex items-center justify-center w-8 h-8 rounded bg-red-500 text-white font-bold hover:shadow-lg hover:shadow-red-500/30 transition-all"
            title="Sell"
          >
            S
          </button>
          <button
            onClick={() => onChart(item)}
            className="flex items-center justify-center w-8 h-8 rounded bg-[#0B1220] border border-white/10 text-white hover:border-[#32CD32]/30 hover:text-[#32CD32] transition-all"
            title="Chart"
          >
            <FaChartArea className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="flex items-center justify-center w-8 h-8 rounded bg-[#0B1220] border border-white/10 text-white hover:border-red-400/30 hover:text-red-400 transition-all"
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// --- Add Symbol Modal Component ---
const AddSymbolModal = ({ isOpen, onClose, onAdd }) => {
  const [symbol, setSymbol] = useState('');
  const [exchange, setExchange] = useState('NSE');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSymbols = useMemo(() => {
    if (!searchTerm) return COMMON_SYMBOLS;
    return COMMON_SYMBOLS.filter((s) =>
      s.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleAdd = () => {
    if (!symbol.trim()) {
      toast.error('Please select a symbol');
      return;
    }
    onAdd(symbol, exchange);
    setSymbol('');
    setSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Add Symbol to Watchlist</h3>
          <button onClick={onClose} className="text-[#B8C0D4] hover:text-white transition-colors">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Symbol Select */}
          <div>
            <label className="text-xs text-[#B8C0D4] mb-1 block">Symbol</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symbols..."
              className="w-full mb-3 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
            />
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {filteredSymbols.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSymbol(s);
                    setSearchTerm('');
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                    symbol === s
                      ? 'bg-[#32CD32]/20 text-[#32CD32] border border-[#32CD32]/30'
                      : 'bg-[#050816] border border-white/10 text-[#B8C0D4] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {symbol && (
              <div className="mt-3 text-sm text-[#32CD32]">Selected: {symbol}</div>
            )}
          </div>
          <div>
            <label className="text-xs text-[#B8C0D4] mb-1 block">Exchange</label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none"
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
          >
            Add To Watchlist
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Delete Confirmation Modal ---
const DeleteConfirmModal = ({ isOpen, onClose, item, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Delete Watchlist Item</h3>
          <button onClick={onClose} className="text-[#B8C0D4] hover:text-white transition-colors">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="text-[#B8C0D4] mb-6">
          Are you sure you want to remove <span className="text-white font-semibold">{item?.symbol}</span> from your watchlist?
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(item);
              onClose();
            }}
            className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Buy Modal ---
const BuyModal = ({ isOpen, onClose, item, onSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item) return null;

  const handleBuy = async () => {
    setLoading(true);
    try {
      const response = await orderApi.buy({
        symbol: item.symbol,
        quantity: quantity,
        exchange: item.exchange
      });

      if (response.data.success) {
        toast.success(`Buy order executed successfully!`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place buy order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Buy {item.symbol}</h3>
          <button onClick={onClose} className="text-[#B8C0D4] hover:text-white transition-colors">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#B8C0D4] mb-1 block">Exchange</label>
            <input
              type="text"
              disabled
              value={item.exchange}
              className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-[#B8C0D4]"
            />
          </div>
          <div>
            <label className="text-xs text-[#B8C0D4] mb-1 block">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              min="1"
              className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
            />
          </div>
          <div className="bg-[#050816] rounded-xl p-4 border border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-[#B8C0D4]">Current Price</span>
              <span className="font-semibold">₹{item.price?.toFixed(2) || '-'}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-[#B8C0D4]">Estimated Cost</span>
              <span className="font-semibold">₹{(item.price * quantity).toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleBuy}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
          >
            {loading ? 'Placing Order...' : 'Buy'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToBuy, setItemToBuy] = useState(null);
  const navigate = useNavigate();

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/watchlist');
      if (response.data.success) {
        setWatchlist(response.data.watchlist);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWatchlist = async (symbol, exchange) => {
    try {
      const response = await api.post('/watchlist/add', {
        symbol: symbol.toUpperCase(),
        exchange: exchange.toUpperCase(),
      });
      if (response.data.success) {
        toast.success(`${symbol} added to watchlist!`);
        fetchWatchlist();
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error(error.response?.data?.message || 'Failed to add symbol');
    }
  };

  const handleDeleteFromWatchlist = async (item) => {
    try {
      const response = await api.delete(`/watchlist/${item._id}`);
      if (response.data.success) {
        toast.success(`${item.symbol} removed from watchlist!`);
        fetchWatchlist();
      }
    } catch (error) {
      console.error('Error deleting from watchlist:', error);
      toast.error('Failed to remove symbol');
    }
  };

  const handleBuy = (item) => {
    setItemToBuy(item);
  };

  const handleSell = (item) => {
    navigate('/positions');
  };

  const handleChart = (item) => {
    navigate(`/chart/${item.symbol}`);
  };

  const filteredWatchlist = useMemo(() => {
    if (!searchQuery.trim()) return watchlist;
    return watchlist.filter((item) =>
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exchange.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [watchlist, searchQuery]);

  // --- Auto-update ---
  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    if (watchlist.length === 0) return;
    const interval = setInterval(fetchWatchlist, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, [watchlist]);

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#32CD32] rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Watchlist</h1>
            <p className="text-[#B8C0D4] text-sm md:text-base">
              Track your favorite stocks, indices, futures and options.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Symbol</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0B1220] border border-white/10 w-full">
          <FaSearch className="text-[#B8C0D4] w-4 h-4" />
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
          />
        </div>

        {/* Watchlist Table */}
        <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
          {loading ? (
            <div className="py-10 text-center text-[#B8C0D4]">Loading watchlist...</div>
          ) : filteredWatchlist.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Your watchlist is empty.</h3>
              <p className="text-[#B8C0D4] mb-6">Start tracking your favorite stocks and indices.</p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
              >
                <FaPlus className="w-4 h-4 inline mr-2" /> Add Symbol
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#B8C0D4] text-sm border-b border-white/10">
                    <th className="pb-3 font-semibold">Symbol</th>
                    <th className="pb-3 font-semibold">Exchange</th>
                    <th className="pb-3 font-semibold">LTP</th>
                    <th className="pb-3 font-semibold">Change</th>
                    <th className="pb-3 font-semibold">Change %</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWatchlist.map((item) => (
                    <WatchlistRow
                      key={item._id}
                      item={item}
                      onDelete={() => setItemToDelete(item)}
                      onBuy={handleBuy}
                      onSell={handleSell}
                      onChart={handleChart}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddSymbolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddToWatchlist}
      />
      <DeleteConfirmModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        item={itemToDelete}
        onConfirm={handleDeleteFromWatchlist}
      />
      <BuyModal
        isOpen={itemToBuy !== null}
        onClose={() => setItemToBuy(null)}
        item={itemToBuy}
        onSuccess={fetchWatchlist}
      />
    </div>
  );
}
