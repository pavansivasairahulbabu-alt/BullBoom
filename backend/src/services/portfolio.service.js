import User from '../models/User.model.js';
import Position from '../models/Position.model.js';
import { getMarketData } from './marketDataProvider.js';

export const calculatePortfolio = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Get all open positions and update with current market data
  const openPositions = await Position.find({ userId, status: 'OPEN' });
  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalUnrealizedPnL = 0;

  for (const position of openPositions) {
    const marketData = await getMarketData(position.symbol);
    position.currentPrice = marketData.price;
    await position.save();

    const invested = position.quantity * position.entryPrice;
    const currentVal = position.quantity * position.currentPrice;
    
    // Calculate P&L based on position type
    let pnl;
    if (position.orderType === 'BUY') {
      // For BUY: Profit/Loss = (Current Price - Entry Price) × Quantity
      pnl = (position.currentPrice - position.entryPrice) * position.quantity;
    } else if (position.orderType === 'SELL') {
      // For SELL (Short): Profit/Loss = (Entry Price - Current Price) × Quantity
      pnl = (position.entryPrice - position.currentPrice) * position.quantity;
    } else {
      pnl = 0;
    }

    totalInvested += invested;
    totalCurrentValue += currentVal;
    totalUnrealizedPnL += pnl;
  }

  // Calculate portfolio metrics using single source of truth
  const availableBalance = user.availableBalance;
  const portfolioValue = availableBalance + totalCurrentValue;
  const totalPnL = user.realizedPnL + totalUnrealizedPnL;

  return {
    virtualBalance: user.virtualBalance,
    availableBalance,
    investedAmount: totalInvested,
    portfolioValue,
    realizedPnL: user.realizedPnL,
    unrealizedPnL: totalUnrealizedPnL,
    totalPnL
  };
};

export default { calculatePortfolio };
