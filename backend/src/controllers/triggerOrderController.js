import TriggerOrder from '../models/TriggerOrder.model.js';
import Position from '../models/Position.model.js';
import { getMarketData } from '../services/marketDataProvider.js';

/**
 * POST /api/trigger-orders
 * Create a new trigger order (PENDING state).
 */
export const createTriggerOrder = async (req, res) => {
  try {
    const {
      symbol,
      exchange = 'NSE',
      orderType,
      triggerPrice,
      quantity,
      positionToSellId,
      notes,
    } = req.body;

    if (!symbol || !orderType || !triggerPrice || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'symbol, orderType, triggerPrice and quantity are required',
      });
    }

    if (!['BUY', 'SELL'].includes(orderType.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'orderType must be BUY or SELL' });
    }

    const parsedTriggerPrice = Number(triggerPrice);
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedTriggerPrice) || parsedTriggerPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid trigger price' });
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    // For SELL triggers: validate that an open position exists
    if (orderType.toUpperCase() === 'SELL') {
      const query = {
        userId: req.user._id,
        symbol: symbol.toUpperCase(),
        orderType: 'BUY',
        status: 'OPEN',
      };
      if (positionToSellId) query._id = positionToSellId;
      const openPos = await Position.findOne(query);
      if (!openPos) {
        return res.status(400).json({
          success: false,
          message: `No open BUY position found for ${symbol.toUpperCase()} to place a SELL trigger`,
        });
      }
    }

    // Fetch current market price for reference
    const marketData = await getMarketData(symbol);
    const currentPrice = marketData.price;

    const triggerOrder = await TriggerOrder.create({
      userId: req.user._id,
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
      orderType: orderType.toUpperCase(),
      triggerPrice: parsedTriggerPrice,
      quantity: parsedQuantity,
      positionToSellId: positionToSellId || undefined,
      notes,
      status: 'PENDING',
    });

    return res.status(201).json({
      success: true,
      triggerOrder,
      currentPrice,
      message: `Trigger order placed! Will execute when ${symbol.toUpperCase()} reaches ₹${parsedTriggerPrice}`,
    });
  } catch (error) {
    console.error('Create Trigger Order Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/trigger-orders
 * List all trigger orders for the authenticated user.
 */
export const getTriggerOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user._id };
    if (status && ['PENDING', 'EXECUTED', 'CANCELLED'].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }
    const triggerOrders = await TriggerOrder.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, triggerOrders });
  } catch (error) {
    console.error('Get Trigger Orders Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * GET /api/trigger-orders/:id
 * Get a single trigger order by ID.
 */
export const getTriggerOrderById = async (req, res) => {
  try {
    const order = await TriggerOrder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Trigger order not found' });
    }
    return res.status(200).json({ success: true, triggerOrder: order });
  } catch (error) {
    console.error('Get Trigger Order By ID Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * PATCH /api/trigger-orders/:id/cancel
 * Cancel a PENDING trigger order.
 */
export const cancelTriggerOrder = async (req, res) => {
  try {
    const order = await TriggerOrder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Trigger order not found' });
    }
    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status ${order.status}`,
      });
    }
    order.status = 'CANCELLED';
    await order.save();
    return res.status(200).json({ success: true, triggerOrder: order, message: 'Trigger order cancelled' });
  } catch (error) {
    console.error('Cancel Trigger Order Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * DELETE /api/trigger-orders/:id
 * Delete a cancelled or executed trigger order (cleanup).
 */
export const deleteTriggerOrder = async (req, res) => {
  try {
    const order = await TriggerOrder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Trigger order not found' });
    }
    if (order.status === 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a PENDING trigger order. Cancel it first.',
      });
    }
    await TriggerOrder.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Trigger order deleted' });
  } catch (error) {
    console.error('Delete Trigger Order Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
