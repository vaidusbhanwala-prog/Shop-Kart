import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

const getPopulatedCart = async (userId) => {
  const user = await Customer.findById(userId).populate({
    path: 'cart.product',
    select: 'name description price category image stock createdAt',
  });

  if (!user || !Array.isArray(user.cart)) {
    return [];
  }

  return user.cart.filter((item) => item.product != null);
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }

    const existingItemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      const newQuantity = user.cart[existingItemIndex].quantity + 1;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more: Requested quantity (${newQuantity}) exceeds available stock (${product.stock})`,
        });
      }

      user.cart[existingItemIndex].quantity = newQuantity;
    } else {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot add to cart: Product is out of stock',
        });
      }

      user.cart.push({
        product: product._id,
        quantity: 1,
      });
    }

    await user.save();

    const populatedCart = await getPopulatedCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: populatedCart,
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while adding to cart',
    });
  }
};

export const getCart = async (req, res) => {
  try {
    const populatedCart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching cart',
    });
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    if (quantity === undefined || quantity === null || typeof quantity !== 'number' || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a valid number',
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${quantity}) exceeds available stock (${product.stock})`,
      });
    }

    user.cart[itemIndex].quantity = quantity;
    await user.save();

    const populatedCart = await getPopulatedCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Quantity updated',
      cart: populatedCart,
    });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating cart quantity',
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    user.cart.splice(itemIndex, 1);
    await user.save();

    const populatedCart = await getPopulatedCart(user._id);

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
      cart: populatedCart,
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while removing from cart',
    });
  }
};
