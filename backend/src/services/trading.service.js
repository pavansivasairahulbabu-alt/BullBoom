
import User from '../models/User.model.js';
import Order from '../models/Order.model.js';
import Position from '../models/Position.model.js';
import TradeHistory from '../models/TradeHistory.model.js';
import { getMarketData } from './marketDataProvider.js';
import { calculatePortfolio } from './portfolio.service.js';

export const executeBuyOrder = async (userId, { symbol, quantity, exchange = 'NSE', pattern, support, resistance, ema200 }) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    // Get current market price
    const marketData = await getMarketData(symbol);
    const currentPrice = marketData.price;
    const requiredAmount = quantity * currentPrice;

    // Verify sufficient balance
    if (user.availableBalance < requiredAmount) {
      throw new Error('Insufficient available balance');
    }

    // Create order
    const order = await Order.create(
      [{
        userId,
        symbol: symbol.toUpperCase(),
        exchange: exchange.toUpperCase(),
        orderType: 'BUY',
        quantity,
        price: currentPrice,
        status: 'EXECUTED',
        pattern,
        support,
        resistance,
        ema200,
      }],
      { session }
    );

    // Create position
    const position = await Position.create(
      [{
        userId,
        symbol: symbol.toUpperCase(),
        exchange: exchange.toUpperCase(),
        orderType: 'BUY',
        quantity,
        entryPrice: currentPrice,
        currentPrice,
        orderId: order[0]._id,
        pattern,
        support,
        resistance,
        ema200,
      }],
      { session }
    );

    // Update user wallet
    user.availableBalance -= requiredAmount;
    user.investedAmount += requiredAmount;
    await user.save({ session });

    await session.commitTransaction();

    // Recalculate portfolio after transaction
    const portfolio = await calculatePortfolio(userId);

    return {
      success: true,
      order: order[0],
      position: position[0],
      marketData,
      portfolio,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const executeSellOrder = async (userId, { positionId, quantity }) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // Find position
    const position = await Position.findById(positionId).session(session);
    if (!position || position.userId.toString() !== userId.toString()) {
      throw new Error('Position not found or not owned by user');
    }
    if (position.status !== 'OPEN') {
      throw new Error('Position already closed');
    }
    if (position.quantity < quantity) {
      throw new Error('Insufficient quantity in position');
    }

    // Get current market price
    const marketData = await getMarketData(position.symbol);
    const exitPrice = marketData.price;
    const currentValue = quantity * exitPrice;
    const pnl = (exitPrice - position.entryPrice) * quantity;

    // Create sell order
    const order = await Order.create(
      [{
        userId,
        symbol: position.symbol,
        exchange: position.exchange,
        orderType: 'SELL',
        quantity,
        price: exitPrice,
        status: 'EXECUTED',
      }],
      { session }
    );

    // Handle position
    if (position.quantity === quantity) {
      // Close entire position
      position.status = 'CLOSED';
      position.currentPrice = exitPrice;
      await position.save({ session });
    } else {
      // Partial sell, reduce quantity
      position.quantity -= quantity;
      position.currentPrice = exitPrice;
      await position.save({ session });
    }

    // Calculate holding time
    const holdingDuration = Date.now() - position.createdAt.getTime();

    // Create trade history
    await TradeHistory.create(
      [{
        userId,
        symbol: position.symbol,
        exchange: position.exchange,
        quantity,
        entryPrice: position.entryPrice,
        exitPrice,
        profitLoss: pnl,
        positionId: position._id,
        tradeDate: new Date(),
        holdingDuration,
      }],
      { session }
    );

    // Update user wallet
    user.availableBalance += currentValue;
    user.realizedPnL += pnl;
    const oldInvested = position.entryPrice * quantity;
    user.investedAmount -= oldInvested;
    await user.save({ session });

    await session.commitTransaction();

    // Recalculate portfolio after transaction
    const portfolio = await calculatePortfolio(userId);

    return {
      success: true,
      order: order[0],
      position,
      profitLoss: pnl,
      marketData,
      portfolio,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export default {
  executeBuyOrder,
  executeSellOrder,
};
