import React, { useState, useEffect, useMemo } from 'react';
import {
  FaSearch,
  FaPlus,
  FaEye,
  FaTrash,
  FaTimes,
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { orderApi } from '../services/api.js';
import { useSearchParams } from 'react-router-dom';
import { socketService } from '../services/socketService.js';

// --- Status Colors ---
const statusColors = {
  'OPEN': 'bg-blue-500/20 border-blue-400/30 text-blue-400',
  'EXECUTED': 'bg-[#32CD32]/20 border-[#32CD32]/30 text-[#32CD32]',
  'CANCELLED': 'bg-red-500/20 border-red-400/30 text-red-400'
};

const statusTextColors = {
  'OPEN': 'text-blue-400',
  'EXECUTED': 'text-[#32CD32]',
  'CANCELLED': 'text-red-400'
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrderType, setFilterOrderType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [createForm, setCreateForm] = useState({
    symbol: '',
    exchange: 'NSE',
    orderType: 'BUY',
    quantity: '',
    price: ''
  });

  // Get params from url (for when coming from Watchlist Buy/Sell)
  const [searchParams] = useSearchParams();

  // --- Fetch Orders ---
  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await orderApi.getOrders();
      if (res.success) {
        setOrders(res.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // --- Check for URL params (from Watchlist) ---
  useEffect(() => {
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type');

    if (symbol && type) {
      setCreateForm(prev => ({
        ...prev,
        symbol: symbol,
        orderType: type.toUpperCase()
      }));
      setIsCreateModalOpen(true);
    }

    fetchOrders(true);
    
    const handleRemoteUpdate = () => fetchOrders(false);
    socketService.on('portfolioUpdated', handleRemoteUpdate);
    socketService.on('triggerExecuted', handleRemoteUpdate);
    socketService.on('positionUpdated', handleRemoteUpdate);

    return () => {
      socketService.off('portfolioUpdated', handleRemoteUpdate);
      socketService.off('triggerExecuted', handleRemoteUpdate);
      socketService.off('positionUpdated', handleRemoteUpdate);
    };
  }, [searchParams]);

  // --- Statistics Calculations ---
  const stats = useMemo(() => {
    const total = orders.length;
    const open = orders.filter(o => o.status === 'OPEN').length;
    const executed = orders.filter(o => o.status === 'EXECUTED').length;
    const cancelled = orders.filter(o => o.status === 'CANCELLED').length;
    return { total, open, executed, cancelled };
  }, [orders]);

  // --- Filtered Orders ---
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.symbol.toLowerCase().includes(query) ||
        order._id.toLowerCase().includes(query)
      );
    }

    // Order type filter
    if (filterOrderType !== 'All') {
      filtered = filtered.filter(order => order.orderType === filterOrderType);
    }

    // Status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    return filtered;
  }, [orders, searchQuery, filterOrderType, filterStatus]);

  // --- Handle Create Order ---
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await orderApi.createOrder(createForm);
      toast.success('Order placed successfully!');
      setIsCreateModalOpen(false);
      setCreateForm({ symbol: '', exchange: 'NSE', orderType: 'BUY', quantity: '', price: '' });
      fetchOrders(false);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  };

  // --- Handle Delete Order ---
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await orderApi.deleteOrder(selectedOrder._id);
      toast.success('Order deleted!');
      setIsDeleteConfirmOpen(false);
      setSelectedOrder(null);
      fetchOrders(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  // --- Handle Update Order Status ---
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      toast.success('Order status updated!');
      fetchOrders(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // --- Format Date ---
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Orders</h1>
            <p className="text-[#B8C0D4] text-sm md:text-base">Manage your trading orders</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
          >
            <FaPlus className="w-4 h-4" />
            <span>Create Manual Trade</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Total Orders</div>
            <div className="text-2xl font-bold text-[#32CD32]">{stats.total}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Open Orders</div>
            <div className="text-2xl font-bold text-blue-400">{stats.open}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Executed Orders</div>
            <div className="text-2xl font-bold text-[#32CD32]">{stats.executed}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Cancelled Orders</div>
            <div className="text-2xl font-bold text-red-400">{stats.cancelled}</div>
          </motion.div>
        </div>

        {/* Filters & Search */}
        <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#050816] border border-white/10">
              <FaSearch className="text-[#B8C0D4] w-4 h-4" />
              <input
                type="text"
                placeholder="Search by symbol or order id..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-white outline-none placeholder:text-[#B8C0D4]/50"
              />
            </div>
            <select
              value={filterOrderType}
              onChange={(e) => setFilterOrderType(e.target.value)}
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
              <option value="EXECUTED">EXECUTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
          {loading ? (
            <div className="py-10 text-center text-[#B8C0D4]">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">No Orders Found</h3>
              <p className="text-[#B8C0D4] mb-6">Start trading and manage your orders here</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
              >
                <FaPlus className="w-4 h-4 inline mr-2" />
                Create First Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#B8C0D4] text-sm border-b border-white/10">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Symbol</th>
                    <th className="pb-3 font-semibold">Exchange</th>
                    <th className="pb-3 font-semibold">Order Type</th>
                    <th className="pb-3 font-semibold">Quantity</th>
                    <th className="pb-3 font-semibold">Price</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Created At</th>
                    <th className="pb-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ backgroundColor: 'rgba(50,205,50,0.05)' }}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-4 font-mono text-sm">{order._id.slice(-8)}</td>
                      <td className="py-4 font-semibold">{order.symbol}</td>
                      <td className="py-4 text-[#B8C0D4]">{order.exchange}</td>
                      <td className="py-4">
                        <span className={`font-semibold ${order.orderType === 'BUY' ? 'text-[#32CD32]' : 'text-red-400'}`}>
                          {order.orderType}
                        </span>
                      </td>
                      <td className="py-4">{order.quantity}</td>
                      <td className="py-4 font-semibold">₹{order.price}</td>
                      <td className="py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="px-3 py-1 rounded-lg bg-[#050816] border border-white/10 text-sm font-semibold outline-none"
                          style={{ color: statusTextColors[order.status] }}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="EXECUTED">EXECUTED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="py-4 text-[#B8C0D4] text-sm">{formatDate(order.createdAt)}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsViewModalOpen(true);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded bg-[#050816] border border-white/10 text-white hover:border-[#32CD32]/30 hover:text-[#32CD32] transition-all"
                            title="View"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          {order.status === 'OPEN' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDeleteConfirmOpen(true);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded bg-[#050816] border border-white/10 text-white hover:border-red-400/30 hover:text-red-400 transition-all"
                              title="Cancel"
                            >
                              <FaTrash className="w-4 h-4" />
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

      {/* Create Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Create Order</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Symbol</label>
                <input
                  type="text"
                  required
                  value={createForm.symbol}
                  onChange={(e) => setCreateForm({ ...createForm, symbol: e.target.value })}
                  placeholder="e.g. NIFTY, RELIANCE"
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Exchange</label>
                <select
                  value={createForm.exchange}
                  onChange={(e) => setCreateForm({ ...createForm, exchange: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none"
                >
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Order Type</label>
                <select
                  value={createForm.orderType}
                  onChange={(e) => setCreateForm({ ...createForm, orderType: e.target.value })}
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
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Price</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={createForm.price}
                  onChange={(e) => setCreateForm({ ...createForm, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-[#32CD32]/30 transition-all"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#32CD32] to-[#39FF14] text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(50,205,50,0.3)] transition-all"
                >
                  Place Order
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Order Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Order Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Order ID</span>
                <span className="font-mono">{selectedOrder._id}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Symbol</span>
                <span className="font-semibold">{selectedOrder.symbol}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Exchange</span>
                <span>{selectedOrder.exchange}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Order Type</span>
                <span className={`font-semibold ${selectedOrder.orderType === 'BUY' ? 'text-[#32CD32]' : 'text-red-400'}`}>
                  {selectedOrder.orderType}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Quantity</span>
                <span>{selectedOrder.quantity}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Price</span>
                <span className="font-semibold">₹{selectedOrder.price}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Created Date</span>
                <span>{formatDate(selectedOrder.createdAt)}</span>
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

      {/* Delete Confirm Modal */}
      {isDeleteConfirmOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Cancel Order</h3>
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#B8C0D4] mb-6">
              Are you sure you want to cancel order for{' '}
              <span className="text-white font-semibold">{selectedOrder.symbol}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
              >
                Yes, Cancel Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}