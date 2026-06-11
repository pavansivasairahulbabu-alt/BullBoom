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
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Current price must be positive']
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
  return this.quantity * this.currentPrice;
});

positionSchema.virtual('pnl').get(function () {
  return this.currentValue - this.investedAmount;
});

positionSchema.virtual('pnlPercentage').get(function () {
  if (this.investedAmount === 0) return 0;
  return (this.pnl / this.investedAmount) * 100;
});

// Include virtuals in JSON and object output
positionSchema.set('toJSON', { virtuals: true });
positionSchema.set('toObject', { virtuals: true });

const Position = mongoose.model('Position', positionSchema);

export default Position;