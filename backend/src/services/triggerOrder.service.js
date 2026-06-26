/**
 * Trigger Order Service
 * Watches live market prices and auto-executes pending trigger orders
 * when conditions are met.
 */

import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import Position from '../models/Position.model.js';
import TradeHistory from '../models/TradeHistory.model.js';
import TriggerOrder from '../models/TriggerOrder.model.js';
import { getMarketData } from './marketDataProvider.js';
import { calculatePortfolio } from './portfolio.service.js';

// Will be injected by server.js after Socket.IO is initialised
let _io = null;
export const setSocketIO = (io) => { _io = io; };

/**
 * Emit a real-time notification to a specific user.
 */
const notifyUser = (userId, event, data) => {
  if (_io) {
    _io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Execute a BUY trigger order.
 * Deducts balance, creates Position + Order, marks trigger EXECUTED.
 */
const executeBuyTrigger = async (trigger, currentPrice) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(trigger.userId).session(session);
    if (!user) throw new Error('User not found');

    const requiredAmount = currentPrice * trigger.quantity;
    if (user.availableBalance < requiredAmount) {
      // Not enough balance – cancel the trigger
      trigger.status = 'CANCELLED';
      await trigger.save({ session });
      await session.commitTransaction();
      notifyUser(trigger.userId, 'triggerCancelled', {
        triggerOrderId: trigger._id,
        symbol: trigger.symbol,
        reason: 'Insufficient balance at execution time',
      });
      return;
    }

    // Create executed order record
    const [order] = await Order.create([{
      userId: trigger.userId,
      symbol: trigger.symbol,
      exchange: trigger.exchange,
      orderType: 'BUY',
      quantity: trigger.quantity,
      price: currentPrice,
      status: 'EXECUTED',
      executionType: 'MANUAL',
    }], { session });

    // Create position
    const [position] = await Position.create([{
      userId: trigger.userId,
      symbol: trigger.symbol,
      exchange: trigger.exchange,
      orderType: 'BUY',
      quantity: trigger.quantity,
      entryPrice: currentPrice,
      currentPrice,
      orderId: order._id,
    }], { session });

    // Deduct balance
    user.availableBalance -= requiredAmount;
    user.investedAmount += requiredAmount;
    await user.save({ session });

    // Mark trigger as EXECUTED
    trigger.status = 'EXECUTED';
    trigger.executionPrice = currentPrice;
    trigger.executedAt = new Date();
    trigger.positionId = position._id;
    await trigger.save({ session });

    await session.commitTransaction();

    // Calculate updated portfolio
    const portfolio = await calculatePortfolio(trigger.userId);

    // Real-time notifications
    notifyUser(trigger.userId, 'triggerExecuted', {
      triggerOrderId: trigger._id,
      orderType: 'BUY',
      symbol: trigger.symbol,
      quantity: trigger.quantity,
      triggerPrice: trigger.triggerPrice,
      executionPrice: currentPrice,
      position,
      portfolio,
      message: `🟢 BUY trigger executed for ${trigger.symbol} at ₹${currentPrice.toFixed(2)}`,
    });

    notifyUser(trigger.userId, 'portfolioUpdated', { portfolio });

    console.log(`[TRIGGER] BUY executed: ${trigger.symbol} x${trigger.quantity} @ ₹${currentPrice.toFixed(2)}`);
  } catch (err) {
    await session.abortTransaction();
    console.error('[TRIGGER] BUY execution error:', err.message);
  } finally {
    session.endSession();
  }
};

/**
 * Execute a SELL trigger order.
 * Finds the target open position, sells it, records trade history.
 */
const executeSellTrigger = async (trigger, currentPrice) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(trigger.userId).session(session);
    if (!user) throw new Error('User not found');

    // Find the open BUY position for this symbol (or specific positionToSellId)
    const positionQuery = {
      userId: trigger.userId,
      symbol: trigger.symbol,
      orderType: 'BUY',
      status: 'OPEN',
    };
    if (trigger.positionToSellId) {
      positionQuery._id = trigger.positionToSellId;
    }

    const position = await Position.findOne(positionQuery)
      .sort({ createdAt: 1 })
      .session(session);

    if (!position) {
      // No open position to sell – cancel trigger
      trigger.status = 'CANCELLED';
      await trigger.save({ session });
      await session.commitTransaction();
      notifyUser(trigger.userId, 'triggerCancelled', {
        triggerOrderId: trigger._id,
        symbol: trigger.symbol,
        reason: 'No open position found at execution time',
      });
      return;
    }

    const sellQty = Math.min(trigger.quantity, position.quantity);
    const saleValue = currentPrice * sellQty;
    const pnl = (currentPrice - position.entryPrice) * sellQty;

    // Create executed SELL order
    const [order] = await Order.create([{
      userId: trigger.userId,
      symbol: trigger.symbol,
      exchange: trigger.exchange,
      orderType: 'SELL',
      quantity: sellQty,
      price: currentPrice,
      status: 'EXECUTED',
      executionType: 'MANUAL',
    }], { session });

    // Close or reduce position
    if (position.quantity <= sellQty) {
      position.status = 'CLOSED';
      position.exitPrice = currentPrice;
    } else {
      position.quantity -= sellQty;
      position.currentPrice = currentPrice;
    }
    await position.save({ session });

    // Create trade history record
    const holdingDuration = Date.now() - position.createdAt.getTime();
    const [trade] = await TradeHistory.create([{
      userId: trigger.userId,
      symbol: trigger.symbol,
      exchange: trigger.exchange,
      quantity: sellQty,
      entryPrice: position.entryPrice,
      exitPrice: currentPrice,
      profitLoss: pnl,
      positionId: position._id,
      positionType: 'LONG',
      status: 'CLOSED',
      source: 'ORDER',
      tradeDate: new Date(),
      timeOpened: position.createdAt,
      timeClosed: new Date(),
      holdingDuration,
    }], { session });

    // Update user wallet
    user.availableBalance += saleValue;
    user.realizedPnL += pnl;
    const oldInvested = position.entryPrice * sellQty;
    user.investedAmount = Math.max(0, user.investedAmount - oldInvested);
    await user.save({ session });

    // Mark trigger as EXECUTED
    trigger.status = 'EXECUTED';
    trigger.executionPrice = currentPrice;
    trigger.executedAt = new Date();
    trigger.tradeHistoryId = trade._id;
    await trigger.save({ session });

    await session.commitTransaction();

    const portfolio = await calculatePortfolio(trigger.userId);

    // Real-time notifications
    notifyUser(trigger.userId, 'triggerExecuted', {
      triggerOrderId: trigger._id,
      orderType: 'SELL',
      symbol: trigger.symbol,
      quantity: sellQty,
      triggerPrice: trigger.triggerPrice,
      executionPrice: currentPrice,
      profitLoss: pnl,
      trade,
      portfolio,
      message: `🔴 SELL trigger executed for ${trigger.symbol} at ₹${currentPrice.toFixed(2)} | P&L: ₹${pnl.toFixed(2)}`,
    });

    notifyUser(trigger.userId, 'portfolioUpdated', { portfolio });
    notifyUser(trigger.userId, 'tradeHistoryUpdated', { trade });

    console.log(`[TRIGGER] SELL executed: ${trigger.symbol} x${sellQty} @ ₹${currentPrice.toFixed(2)} | PnL: ₹${pnl.toFixed(2)}`);
  } catch (err) {
    await session.abortTransaction();
    console.error('[TRIGGER] SELL execution error:', err.message);
  } finally {
    session.endSession();
  }
};

/**
 * Main monitor loop.
 * Called every 2 seconds from server.js.
 * Checks ALL pending trigger orders against current market prices.
 */
export const monitorTriggerOrders = async () => {
  try {
    const pendingTriggers = await TriggerOrder.find({ status: 'PENDING' });
    if (pendingTriggers.length === 0) return;

    // Group by symbol to minimise market data API calls
    const symbolMap = {};
    for (const trigger of pendingTriggers) {
      if (!symbolMap[trigger.symbol]) symbolMap[trigger.symbol] = [];
      symbolMap[trigger.symbol].push(trigger);
    }

    for (const [symbol, triggers] of Object.entries(symbolMap)) {
      let marketData;
      try {
        marketData = await getMarketData(symbol);
      } catch (err) {
        continue; // skip this symbol this round
      }
      const currentPrice = marketData.price;

      for (const trigger of triggers) {
        // BUY: execute when price drops to or below trigger price
        if (trigger.orderType === 'BUY' && currentPrice <= trigger.triggerPrice) {
          console.log(`[TRIGGER] BUY condition met for ${symbol}: current=${currentPrice}, trigger=${trigger.triggerPrice}`);
          await executeBuyTrigger(trigger, currentPrice);
        }
        // SELL: execute when price rises to or above trigger price
        else if (trigger.orderType === 'SELL' && currentPrice >= trigger.triggerPrice) {
          console.log(`[TRIGGER] SELL condition met for ${symbol}: current=${currentPrice}, trigger=${trigger.triggerPrice}`);
          await executeSellTrigger(trigger, currentPrice);
        }
      }
    }
  } catch (err) {
    console.error('[TRIGGER] Monitor error:', err.message);
  }
};

export default { monitorTriggerOrders, setSocketIO };
