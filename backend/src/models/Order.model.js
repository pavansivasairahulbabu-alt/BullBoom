import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    status: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ['OPEN', 'EXECUTED', 'CANCELLED'],
      default: 'OPEN'
    },
    executionType: {
      type: String,
      enum: ['MANUAL', 'AUTO_EXIT'],
      default: 'MANUAL'
    },
    exitReason: {
      type: String,
      enum: ['TARGET HIT', 'STOP LOSS HIT']
    },
    executionId: {
      type: String,
      trim: true
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
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;
