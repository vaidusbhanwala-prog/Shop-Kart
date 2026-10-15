import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const Cart = ({ customer }) => {
  const navigate = useNavigate();
  const { cart, loading, error, totalItems, subtotal, refreshCart } = useCart();
  const [checkoutNotice, _setCheckoutNotice] = useState(null);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    navigate('/checkout');
  };

  if (!customer) {
    return (
      <div className="cart-page-container">
        <section className="catalog-hero-section cart-hero">
          <div className="catalog-hero-badge cart-hero-badge">
            <ShoppingCart size={14} />
            <span>ShopKart Bag</span>
          </div>
          <h1 className="catalog-hero-title">Shopping Cart</h1>
          <p className="catalog-hero-subtitle">
            Sign in to view your saved cart, update quantities, and complete your order.
          </p>
        </section>

        <div className="products-state-box empty-state cart-empty-box" id="cart-unauth-state">
          <div className="cart-empty-icon-circle">
            <ShoppingCart size={40} className="empty-cart-icon" />
          </div>
          <h2 className="empty-title">Please Log In to View Your Cart</h2>
          <p className="empty-description">
            Your cart is securely stored in your ShopKart account. Log in or create an account to access your items.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary" id="cart-login-btn">
              <span>Log In to Account</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/products" className="btn btn-secondary">
              <span>Browse Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <section className="catalog-hero-section cart-hero">
        <div className="catalog-hero-badge cart-hero-badge">
          <ShoppingCart size={14} />
          <span>ShopKart Bag</span>
        </div>
        <h1 className="catalog-hero-title">My Cart</h1>
        <p className="catalog-hero-subtitle">
          Review your selected products, manage quantities, and proceed to checkout.
        </p>
      </section>

      {checkoutNotice && (
        <div className="cart-toast-alert" role="alert">
          <CheckCircle2 size={18} />
          <span>{checkoutNotice}</span>
        </div>
      )}

      {loading && cart.length === 0 ? (
        <div className="products-state-box loading-state" id="cart-loading-state">
          <div className="spinner-primary" />
          <h3>Loading your cart...</h3>
          <p>Fetching real-time inventory and pricing from ShopKart.</p>
        </div>
      ) : error ? (
        <div className="products-state-box error-state" id="cart-error-state">
          <div className="state-icon-box error">
            <AlertCircle size={36} />
          </div>
          <h3>Unable to load your cart.</h3>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={refreshCart}
            id="cart-retry-btn"
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : cart.length === 0 ? (
        <div className="products-state-box empty-state cart-empty-box" id="cart-empty-state">
          <div className="cart-empty-icon-circle">
            <ShoppingCart size={40} className="empty-cart-icon" />
          </div>
          <h2 className="empty-title">Your cart is empty</h2>
          <p className="empty-description">
            Looks like you haven't added anything yet. Discover our latest tech gadgets, fashion, and books.
          </p>
          <Link to="/products" className="btn btn-primary" id="cart-browse-btn">
            <ShoppingBag size={18} />
            <span>Browse Products</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-items-header">
              <div className="cart-items-count-badge">
                <Sparkles size={16} />
                <span>
                  <strong>{totalItems}</strong> {totalItems === 1 ? 'item' : 'items'} in your cart
                </span>
              </div>

              <Link to="/products" className="continue-shopping-link">
                <ShoppingBag size={15} />
                <span>Add More Products</span>
              </Link>
            </div>

            <div className="cart-items-list" id="cart-items-list">
              {cart.map((item) => (
                <CartItem key={item.product?._id || item._id} item={item} />
              ))}
            </div>
          </div>

          <aside className="cart-summary-sidebar">
            <div className="cart-summary-card" id="cart-order-summary">
              <h2 className="summary-title">
                <ShoppingCart size={20} />
                <span>Order Summary</span>
              </h2>

              <div className="summary-details-list">
                <div className="summary-row">
                  <span>Total Items</span>
                  <span id="summary-total-items" style={{ fontWeight: 800 }}>
                    {totalItems} units ({cart.length} {cart.length === 1 ? 'product' : 'products'})
                  </span>
                </div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span id="summary-subtotal" style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-tag">FREE</span>
                </div>

                <div className="summary-row">
                  <span>Estimated Taxes</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Included
                  </span>
                </div>

                <div className="summary-row total-row">
                  <span>Total Amount</span>
                  <span className="total-amount" id="summary-total-price">
                    {formatPrice(subtotal)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary summary-checkout-btn"
                onClick={handleProceedToCheckout}
                id="proceed-to-checkout-btn"
              >
                <Lock size={16} />
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <Link to="/products" className="summary-continue-shopping">
                <span>Continue Shopping</span>
              </Link>

              <div className="summary-trust-badges">
                <div className="trust-badge-item">
                  <ShieldCheck size={16} />
                  <span>Secure 256-bit SSL encrypted checkout</span>
                </div>
                <div className="trust-badge-item">
                  <Truck size={16} />
                  <span>Free tracked express shipping across India</span>
                </div>
                <div className="trust-badge-item">
                  <RotateCcw size={16} />
                  <span>7-day easy returns & money-back guarantee</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
