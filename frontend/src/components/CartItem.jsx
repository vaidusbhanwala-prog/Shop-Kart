import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Minus,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart, isItemLoading } = useCart();
  const [errorMessage, setErrorMessage] = useState(null);

  if (!item || !item.product) return null;

  const { product, quantity } = item;
  const { _id, name, price, category, image, stock } = product;

  const isLoading = isItemLoading(_id);
  const isOutOfStock = stock <= 0;
  const isMaxStockReached = quantity >= stock;
  const isMinQuantity = quantity <= 1;

  const handleDecrease = async () => {
    if (isMinQuantity || isLoading) return;
    setErrorMessage(null);
    try {
      await updateQuantity(_id, quantity - 1);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to update quantity');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleIncrease = async () => {
    if (isMaxStockReached || isLoading) return;
    setErrorMessage(null);
    try {
      await updateQuantity(_id, quantity + 1);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to update quantity');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleRemove = async () => {
    if (isLoading) return;
    setErrorMessage(null);
    try {
      await removeFromCart(_id);
    } catch (err) {
      setErrorMessage(err.message || 'Unable to remove item');
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  return (
    <div className="cart-item-card" id={`cart-item-${_id}`}>
      <Link to={`/products/${_id}`} className="cart-item-media">
        <img
          src={image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
          alt={name}
          className="cart-item-img"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
          }}
        />
      </Link>

      <div className="cart-item-info">
        <Link to={`/products/${_id}`} className="cart-item-title" title={name}>
          {name}
        </Link>

        <div className="cart-item-meta">
          {category && (
            <span className="cart-item-category">
              <Layers size={11} style={{ display: 'inline', marginRight: 3 }} />
              {category}
            </span>
          )}
          <span className="cart-item-unit-price">{formatPrice(price)} each</span>
        </div>

        {isOutOfStock ? (
          <span className="cart-item-stock-warning out-of-stock">
            <AlertTriangle size={12} /> Out of stock
          </span>
        ) : isMaxStockReached ? (
          <span className="cart-item-stock-warning">
            <AlertTriangle size={12} /> Max available stock reached ({stock})
          </span>
        ) : stock <= 5 ? (
          <span className="cart-item-stock-warning">
            <AlertTriangle size={12} /> Only {stock} left in stock
          </span>
        ) : null}

        {errorMessage && (
          <div className="cart-item-error-msg" role="alert">
            <AlertCircle size={12} />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      <div className="cart-item-controls-col">
        <div className="cart-qty-wrapper">
          <div className="cart-qty-box">
            <button
              type="button"
              className="cart-qty-btn decrease-btn"
              onClick={handleDecrease}
              disabled={isMinQuantity || isLoading}
              aria-label="Decrease quantity"
              title={isMinQuantity ? 'Use Remove for quantity 1' : 'Decrease by 1'}
              id={`cart-decrease-${_id}`}
            >
              <Minus size={14} />
            </button>
            <span className="cart-qty-val" id={`cart-qty-${_id}`}>
              {isLoading ? <Loader2 size={13} className="btn-spinner" /> : quantity}
            </span>
            <button
              type="button"
              className="cart-qty-btn increase-btn"
              onClick={handleIncrease}
              disabled={isMaxStockReached || isLoading}
              aria-label="Increase quantity"
              title={isMaxStockReached ? `Max stock is ${stock}` : 'Increase by 1'}
              id={`cart-increase-${_id}`}
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            type="button"
            className="cart-item-remove-btn"
            onClick={handleRemove}
            disabled={isLoading}
            title="Remove product from cart"
            id={`cart-remove-${_id}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="btn-spinner" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="cart-item-total-col">
        <span className="cart-item-total-label">Subtotal</span>
        <div className="cart-item-total-price" id={`cart-item-total-${_id}`}>
          {formatPrice(price * quantity)}
        </div>
      </div>
    </div>
  );
};

export default CartItem;
