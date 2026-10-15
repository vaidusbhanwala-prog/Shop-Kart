import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateCartQuantity,
  removeFromCart as apiRemoveFromCart,
} from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children, isAuthenticated }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemLoadingMap, setItemLoadingMap] = useState({});

  const setItemLoading = (productId, isLoading) => {
    setItemLoadingMap((prev) => {
      if (isLoading) {
        return { ...prev, [productId]: true };
      }
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getCart();
      if (data && Array.isArray(data.cart)) {
        setCart(data.cart);
      } else if (Array.isArray(data)) {
        setCart(data);
      } else {
        setCart([]);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setCart([]);
      } else {
        const errorMsg =
          err.response?.data?.message || 'Unable to load your cart. Please try again.';
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId) => {
    setItemLoading(productId, true);
    setError(null);
    try {
      const data = await apiAddToCart(productId);
      if (data && Array.isArray(data.cart)) {
        setCart(data.cart);
      } else {
        await fetchCart();
      }
      return { success: true, message: data?.message || 'Product added to cart' };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Unable to add product to cart. Please try again.';
      throw new Error(errorMsg);
    } finally {
      setItemLoading(productId, false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    setItemLoading(productId, true);
    setError(null);
    try {
      const data = await apiUpdateCartQuantity(productId, quantity);
      if (data && Array.isArray(data.cart)) {
        setCart(data.cart);
      } else {
        await fetchCart();
      }
      return { success: true, message: data?.message || 'Quantity updated' };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Unable to update quantity. Please try again.';
      throw new Error(errorMsg);
    } finally {
      setItemLoading(productId, false);
    }
  };

  const removeFromCart = async (productId) => {
    setItemLoading(productId, true);
    setError(null);
    try {
      const data = await apiRemoveFromCart(productId);
      if (data && Array.isArray(data.cart)) {
        setCart(data.cart);
      } else {
        setCart((prev) => prev.filter((item) => (item.product?._id || item.product) !== productId));
      }
      return { success: true, message: data?.message || 'Product removed from cart' };
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Unable to remove product from cart.';
      throw new Error(errorMsg);
    } finally {
      setItemLoading(productId, false);
    }
  };

  const clearCart = () => {
    setCart([]);
    setError(null);
  };

  
  const totalItems = useMemo(() => {
    return cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = Number(item.quantity) || 0;
      return total + price * quantity;
    }, 0);
  }, [cart]);

  const getItemQuantity = useCallback(
    (productId) => {
      const item = cart.find(
        (entry) => (entry.product?._id || entry.product) === productId
      );
      return item ? item.quantity : 0;
    },
    [cart]
  );

  const isInCart = useCallback(
    (productId) => {
      return cart.some((entry) => (entry.product?._id || entry.product) === productId);
    },
    [cart]
  );

  const isItemLoading = useCallback(
    (productId) => {
      return Boolean(itemLoadingMap[productId]);
    },
    [itemLoadingMap]
  );

  const value = {
    cart,
    cartItems: cart,
    loading,
    error,
    totalItems,
    subtotal,
    itemCount: cart.length,
    addToCart,
    updateQuantity,
    removeFromCart,
    refreshCart: fetchCart,
    fetchCart,
    clearCart,
    getItemQuantity,
    isInCart,
    isItemLoading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
