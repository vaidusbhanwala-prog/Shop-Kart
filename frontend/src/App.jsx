import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ChangePasswordModal from './components/ChangePasswordModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import { CartProvider } from './context/CartContext';
import { getMyProfile, getWishlist } from './services/api';

function App() {
  const [customer, setCustomer] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const fetchWishlistCount = async () => {
    try {
      const data = await getWishlist();
      if (data && Array.isArray(data.wishlist)) {
        setWishlistCount(data.wishlist.length);
      } else if (typeof data?.count === 'number') {
        setWishlistCount(data.count);
      }
    } catch {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    const checkInitialAuth = async () => {
      try {
        const data = await getMyProfile();
        const user = data.customer || data;
        setCustomer(user);
        if (user) {
          fetchWishlistCount();
        }
      } catch {
        setCustomer(null);
        setWishlistCount(0);
      }
    };

    checkInitialAuth();
  }, []);

  return (
    <Router>
      <CartProvider isAuthenticated={Boolean(customer)}>
        <div className="app-layout">
          <Navbar
            customer={customer}
            setCustomer={setCustomer}
            wishlistCount={wishlistCount}
            onOpenChangePassword={customer ? () => setIsPasswordModalOpen(true) : null}
          />

          <main className="main-content">
            <Routes>
              <Route
                path="/register"
                element={<Register />}
              />
              <Route
                path="/login"
                element={
                  <Login
                    setCustomer={(user) => {
                      setCustomer(user);
                      if (user) fetchWishlistCount();
                    }}
                  />
                }
              />
              <Route
                path="/home"
                element={
                  <Home
                    customer={customer}
                    setCustomer={setCustomer}
                    onOpenChangePassword={() => setIsPasswordModalOpen(true)}
                  />
                }
              />
              <Route
                path="/products"
                element={<Products onWishlistUpdate={setWishlistCount} />}
              />
              <Route
                path="/products/:id"
                element={<ProductDetails />}
              />
              <Route
                path="/wishlist"
                element={
                  <Wishlist
                    customer={customer}
                    onWishlistUpdate={setWishlistCount}
                  />
                }
              />
              <Route
                path="/cart"
                element={<Cart customer={customer} />}
              />
              <Route
                path="/checkout"
                element={<Checkout customer={customer} />}
              />
              <Route
                path="/order-success/:id"
                element={<OrderSuccess />}
              />
              <Route
                path="/orders"
                element={<Orders customer={customer} />}
              />
              <Route
                path="/orders/:id"
                element={<OrderSuccess />}
              />
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </main>

          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
          />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
