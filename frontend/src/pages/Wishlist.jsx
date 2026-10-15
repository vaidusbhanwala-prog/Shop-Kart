import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Heart, RefreshCw, ShoppingBag, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { getWishlist, removeFromWishlist } from '../services/api';
import WishlistCard from '../components/WishlistCard';

const Wishlist = ({ customer: _customer, onWishlistUpdate }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      if (data && Array.isArray(data.wishlist)) {
        setWishlist(data.wishlist);
        if (onWishlistUpdate) {
          onWishlistUpdate(data.wishlist.length);
        }
      } else if (Array.isArray(data)) {
        setWishlist(data);
        if (onWishlistUpdate) {
          onWishlistUpdate(data.length);
        }
      } else {
        setWishlist([]);
        if (onWishlistUpdate) {
          onWishlistUpdate(0);
        }
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'We couldn\'t load your wishlist. Please check your connection and try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [onWishlistUpdate]);

  useEffect(() => {
    fetchUserWishlist();
  }, [fetchUserWishlist]);

  const handleRemoveProduct = async (productId) => {
    await removeFromWishlist(productId);

    setWishlist((prevWishlist) => {
      const updated = prevWishlist.filter((item) => item._id !== productId);
      if (onWishlistUpdate) {
        onWishlistUpdate(updated.length);
      }
      return updated;
    });
  };

  return (
    <div className="wishlist-page-container">
      <section className="catalog-hero-section wishlist-hero">
        <div className="catalog-hero-badge">
          <Heart size={14} className="badge-heart-icon" fill="currentColor" />
          <span>My Saved Items</span>
        </div>
        <h1 className="catalog-hero-title">My Wishlist</h1>
        <p className="catalog-hero-subtitle">
          Manage and review products you've saved for future shopping.
        </p>
      </section>

      {loading ? (
        <div className="products-state-box loading-state" id="wishlist-loading-state">
          <div className="spinner-primary" />
          <h3>Loading your wishlist...</h3>
          <p>Fetching your curated collection from ShopKart.</p>
        </div>
      ) : error ? (
        <div className="products-state-box error-state" id="wishlist-error-state">
          <div className="state-icon-box error">
            <AlertCircle size={36} />
          </div>
          <h3>Something went wrong.</h3>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={fetchUserWishlist}
            id="wishlist-retry-button"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="products-state-box empty-state wishlist-empty-box" id="wishlist-empty-state">
          <div className="state-icon-box empty wishlist-empty-icon-circle">
            <Heart size={44} className="empty-heart-icon" />
          </div>
          <h2 className="empty-title">Your wishlist is empty</h2>
          <p className="empty-description">
            Save products you love and find them here later. Start exploring our catalog now.
          </p>
          <Link to="/products" className="btn btn-primary" id="browse-products-btn">
            <ShoppingBag size={18} />
            <span>Browse Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="wishlist-content-area">
          <div className="wishlist-status-bar">
            <div className="wishlist-count-badge">
              <Sparkles size={16} />
              <span>
                <strong>{wishlist.length}</strong> {wishlist.length === 1 ? 'product saved' : 'products saved'}
              </span>
            </div>

            <Link to="/products" className="btn btn-secondary btn-sm continue-shopping-link">
              <ShoppingBag size={15} />
              <span>Continue Shopping</span>
            </Link>
          </div>

          <div className="products-grid wishlist-grid" id="wishlist-grid">
            {wishlist.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                onRemove={handleRemoveProduct}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
