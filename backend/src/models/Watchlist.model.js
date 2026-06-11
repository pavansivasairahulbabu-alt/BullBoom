import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
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
    }
  },
  { timestamps: true }
);

// Prevent duplicate entries for the same user, symbol, and exchange
watchlistSchema.index({ userId: 1, symbol: 1, exchange: 1 }, { unique: true });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

export default Watchlist;