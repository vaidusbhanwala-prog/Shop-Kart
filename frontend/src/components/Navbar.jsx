import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, LogOut, KeyRound, Heart, Package } from 'lucide-react';
import { logoutCustomer } from '../services/api';
import { useCart } from '../context/CartContext';

const Navbar = ({ customer, setCustomer, onOpenChangePassword, wishlistCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, clearCart } = useCart();

  const handleLogout = async () => {
    try {
      await logoutCustomer();
    } catch (error) {
      console.error(error);
    } finally {
      clearCart();
      if (setCustomer) setCustomer(null);
      navigate('/login');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="nav-brand-group">
          <Link to={customer ? '/home' : '/products'} className="brand-link">
            <div className="brand-icon">
              <ShoppingBag size={22} />
            </div>
            <span className="brand-text">
              Shop<span>Kart</span>
            </span>
          </Link>

          <nav className="nav-menu-links">
            {customer && (
              <Link
                to="/home"
                className={`nav-menu-item ${location.pathname === '/home' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/products"
              className={`nav-menu-item ${location.pathname === '/products' ? 'active' : ''}`}
            >
              Products
            </Link>
            <Link
              to="/wishlist"
              className={`nav-menu-item nav-wishlist-link ${location.pathname === '/wishlist' ? 'active' : ''}`}
              id="nav-wishlist-link"
            >
              <Heart size={16} className="nav-heart-icon" />
              <span>Wishlist</span>
              {customer && wishlistCount > 0 && (
                <span className="nav-wishlist-badge" id="nav-wishlist-count">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className={`nav-menu-item nav-cart-link ${location.pathname === '/cart' ? 'active' : ''}`}
              id="nav-cart-link"
            >
              <ShoppingCart size={16} className="nav-cart-icon" />
              <span>Cart</span>
              {customer && totalItems > 0 && (
                <span className="nav-cart-badge" id="nav-cart-count">
                  {totalItems}
                </span>
              )}
            </Link>
            {customer && (
              <Link
                to="/orders"
                className={`nav-menu-item nav-orders-link ${location.pathname.startsWith('/orders') ? 'active' : ''}`}
                id="nav-orders-link"
              >
                <Package size={16} className="nav-orders-icon" />
                <span>Orders</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="nav-actions">
          {customer ? (
            <>
              <div className="nav-user-pill">
                <div className="user-avatar-sm">
                  {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{customer.fullName || 'Customer'}</span>
              </div>

              {onOpenChangePassword && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onOpenChangePassword}
                >
                  <KeyRound size={16} />
                  <span>Password</span>
                </button>
              )}

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
                id="logout-button"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
