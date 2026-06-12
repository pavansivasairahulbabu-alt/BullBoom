import express from 'express';
import {
  getOrders,
  createOrder,
  deleteOrder,
  updateOrderStatus,
  buyOrder,
  sellOrder,
  getTradeHistory,
  getPrice
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Execute Buy/Sell orders
router.post('/buy', protect, buyOrder);
router.post('/sell', protect, sellOrder);

// Market Price
router.get('/price/:symbol', protect, getPrice);

// Trade History
router.get('/history', protect, getTradeHistory);

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/:id')
  .delete(protect, deleteOrder);

router.route('/:id/status')
  .put(protect, updateOrderStatus);

export default router;