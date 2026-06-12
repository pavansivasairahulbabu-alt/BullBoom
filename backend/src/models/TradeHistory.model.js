import mongoose from 'mongoose';

const tradeHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    exchange: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ['NSE', 'BSE'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    entryPrice: {
      type: Number,
      required: true,
      min: [0, 'Entry price cannot be negative'],
    },
    exitPrice: {
      type: Number,
      required: true,
      min: [0, 'Exit price cannot be negative'],
    },
    profitLoss: {
      type: Number,
      required: true,
    },
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
      required: true,
    },
    tradeDate: {
      type: Date,
      default: Date.now,
    },
    holdingDuration: {
      type: Number, // in milliseconds
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TradeHistory = mongoose.model('TradeHistory', tradeHistorySchema);

export default TradeHistory;
