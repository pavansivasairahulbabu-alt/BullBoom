import express from 'express';
import { addToWatchlist, getWatchlist, deleteFromWatchlist } from '../controllers/watchlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/add').post(protect, addToWatchlist);
router.route('/').get(protect, getWatchlist);
router.route('/:id').delete(protect, deleteFromWatchlist);

export default router;