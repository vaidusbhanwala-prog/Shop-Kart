import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, getWishlist, addToWishlist, removeFromWishlist } from '../services/api';
import { useCart } from '../context/CartContext';
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  Plus,
  Minus,
  Heart,
  Loader2,
} from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, updateQuantity, getItemQuantity, isItemLoading: _isItemLoading } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartSuccessMessage, setCartSuccessMessage] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isCartSubmitting, setIsCartSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkWishlistStatus = async () => {
      try {
        const data = await getWishlist();
        if (isMounted && data && Array.isArray(data.wishlist)) {
          const found = data.wishlist.some((item) => (item._id || item) === id);
          setIsWishlisted(found);
        }
      } catch {
        
      }
    };

    checkWishlistStatus();

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        if (isMounted) {
          setProduct(data.product || data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const status = err.response?.status;
          if (status === 404) {
            setError('Product not found. It may have been removed or does not exist.');
          } else if (status === 400) {
            setError('Invalid product identification.');
          } else {
            setError('Something went wrong while loading product details.');
          }
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchProduct();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (product && quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product || product.stock <= 0 || isCartSubmitting) return;

    try {
      setIsCartSubmitting(true);
      const currentInCart = getItemQuantity(product._id);
      
      if (currentInCart > 0) {
        const targetQuantity = currentInCart + quantity;
        if (targetQuantity > product.stock) {
          setCartSuccessMessage(`Cannot add: Requested total (${targetQuantity}) exceeds available stock (${product.stock}).`);
          setTimeout(() => setCartSuccessMessage(null), 4000);
          return;
        }
        await updateQuantity(product._id, targetQuantity);
      } else {
        if (quantity === 1) {
          await addToCart(product._id);
        } else {
          await addToCart(product._id);
          if (quantity > 1) {
            await updateQuantity(product._id, quantity);
          }
        }
      }

      setCartSuccessMessage(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} of "${product.name}" to your cart!`);
      setTimeout(() => {
        setCartSuccessMessage(null);
      }, 4000);
    } catch (err) {
      if (err.message && err.message.includes('401')) {
        navigate('/login');
        return;
      }
      setCartSuccessMessage(err.message || 'Unable to add product to cart.');
      setTimeout(() => {
        setCartSuccessMessage(null);
      }, 4000);
    } finally {
      setIsCartSubmitting(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product || isWishlistLoading) return;

    try {
      setIsWishlistLoading(true);
      if (isWishlisted) {
        await removeFromWishlist(product._id);
        setIsWishlisted(false);
        setCartSuccessMessage(`Removed "${product.name}" from wishlist.`);
      } else {
        await addToWishlist(product._id);
        setIsWishlisted(true);
        setCartSuccessMessage(`Added "${product.name}" to your wishlist!`);
      }
      setTimeout(() => {
        setCartSuccessMessage(null);
      }, 4000);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        return;
      }
      setCartSuccessMessage('Unable to update wishlist. Please try again.');
      setTimeout(() => {
        setCartSuccessMessage(null);
      }, 4000);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="product-details-container">
        <div className="products-state-box loading-state">
          <div className="spinner-primary" />
          <h3>Loading product details...</h3>
          <p>Fetching specifications and live stock data.</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-container">
        <div className="products-state-box error-state">
          <div className="state-icon-box error">
            <AlertCircle size={36} />
          </div>
          <h3>Unable to load product</h3>
          <p>{error || 'Product not found.'}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/products" className="btn btn-primary btn-sm">
              <ArrowLeft size={16} />
              <span>Back to Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-details-container">
      <div className="details-top-bar">
        <Link to="/products" className="back-link">
          <ArrowLeft size={18} />
          <span>Back to Products</span>
        </Link>
        <span className="details-breadcrumb">
          ShopKart &gt; {product.category} &gt; {product.name}
        </span>
      </div>

      {cartSuccessMessage && (
        <div className="cart-toast-alert" role="alert">
          <CheckCircle2 size={18} />
          <span>{cartSuccessMessage}</span>
        </div>
      )}

      <div className="product-details-card">
        <div className="product-details-gallery">
          <div className="details-image-frame">
            <img
              src={product.image}
              alt={product.name}
              className="details-main-img"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <span className="details-category-tag">
              <Layers size={14} />
              {product.category}
            </span>
          </div>
        </div>

        <div className="product-details-info">
          <div className="details-header">
            <h1 className="details-title">{product.name}</h1>
            <div className="details-meta-row">
              <span className="details-id-badge">SKU: {product._id}</span>
              {isOutOfStock ? (
                <span className="details-stock-status out">
                  <AlertTriangle size={14} /> Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="details-stock-status low">
                  <AlertTriangle size={14} /> Only {product.stock} units remaining
                </span>
              ) : (
                <span className="details-stock-status in">
                  <CheckCircle2 size={14} /> In Stock ({product.stock} units)
                </span>
              )}
            </div>
          </div>

          <div className="details-price-card">
            <div className="details-price-val">{formatPrice(product.price)}</div>
            <span className="details-tax-included">Inclusive of all taxes</span>
          </div>

          <div className="details-section">
            <h3 className="details-section-heading">Description</h3>
            <p className="details-desc-text">{product.description}</p>
          </div>

          <div className="details-actions-panel">
            {!isOutOfStock && (
              <div className="quantity-selector-box">
                <span className="qty-label">Quantity:</span>
                <div className="qty-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={handleQuantityDecrease}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="qty-number">{quantity}</span>
                  <button
                    type="button"
                    className="qty-btn"
                    onClick={handleQuantityIncrease}
                    disabled={quantity >= product.stock}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            <div className="details-btn-group">
              <button
                type="button"
                id="add-to-cart-button"
                className={`btn btn-primary details-cart-btn ${isOutOfStock ? 'disabled' : ''}`}
                disabled={isOutOfStock || isCartSubmitting}
                onClick={handleAddToCart}
              >
                {isCartSubmitting ? (
                  <>
                    <Loader2 size={18} className="btn-spinner" />
                    <span>Adding to Cart...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>{isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="details-wishlist-button"
                className={`btn ${isWishlisted ? 'btn-wishlisted' : 'btn-secondary'} details-wishlist-btn`}
                onClick={handleWishlistToggle}
                disabled={isWishlistLoading}
              >
                {isWishlistLoading ? (
                  <>
                    <div className="spinner-sm" />
                    <span>Saving...</span>
                  </>
                ) : isWishlisted ? (
                  <>
                    <Heart size={18} fill="currentColor" />
                    <span>Saved in Wishlist</span>
                  </>
                ) : (
                  <>
                    <Heart size={18} />
                    <span>Add to Wishlist</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="details-guarantees-grid">
            <div className="guarantee-item">
              <Truck size={18} className="guarantee-icon" />
              <div>
                <strong>Express Delivery</strong>
                <p>Ships in 24-48 business hours</p>
              </div>
            </div>
            <div className="guarantee-item">
              <ShieldCheck size={18} className="guarantee-icon" />
              <div>
                <strong>Authenticity Verified</strong>
                <p>100% genuine ShopKart quality</p>
              </div>
            </div>
            <div className="guarantee-item">
              <RotateCcw size={18} className="guarantee-icon" />
              <div>
                <strong>Easy 7-Day Returns</strong>
                <p>Hassle-free return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
