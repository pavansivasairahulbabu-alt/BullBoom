import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { orderApi, watchlistApi } from '../services/api';
import { marketStore } from '../services/marketStore';

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

// --- Utility Functions ---
const isValidNumber = (value) => value !== null && value !== undefined && !Number.isNaN(Number(value));

const formatNumber = (value, digits = 2) => {
  if (!isValidNumber(value)) return '-';
  return Number(value).toFixed(digits);
};

const formatSignedNumber = (value, { prefix = '', suffix = '', digits = 2 } = {}) => {
  if (!isValidNumber(value)) return '-';
  const numericValue = Number(value);
  return `${numericValue >= 0 ? '+' : ''}${prefix}${Math.abs(numericValue).toFixed(digits)}${suffix}`;
};

const getChangeStyles = (value) => {
  if (!isValidNumber(value)) return 'text-[#B8C0D4]';
  return Number(value) >= 0 ? 'text-[#32CD32]' : 'text-red-400';
};

// --- Watchlist Row Component ---
const WatchlistRow = ({ item, onDelete, onBuy, onSell, onChart }) => {
  const [marketData, setMarketData] = useState(null);
  const prevPriceRef = useRef(null);
  const [priceFlash, setPriceFlash] = useState(null); // 'up', 'down', null

  useEffect(() => {
    const unsubscribe = marketStore.subscribe((data) => {
      const symbolData = data[item.symbol];
      if (symbolData) {
        if (prevPriceRef.current !== null && prevPriceRef.current !== symbolData.currentPrice) {
          setPriceFlash(symbolData.currentPrice > prevPriceRef.current ? 'up' : 'down');
          setTimeout(() => setPriceFlash(null), 300);
        }
        prevPriceRef.current = symbolData.currentPrice;
        setMarketData(symbolData);
      }
    });

    return unsubscribe;
  }, [item.symbol]);

  const price = marketData ? marketData.currentPrice : item.price;
  const change = marketData ? marketData.change : item.change;
  const changePercent = marketData ? marketData.changePercent : item.changePercent;

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ backgroundColor: 'rgba(50, 205, 50, 0.05)' }}
      className="border-b border-white/5 last:border-0 transition-colors"
    >
      <td className="py-4 pr-4 font-semibold whitespace-nowrap align-top">{item.symbol}</td>
      <td className="py-4 pr-4 whitespace-nowrap text-[#B8C0D4] align-top">{item.exchange}</td>
      <td className="py-4 pr-4 font-semibold whitespace-nowrap align-top">
        <motion.span
          key={price}
          initial={{
            backgroundColor: priceFlash === 'up' ? 'rgba(50,205,50,0.3)' : priceFlash === 'down' ? 'rgba(248,113,113,0.3)' : 'transparent'
          }}
          animate={{ backgroundColor: 'transparent' }}
          transition={{ duration: 0.3 }}
          className="px-2 py-1 rounded"
        >
          ₹{formatNumber(price)}
        </motion.span>
      </td>
      <td className={`py-4 pr-4 font-semibold whitespace-nowrap align-top ${getChangeStyles(change)}`}>
        {formatSignedNumber(change, { prefix: '₹' })}
      </td>
      <td className={`py-4 pr-4 font-semibold whitespace-nowrap align-top ${getChangeStyles(changePercent)}`}>
        {formatSignedNumber(changePercent, { suffix: '%' })}
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBuy({ ...item, marketData })}
            className="flex h-8 w-8 items-center justify-center rounded bg-[#32CD32] font-bold text-[#050816] transition-all hover:shadow-lg hover:shadow-[#32CD32]/30"
            title="Buy"
          >
            B
          </button>
          <button
            onClick={() => onSell({ ...item, marketData })}
            className="flex h-8 w-8 items-center justify-center rounded bg-red-500 font-bold text-white transition-all hover:shadow-lg hover:shadow-red-500/30"
            title="Sell"
          >
            S
          </button>
          <button
            onClick={() => onChart({ ...item, marketData })}
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#0B1220] text-white transition-all hover:border-[#32CD32]/30 hover:text-[#32CD32]"
            title="Chart"
          >
            <FaChartArea className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#0B1220] text-white transition-all hover:border-red-400/30 hover:text-red-400"
            title="Delete"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// --- Watchlist Card Component ---
const WatchlistCard = ({ item, onDelete, onBuy, onSell, onChart }) => {
  const [marketData, setMarketData] = useState(null);
  const prevPriceRef = useRef(null);
  const [priceFlash, setPriceFlash] = useState(null);

  useEffect(() => {
    const unsubscribe = marketStore.subscribe((data) => {
      const symbolData = data[item.symbol];
      if (symbolData) {
        if (prevPriceRef.current !== null && prevPriceRef.current !== symbolData.currentPrice) {
          setPriceFlash(symbolData.currentPrice > prevPriceRef.current ? 'up' : 'down');
          setTimeout(() => setPriceFlash(null), 300);
        }
        prevPriceRef.current = symbolData.currentPrice;
        setMarketData(symbolData);
      }
    });

    return unsubscribe;
  }, [item.symbol]);

  const price = marketData ? marketData.currentPrice : item.price;
  const change = marketData ? marketData.change : item.change;
  const changePercent = marketData ? marketData.changePercent : item.changePercent;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.995 }}
      className="rounded-2xl border border-white/10 bg-[#050816] p-4 shadow-[0_0_24px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-base font-semibold text-white">{item.symbol}</h3>
            <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-medium text-[#B8C0D4]">
              {item.exchange}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#B8C0D4]">
            Track the latest price and change without horizontal scrolling.
          </p>
        </div>

        <div className="text-right">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[#B8C0D4]">LTP</div>
          <motion.div
            key={price}
            initial={{
              backgroundColor: priceFlash === 'up' ? 'rgba(50,205,50,0.3)' : priceFlash === 'down' ? 'rgba(248,113,113,0.3)' : 'transparent'
            }}
            animate={{ backgroundColor: 'transparent' }}
            transition={{ duration: 0.3 }}
            className="mt-1 inline-block px-2 py-1 rounded text-lg font-semibold text-white"
          >
            ₹{formatNumber(price)}
          </motion.div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[#B8C0D4]">Change</div>
          <div className={`mt-1 whitespace-nowrap text-sm font-semibold ${getChangeStyles(change)}`}>
            {formatSignedNumber(change, { prefix: '₹' })}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[#B8C0D4]">Change %</div>
          <div className={`mt-1 whitespace-nowrap text-sm font-semibold ${getChangeStyles(changePercent)}`}>
            {formatSignedNumber(changePercent, { suffix: '%' })}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          onClick={() => onBuy({ ...item, marketData })}
          className="flex h-11 items-center justify-center rounded-xl bg-[#32CD32] px-3 text-sm font-semibold text-[#050816] transition-all active:scale-[0.99]"
        >
          Buy
        </button>
        <button
          onClick={() => onSell({ ...item, marketData })}
          className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-white transition-all active:scale-[0.99]"
        >
          Sell
        </button>
        <button
          onClick={() => onChart({ ...item, marketData })}
          className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-[#B8C0D4] transition-all active:scale-[0.99]"
        >
          Chart
        </button>
        <button
          onClick={() => onDelete(item)}
          className="flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-semibold text-red-400 transition-all active:scale-[0.99]"
        >
          Delete
        </button>
      </div>
    </motion.div>
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
  const [marketData, setMarketData] = useState(null);

  useEffect(() => {
    if (!isOpen || !item) return;
    
    const unsubscribe = marketStore.subscribe((data) => {
      const symbolData = data[item.symbol];
      if (symbolData) {
        setMarketData(symbolData);
      }
    });
    
    return unsubscribe;
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const price = marketData ? marketData.currentPrice : item.price;

  const handleBuy = async () => {
    setLoading(true);
    try {
      const response = await orderApi.buy({
        symbol: item.symbol,
        quantity: quantity,
        exchange: item.exchange,
        pattern: marketData?.activePattern,
        support: marketData?.support,
        resistance: marketData?.resistance,
        ema200: marketData?.ema200
      });

      if (response.success) {
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
              <span className="font-semibold">₹{formatNumber(price)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-[#B8C0D4]">Estimated Cost</span>
              <span className="font-semibold">₹{formatNumber((price || 0) * quantity)}</span>
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

// --- Main Watchlist Component ---
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
      const response = await watchlistApi.getWatchlist();
      if (response.success) {
        setWatchlist(response.watchlist);
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
      const response = await watchlistApi.addToWatchlist({
        symbol: symbol.toUpperCase(),
        exchange: exchange.toUpperCase(),
      });
      if (response.success) {
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
      const response = await watchlistApi.removeFromWatchlist(item._id);
      if (response.success) {
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

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    if (watchlist.length === 0) return;
    const interval = setInterval(fetchWatchlist, 3000);
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