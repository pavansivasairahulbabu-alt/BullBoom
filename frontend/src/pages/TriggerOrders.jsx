import React, { useState, useEffect, useMemo } from 'react';
import {
  FaSearch,
  FaPlus,
  FaEye,
  FaTrash,
  FaTimes,
  FaCheck,
  FaBan
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { triggerOrderApi } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { socketService } from '../services/socketService.js';

const statusColors = {
  'PENDING': 'bg-yellow-500/20 border-yellow-400/30 text-yellow-400',
  'EXECUTED': 'bg-[#32CD32]/20 border-[#32CD32]/30 text-[#32CD32]',
  'CANCELLED': 'bg-red-500/20 border-red-400/30 text-red-400'
};

const statusTextColors = {
  'PENDING': 'text-yellow-400',
  'EXECUTED': 'text-[#32CD32]',
  'CANCELLED': 'text-red-400'
};

export default function TriggerOrders() {
  const [triggerOrders, setTriggerOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrderType, setFilterOrderType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [createForm, setCreateForm] = useState({
    symbol: '',
    exchange: 'NSE',
    orderType: 'BUY',
    quantity: '',
    triggerPrice: ''
  });

  const [searchParams] = useSearchParams();

  const fetchTriggerOrders = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await triggerOrderApi.getTriggerOrders();
      if (res.success) {
        setTriggerOrders(res.triggerOrders);
      }
    } catch (error) {
      console.error('Error fetching trigger orders:', error);
      toast.error('Failed to fetch trigger orders');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

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

    fetchTriggerOrders(true);
    
    const handleRemoteUpdate = () => fetchTriggerOrders(false);
    socketService.on('portfolioUpdated', handleRemoteUpdate);
    socketService.on('triggerExecuted', handleRemoteUpdate);

    return () => {
      socketService.off('portfolioUpdated', handleRemoteUpdate);
      socketService.off('triggerExecuted', handleRemoteUpdate);
    };
  }, [searchParams]);

  const stats = useMemo(() => {
    const total = triggerOrders.length;
    const pending = triggerOrders.filter(o => o.status === 'PENDING').length;
    const executed = triggerOrders.filter(o => o.status === 'EXECUTED').length;
    const cancelled = triggerOrders.filter(o => o.status === 'CANCELLED').length;
    return { total, pending, executed, cancelled };
  }, [triggerOrders]);

  const filteredOrders = useMemo(() => {
    let filtered = [...triggerOrders];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.symbol.toLowerCase().includes(query) ||
        order._id.toLowerCase().includes(query)
      );
    }

    if (filterOrderType !== 'All') {
      filtered = filtered.filter(order => order.orderType === filterOrderType);
    }

    if (filterStatus !== 'All') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    return filtered;
  }, [triggerOrders, searchQuery, filterOrderType, filterStatus]);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      await triggerOrderApi.createTriggerOrder(createForm);
      toast.success('Trigger order placed successfully!');
      setIsCreateModalOpen(false);
      setCreateForm({ symbol: '', exchange: 'NSE', orderType: 'BUY', quantity: '', triggerPrice: '' });
      fetchTriggerOrders(false);
    } catch (error) {
      console.error('Error creating trigger order:', error);
      toast.error(error.response?.data?.message || 'Failed to place trigger order');
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await triggerOrderApi.deleteTriggerOrder(selectedOrder._id);
      toast.success('Trigger order deleted!');
      setIsDeleteConfirmOpen(false);
      setSelectedOrder(null);
      fetchTriggerOrders(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      await triggerOrderApi.cancelTriggerOrder(selectedOrder._id);
      toast.success('Trigger order cancelled!');
      setIsCancelConfirmOpen(false);
      setSelectedOrder(null);
      fetchTriggerOrders(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Trigger Orders</h1>
            <p className="text-[#B8C0D4] text-sm md:text-base">Set target prices for automatic execution</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all"
          >
            <FaPlus className="w-4 h-4" />
            <span>Create Trigger</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Total Triggers</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Executed</div>
            <div className="text-2xl font-bold text-[#32CD32]">{stats.executed}</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
          >
            <div className="text-[#B8C0D4] text-sm mb-1">Cancelled</div>
            <div className="text-2xl font-bold text-red-400">{stats.cancelled}</div>
          </motion.div>
        </div>

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
              <option value="PENDING">PENDING</option>
              <option value="EXECUTED">EXECUTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
          {loading ? (
            <div className="py-10 text-center text-[#B8C0D4]">Loading trigger orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold mb-2">No Trigger Orders</h3>
              <p className="text-[#B8C0D4] mb-6">Set a trigger to automatically buy or sell when price hits your target.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all"
              >
                <FaPlus className="w-4 h-4 inline mr-2" />
                Create Trigger
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[#B8C0D4] text-sm border-b border-white/10">
                    <th className="pb-3 font-semibold">Symbol</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Trigger Price</th>
                    <th className="pb-3 font-semibold">Quantity</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Execution Info</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ backgroundColor: 'rgba(234,179,8,0.05)' }}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-4 font-semibold">{order.symbol}</td>
                      <td className="py-4">
                        <span className={`font-semibold ${order.orderType === 'BUY' ? 'text-[#32CD32]' : 'text-red-400'}`}>
                          {order.orderType}
                        </span>
                      </td>
                      <td className="py-4 font-semibold">₹{order.triggerPrice}</td>
                      <td className="py-4">{order.quantity}</td>
                      <td className="py-4">
                         <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 text-[#B8C0D4] text-sm">
                        {order.status === 'EXECUTED' ? (
                            <span>Exec: ₹{order.executionPrice} <br/> {formatDate(order.executedAt)}</span>
                        ) : order.status === 'PENDING' ? (
                            <span>Waiting...</span>
                        ) : (
                            <span>-</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsViewModalOpen(true);
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded bg-[#050816] border border-white/10 text-white hover:border-yellow-400/30 hover:text-yellow-400 transition-all"
                            title="View"
                          >
                            <FaEye className="w-4 h-4" />
                          </button>
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsCancelConfirmOpen(true);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded bg-[#050816] border border-white/10 text-yellow-400 hover:border-yellow-400/30 transition-all"
                              title="Cancel Trigger"
                            >
                              <FaBan className="w-4 h-4" />
                            </button>
                          )}
                           {(order.status === 'CANCELLED' || order.status === 'EXECUTED') && (
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setIsDeleteConfirmOpen(true);
                              }}
                              className="flex items-center justify-center w-8 h-8 rounded bg-[#050816] border border-white/10 text-red-400 hover:border-red-400/30 transition-all"
                              title="Delete Record"
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

      {/* Create Trigger Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Create Trigger Order</h3>
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
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-yellow-400/30 transition-all"
                />
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
                <label className="text-xs text-[#B8C0D4] mb-1 block">Trigger Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={createForm.triggerPrice}
                  onChange={(e) => setCreateForm({ ...createForm, triggerPrice: e.target.value })}
                  placeholder="Target price to execute order"
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-yellow-400/30 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-[#B8C0D4] mb-1 block">Quantity</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={createForm.quantity}
                  onChange={(e) => setCreateForm({ ...createForm, quantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white outline-none focus:border-yellow-400/30 transition-all"
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
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-300 text-[#050816] font-semibold hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all"
                >
                  Set Trigger
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Trigger Modal */}
      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Trigger Details</h3>
              <button onClick={() => setIsViewModalOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Trigger ID</span>
                <span className="font-mono text-sm">{selectedOrder._id}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Symbol</span>
                <span className="font-semibold">{selectedOrder.symbol}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Order Type</span>
                <span className={`font-semibold ${selectedOrder.orderType === 'BUY' ? 'text-[#32CD32]' : 'text-red-400'}`}>
                  {selectedOrder.orderType}
                </span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Trigger Price</span>
                <span className="font-semibold text-yellow-400">₹{selectedOrder.triggerPrice}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Quantity</span>
                <span>{selectedOrder.quantity}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                <span className="text-[#B8C0D4]">Status</span>
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${statusColors[selectedOrder.status]}`}>
                  {selectedOrder.status}
                </span>
              </div>
              {selectedOrder.status === 'EXECUTED' && (
                <>
                  <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                    <span className="text-[#B8C0D4]">Execution Price</span>
                    <span className="font-semibold text-[#32CD32]">₹{selectedOrder.executionPrice}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-[#050816]">
                    <span className="text-[#B8C0D4]">Executed At</span>
                    <span>{formatDate(selectedOrder.executedAt)}</span>
                  </div>
                </>
              )}
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

      {/* Cancel Confirm Modal */}
      {isCancelConfirmOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0B1220] border border-white/10 rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Cancel Trigger Order</h3>
              <button onClick={() => setIsCancelConfirmOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#B8C0D4] mb-6">
              Are you sure you want to cancel the trigger for{' '}
              <span className="text-white font-semibold">{selectedOrder.symbol}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-[#050816] border border-white/10 text-white hover:bg-[#050816]/80 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelOrder}
                className="flex-1 px-4 py-3 rounded-xl bg-yellow-500 text-[#050816] font-semibold hover:bg-yellow-400 transition-all"
              >
                Yes, Cancel
              </button>
            </div>
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
              <h3 className="text-xl font-bold text-red-400">Delete Record</h3>
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="text-[#B8C0D4] hover:text-white transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#B8C0D4] mb-6">
              Are you sure you want to permanently delete this record? This action cannot be undone.
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
                className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-semibold hover:bg-red-500 hover:text-white transition-all"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
