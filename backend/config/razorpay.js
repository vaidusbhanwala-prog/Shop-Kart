import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_shopkart2026lab06';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'shopkart_razorpay_secret_key_2026';

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret,
});

export default razorpayInstance;
