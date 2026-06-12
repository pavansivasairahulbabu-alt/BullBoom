
import Order from '../models/Order.model.js';
import TradeHistory from '../models/TradeHistory.model.js';
import { executeBuyOrder, executeSellOrder } from '../services/trading.service.js';
import { getMarketData } from '../services/marketDataProvider.js';

// Buy Order Endpoint
export const buyOrder = async (req, res) => {
  try {
    const { symbol, quantity, exchange } = req.body;

    if (!symbol || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Symbol and quantity are required',
      });
    }

    const result = await executeBuyOrder(req.user._id, {
      symbol,
      quantity: Number(quantity),
      exchange,
    });

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Buy Order Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to execute buy order',
    });
  }
};

// Sell Order Endpoint
export const sellOrder = async (req, res) => {
  try {
    const { positionId, quantity } = req.body;

    if (!positionId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Position ID and quantity are required',
      });
    }

    const result = await executeSellOrder(req.user._id, {
      positionId,
      quantity: Number(quantity),
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Sell Order Error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to execute sell order',
    });
  }
};

// Get All Orders for User
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get Orders Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Trade History
export const getTradeHistory = async (req, res) => {
  try {
    const trades = await TradeHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      trades,
    });
  } catch (error) {
    console.error('Get Trade History Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Price for a Symbol
export const getPrice = async (req, res) => {
  try {
    const data = await getMarketData(req.params.symbol);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Get Price Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Legacy createOrder (kept for compatibility)
export const createOrder = async (req, res) => {
  try {
    const { symbol, exchange, orderType, quantity, price } = req.body;

    if (!symbol || !exchange || !orderType || !quantity || !price) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const order = await Order.create({
      userId: req.user._id,
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
      orderType: orderType.toUpperCase(),
      quantity: Number(quantity),
      price: Number(price),
    });

    res.status(201).json({ success: true, order, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Legacy deleteOrder (kept for compatibility)
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete Order Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Legacy updateOrderStatus (kept for compatibility)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['OPEN', 'EXECUTED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: status.toUpperCase() },
      { new: true },
    );

    res.status(200).json({ success: true, order: updatedOrder, message: 'Order status updated' });
  } catch (error) {
    console.error('Update Order Status Error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
