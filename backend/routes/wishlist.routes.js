import express from 'express';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} from '../controllers/wishlist.controller.js';
import { protectCustomer } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protectCustomer);

router.get('/', getWishlist);

router.post('/:productId', addToWishlist);

router.delete('/:productId', removeFromWishlist);

router.patch('/:productId/toggle', toggleWishlist);
router.post('/:productId/toggle', toggleWishlist);

export default router;
