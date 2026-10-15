import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trash2, CheckCircle2, AlertTriangle, Layers, Heart, Loader2 } from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const WishlistCard = ({ product, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState(null);

  if (!product) return null;

  const { _id, name, price, category, image, stock } = product;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleRemove = async (e) => {
    e.preventDefault();
    if (isRemoving) return;

    try {
      setIsRemoving(true);
      setRemoveError(null);
      await onRemove(_id);
    } catch (err) {
      setRemoveError(err.response?.data?.message || 'Failed to remove from wishlist.');
      setIsRemoving(false);
    }
  };

  return (
    <div className="product-card-item wishlist-card-item" id={`wishlist-card-${_id}`}>
      <div className="product-card-media">
        <img
          src={image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
          alt={name}
          loading="lazy"
          className="product-card-img"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
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
          className="wishlist-badge-btn active"
          onClick={handleRemove}
          disabled={isRemoving}
          title="Remove from Wishlist"
          id={`wishlist-remove-icon-${_id}`}
        >
          {isRemoving ? <Loader2 size={16} className="btn-spinner" /> : <Heart size={16} fill="currentColor" />}
        </button>
      </div>

      <div className="product-card-content">
        <h3 className="product-card-title" title={name}>
          {name}
        </h3>

        <div className="wishlist-meta-info">
          <span className="wishlist-category-tag">{category}</span>
          <div className="product-card-price-block">
            <span className="product-card-price-label">Price</span>
            <span className="product-card-price">{formatPrice(price)}</span>
          </div>
        </div>

        {removeError && (
          <div className="wishlist-card-error" role="alert">
            <AlertTriangle size={13} />
            <span>{removeError}</span>
          </div>
        )}

        <div className="wishlist-card-actions">
          <Link
            to={`/products/${_id}`}
            className="btn btn-secondary btn-sm wishlist-action-btn view-btn"
            id={`view-details-${_id}`}
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm wishlist-action-btn remove-btn"
            onClick={handleRemove}
            disabled={isRemoving}
            id={`remove-wishlist-${_id}`}
          >
            {isRemoving ? (
              <>
                <Loader2 size={14} className="btn-spinner" />
                <span>Removing...</span>
              </>
            ) : (
              <>
                <Trash2 size={14} />
                <span>Remove</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
