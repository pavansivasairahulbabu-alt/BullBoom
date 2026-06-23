import Position from '../models/Position.model.js';

// @desc    Get all positions of logged-in user
// @route   GET /api/positions
// @access  Private
export const getPositions = async (req, res) => {
  try {
    const positions = await Position.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, positions });
  } catch (error) {
    console.error('Get positions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Get single position by id
// @route   GET /api/positions/:id
// @access  Private
export const getPositionById = async (req, res) => {
  try {
    const position = await Position.findOne({ _id: req.params.id, userId: req.user._id });
    if (!position) {
      return res.status(404).json({ success: false, message: 'Position not found' });
    }
    res.status(200).json({ success: true, position });
  } catch (error) {
    console.error('Get position by id error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Create position manually
// @route   POST /api/positions
// @access  Private
export const createPosition = async (req, res) => {
  try {
    const { symbol, exchange, orderType, quantity, entryPrice, targetPrice, stopLossPrice, currentPrice } = req.body;

    if (!symbol || !exchange || !orderType || !quantity || !entryPrice) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided' });
    }

    const position = await Position.create({
      userId: req.user._id,
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
      orderType: orderType.toUpperCase(),
      quantity: Number(quantity),
      entryPrice: Number(entryPrice),
      targetPrice: targetPrice ? Number(targetPrice) : undefined,
      stopLossPrice: stopLossPrice ? Number(stopLossPrice) : undefined,
      currentPrice: Number(currentPrice || entryPrice),
      status: 'OPEN'
    });

    res.status(201).json({ success: true, position, message: 'Position created successfully' });
  } catch (error) {
    console.error('Create position error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Update position
// @route   PUT /api/positions/:id
// @access  Private
export const updatePosition = async (req, res) => {
  try {
    const position = await Position.findOne({ _id: req.params.id, userId: req.user._id });
    if (!position) {
      return res.status(404).json({ success: false, message: 'Position not found' });
    }

    const updatedPosition = await Position.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    );

    res.status(200).json({ success: true, position: updatedPosition, message: 'Position updated successfully' });
  } catch (error) {
    console.error('Update position error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Delete/Close position
// @route   DELETE /api/positions/:id
// @access  Private
export const deletePosition = async (req, res) => {
  try {
    const position = await Position.findOne({ _id: req.params.id, userId: req.user._id });
    if (!position) {
      return res.status(404).json({ success: false, message: 'Position not found' });
    }

    // If position is still OPEN, mark as CLOSED instead of deleting
    if (position.status === 'OPEN') {
      const closedPosition = await Position.findByIdAndUpdate(
        req.params.id,
        { status: 'CLOSED' },
        { new: true }
      );
      return res.status(200).json({ success: true, position: closedPosition, message: 'Position closed successfully' });
    }

    // If already CLOSED, delete it
    await Position.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Position deleted successfully' });
  } catch (error) {
    console.error('Delete position error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};