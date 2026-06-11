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
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;