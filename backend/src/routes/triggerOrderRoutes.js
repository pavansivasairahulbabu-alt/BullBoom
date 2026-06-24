import express from 'express';
import {
  createTriggerOrder,
  getTriggerOrders,
  getTriggerOrderById,
  cancelTriggerOrder,
  deleteTriggerOrder,
} from '../controllers/triggerOrderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// CRUD
router.post('/', createTriggerOrder);
router.get('/', getTriggerOrders);
router.get('/:id', getTriggerOrderById);
router.patch('/:id/cancel', cancelTriggerOrder);
router.delete('/:id', deleteTriggerOrder);

export default router;
