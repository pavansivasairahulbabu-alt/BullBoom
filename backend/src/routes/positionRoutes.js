import express from 'express';
import {
  getPositions,
  getPositionById,
  createPosition,
  updatePosition,
  deletePosition
} from '../controllers/positionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getPositions)
  .post(protect, createPosition);

router.route('/:id')
  .get(protect, getPositionById)
  .put(protect, updatePosition)
  .delete(protect, deletePosition);

export default router;