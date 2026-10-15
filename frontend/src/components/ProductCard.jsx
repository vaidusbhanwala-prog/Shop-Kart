import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Heart,
  Loader2,
  AlertCircle,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const ProductCard = ({
  product,
  isWishlisted: initialIsWishlisted = false,
  onWishlistChange,
}) => {
  const navigate = useNavigate();
  const { addToCart, getItemQuantity, isItemLoading } = useCart();
  const { _id, name, price, category, image, stock } = product;

  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
  const [wishlistStatus, setWishlistStatus] = useState('idle');
  const [cartError, setCartError] = useState(null);
  const [cartSuccess, setCartSuccess] = useState(false);

  const cartQuantity = getItemQuantity(_id);
  const isAddingToCart = isItemLoading(_id);
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;
  const isMaxInCart = cartQuantity >= stock;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistStatus === 'saving') return;

    setWishlistStatus('saving');
    setCartError(null);

    try {
      if (isWishlisted) {
        await removeFromWishlist(_id);
        setIsWishlisted(false);
        setWishlistStatus('idle');
        if (onWishlistChange) onWishlistChange(_id, false);
      } else {
        await addToWishlist(_id);
        setIsWishlisted(true);
        setWishlistStatus('saved');
        if (onWishlistChange) onWishlistChange(_id, true);
        setTimeout(() => {
          setWishlistStatus('idle');
        }, 3000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }

      if (err.response?.status === 409) {
        setIsWishlisted(true);
        setWishlistStatus('saved');
        if (onWishlistChange) onWishlistChange(_id, true);
        return;
      }

      const msg = err.response?.data?.message || 'Unable to update wishlist. Please try again.';
      setCartError(msg);
      setWishlistStatus('idle');
      setTimeout(() => setCartError(null), 4000);
    }
  };

  const handleAddToCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isMaxInCart || isAddingToCart) return;

    setCartError(null);
    setCartSuccess(false);

    try {
      await addToCart(_id);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 2500);
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        navigate('/login');
        return;
      }
      setCartError(err.message || 'Could not add product to cart');
      setTimeout(() => setCartError(null), 4000);
    }
  };

  return (
    <div className="product-card-item" id={`product-card-${_id}`}>
      <div className="product-card-media">
        <img
          src={image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
          alt={name}
          loading="lazy"
          className="product-card-img"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
          }}
        />

        <span className="product-card-category">
          <Layers size={12} />
          {category}
        </span>

        {isOutOfStock ? (
          <span className="product-card-stock-badge out-of-stock">
            <AlertTriangle size={12} /> Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="product-card-stock-badge low-stock">
            <AlertTriangle size={12} /> Only {stock} left
          </span>
        ) : (
          <span className="product-card-stock-badge in-stock">
            <CheckCircle2 size={12} /> {stock} units left
          </span>
        )}

        <button
          type="button"
          className={`wishlist-badge-btn ${isWishlisted ? 'active' : ''} ${
            wishlistStatus === 'saving' ? 'loading' : ''
          }`}
          onClick={handleWishlistClick}
          disabled={wishlistStatus === 'saving'}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          id={`wishlist-badge-btn-${_id}`}
        >
          {wishlistStatus === 'saving' ? (
            <Loader2 size={16} className="btn-spinner" />
          ) : (
            <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
          )}
        </button>
      </div>

      <div className="product-card-content">
        <h3 className="product-card-title" title={name}>
          {name}
        </h3>

        <div className="product-card-price-block-inline">
          <span className="product-card-price-label">Price</span>
          <span className="product-card-price">{formatPrice(price)}</span>
        </div>

        {cartError && (
          <div className="wishlist-inline-error" role="alert">
            <AlertCircle size={13} />
            <span>{cartError}</span>
          </div>
        )}

        <div className="product-card-footer">
          <Link
            to={`/products/${_id}`}
            className="btn btn-secondary btn-sm product-view-btn"
            id={`view-details-${_id}`}
          >
            <span>Details</span>
            <ArrowRight size={14} />
          </Link>

          <button
            type="button"
            className={`btn btn-sm btn-cart-toggle ${cartQuantity > 0 ? 'in-cart' : ''}`}
            onClick={handleAddToCartClick}
            disabled={isOutOfStock || isMaxInCart || isAddingToCart}
            id={`add-to-cart-btn-${_id}`}
            title={
              isOutOfStock
                ? 'Out of Stock'
                : isMaxInCart
                ? `Maximum available units (${stock}) already in cart`
                : cartQuantity > 0
                ? 'Add another unit to cart'
                : 'Add product to cart'
            }
          >
            {isAddingToCart ? (
              <>
                <Loader2 size={14} className="btn-spinner" />
                <span>Adding...</span>
              </>
            ) : cartSuccess ? (
              <>
                <CheckCircle2 size={14} />
                <span>Added!</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : cartQuantity > 0 ? (
              <>
                <Plus size={14} />
                <span>Add Another ({cartQuantity})</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
