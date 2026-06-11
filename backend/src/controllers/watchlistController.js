import Watchlist from '../models/Watchlist.model.js';

// @desc    Add item to watchlist
// @route   POST /api/watchlist/add
// @access  Private
export const addToWatchlist = async (req, res) => {
  try {
    const { symbol, exchange } = req.body;

    // Validate inputs
    if (!symbol || !exchange) {
      return res.status(400).json({
        success: false,
        message: 'Symbol and exchange are required'
      });
    }

    // Create watchlist item
    const watchlistItem = await Watchlist.create({
      userId: req.user._id,
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase()
    });

    res.status(201).json({
      success: true,
      message: 'Item added to watchlist successfully',
      watchlistItem
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Item already in watchlist'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
export const getWatchlist = async (req, res) => {
  try {
    let watchlist = await Watchlist.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // If user has no watchlist items, add defaults
    if (watchlist.length === 0) {
      const defaultSymbols = ["NIFTY", "BANKNIFTY", "RELIANCE", "INFY", "TCS"];
      const defaultWatchlistItems = defaultSymbols.map(symbol => ({
        userId: req.user._id,
        symbol,
        exchange: "NSE"
      }));
      await Watchlist.insertMany(defaultWatchlistItems);
      watchlist = await Watchlist.find({ userId: req.user._id }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      watchlist
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Delete item from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
export const deleteFromWatchlist = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the watchlist item (only if it belongs to the logged-in user)
    const watchlistItem = await Watchlist.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Item removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Delete from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};