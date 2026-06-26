import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      trim: true,
      uppercase: true
    },
    exchange: {
      type: String,
      required: [true, 'Exchange is required'],
      trim: true,
      uppercase: true,
      enum: ['NSE', 'BSE']
    },
    orderType: {
      type: String,
      required: [true, 'Order type is required'],
      trim: true,
      uppercase: true,
      enum: ['BUY', 'SELL']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
      min: [0, 'Entry price must be positive']
    },
    targetPrice: {
      type: Number,
      min: [0, 'Target price must be positive']
    },
    stopLossPrice: {
      type: Number,
      min: [0, 'Stop loss price must be positive']
    },
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Current price must be positive']
    },
    exitPrice: {
      type: Number,
      min: [0, 'Exit price must be positive']
    },
    status: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN'
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    // Trading simulation additional fields
    pattern: {
      type: String,
      trim: true
    },
    support: {
      type: Number
    },
    resistance: {
      type: Number
    },
    ema200: {
      type: Number
    }
  },
  {
    timestamps: true
  }
);

// Virtual fields for dynamic calculations
positionSchema.virtual('investedAmount').get(function () {
  return this.quantity * this.entryPrice;
});

positionSchema.virtual('currentValue').get(function () {
  // For open positions, use current price; for closed, use exit price
  const priceToUse = this.status === 'CLOSED' && this.exitPrice ? this.exitPrice : this.currentPrice;
  return this.quantity * priceToUse;
});

positionSchema.virtual('pnl').get(function () {
  const priceToUse = this.status === 'CLOSED' && this.exitPrice ? this.exitPrice : this.currentPrice;
  
  if (this.orderType === 'BUY') {
    // For BUY: Profit/Loss = (Current Market Price − Entry Price) × Quantity
    return (priceToUse - this.entryPrice) * this.quantity;
  } else if (this.orderType === 'SELL') {
    // For SELL (Short): Profit/Loss = (Entry Price − Current Market Price) × Quantity
    return (this.entryPrice - priceToUse) * this.quantity;
  }
  return 0;
});

positionSchema.virtual('pnlPercentage').get(function () {
  if (this.investedAmount === 0) return 0;
  
  if (this.orderType === 'BUY') {
    // For BUY: P&L % = ((Current Market Price − Entry Price) / Entry Price) × 100
    const priceToUse = this.status === 'CLOSED' && this.exitPrice ? this.exitPrice : this.currentPrice;
    return ((priceToUse - this.entryPrice) / this.entryPrice) * 100;
  } else if (this.orderType === 'SELL') {
    // For SELL (Short): P&L % = ((Entry Price − Current Market Price) / Entry Price) × 100
    const priceToUse = this.status === 'CLOSED' && this.exitPrice ? this.exitPrice : this.currentPrice;
    return ((this.entryPrice - priceToUse) / this.entryPrice) * 100;
  }
  return 0;
});

// Include virtuals in JSON and object output
positionSchema.set('toJSON', { virtuals: true });
positionSchema.set('toObject', { virtuals: true });

const Position = mongoose.model('Position', positionSchema);

export default Position;