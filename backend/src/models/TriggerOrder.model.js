import mongoose from 'mongoose';

const triggerOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      trim: true,
      uppercase: true,
    },
    exchange: {
      type: String,
      required: [true, 'Exchange is required'],
      trim: true,
      uppercase: true,
      enum: ['NSE', 'BSE'],
      default: 'NSE',
    },
    orderType: {
      type: String,
      required: [true, 'Order type is required'],
      uppercase: true,
      enum: ['BUY', 'SELL'],
    },
    triggerPrice: {
      type: Number,
      required: [true, 'Trigger price is required'],
      min: [0.01, 'Trigger price must be positive'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    status: {
      type: String,
      required: true,
      uppercase: true,
      enum: ['PENDING', 'EXECUTED', 'CANCELLED'],
      default: 'PENDING',
    },
    // Set when executed
    executionPrice: {
      type: Number,
      min: [0, 'Execution price must be positive'],
    },
    executedAt: {
      type: Date,
    },
    // Reference to the created position/order on execution
    positionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
    },
    tradeHistoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TradeHistory',
    },
    // For SELL triggers - require an open position
    positionToSellId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
    },
    // Optional notes
    notes: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast lookup of pending orders by symbol
triggerOrderSchema.index({ symbol: 1, status: 1 });
triggerOrderSchema.index({ userId: 1, status: 1 });

const TriggerOrder = mongoose.model('TriggerOrder', triggerOrderSchema);

export default TriggerOrder;
