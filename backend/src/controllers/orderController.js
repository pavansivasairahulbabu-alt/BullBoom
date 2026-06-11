import Order from '../models/Order.model.js';
import Position from '../models/Position.model.js';

// @desc    Get all orders for logged in user
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { symbol, exchange, orderType, quantity, price } = req.body;

    if (!symbol || !exchange || !orderType || !quantity || !price) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const order = await Order.create({
      userId: req.user._id,
      symbol: symbol.toUpperCase(),
      exchange: exchange.toUpperCase(),
      orderType: orderType.toUpperCase(),
      quantity: Number(quantity),
      price: Number(price)
    });

    res.status(201).json({ success: true, order, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['OPEN', 'EXECUTED', 'CANCELLED'];
    if (!validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: status.toUpperCase() },
      { new: true }
    );

    // If order becomes EXECUTED, create Position
    if (status.toUpperCase() === 'EXECUTED') {
      const existingPosition = await Position.findOne({
        userId: req.user._id,
        orderId: order._id
      });

      if (!existingPosition) {
        await Position.create({
          userId: req.user._id,
          symbol: order.symbol,
          exchange: order.exchange,
          orderType: order.orderType,
          quantity: order.quantity,
          entryPrice: order.price,
          currentPrice: order.price,
          orderId: order._id,
          status: 'OPEN'
        });
      }
    }

    res.status(200).json({ success: true, order: updatedOrder, message: 'Order status updated' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};