
import User from '../models/User.model.js';
import Position from '../models/Position.model.js';
import Order from '../models/Order.model.js';
import Watchlist from '../models/Watchlist.model.js';
import TradeHistory from '../models/TradeHistory.model.js';
import { calculatePortfolio } from './portfolio.service.js';

export const getDashboardStats = async (userId) => {
  try {
    // Get fresh portfolio calculation (single source of truth)
    const portfolio = await calculatePortfolio(userId);

    // Get counts
    const openPositionsCount = await Position.countDocuments({ userId, status: 'OPEN' });
    const closedPositionsCount = await Position.countDocuments({ userId, status: 'CLOSED' });
    const watchlistCount = await Watchlist.countDocuments({ userId });
    const totalOrders = await Order.countDocuments({ userId });

    // Calculate today's PnL
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTrades = await TradeHistory.find({
      userId,
      tradeDate: { $gte: today, $lt: tomorrow },
    });
    const todayPnL = todayTrades.reduce((sum, trade) => sum + trade.profitLoss, 0);

    // Get total trades and calculate win rate, best/worst trades
    const allTrades = await TradeHistory.find({ userId });
    const totalTrades = allTrades.length;
    let winningTrades = 0;
    let bestTrade = null;
    let worstTrade = null;

    allTrades.forEach(trade => {
      if (trade.profitLoss > 0) winningTrades++;
      if (!bestTrade || trade.profitLoss > bestTrade.profitLoss) {
        bestTrade = trade;
      }
      if (!worstTrade || trade.profitLoss < worstTrade.profitLoss) {
        worstTrade = trade;
      }
    });
    const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(2)) : 0;

    // Get recent positions
    const recentPositions = await Position.find({ userId }).sort({ createdAt: -1 }).limit(10);

    return {
      ...portfolio,
      todayPnL,
      openPositions: openPositionsCount,
      closedPositions: closedPositionsCount,
      totalOrders,
      watchlistCount,
      winRate,
      totalTrades,
      bestTrade,
      worstTrade,
      positions: recentPositions
    };
  } catch (error) {
    console.error('Dashboard Service Error:', error);
    throw new Error('Failed to get dashboard statistics');
  }
};

export default { getDashboardStats };
