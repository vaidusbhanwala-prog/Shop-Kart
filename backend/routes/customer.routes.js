import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
} from '../controllers/customer.controller.js';
import { protectCustomer } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/me', protectCustomer, getProfile);
router.post('/logout', logoutCustomer);
router.patch('/change-password', protectCustomer, changePassword);

export default router;
