import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

export const protectCustomer = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid token',
      });
    }

    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found',
      });
    }

    req.user = customer;
    req.customer = customer;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const protect = protectCustomer;
export const protectUser = protectCustomer;
export default protectCustomer;
