import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { protectCustomer } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protectCustomer);

router.post('/create-payment-order', createPaymentOrder);

router.post('/verify-payment', verifyPayment);

router.get('/', getUserOrders);

router.get('/:id', getOrderById);

router.patch('/:id/status', updateOrderStatus);

export default router;
