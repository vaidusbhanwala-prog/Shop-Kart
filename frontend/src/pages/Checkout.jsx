import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ShoppingBag,
  Truck,
  MapPin,
  User,
  Phone,
  Building,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = ({ customer }) => {
  const navigate = useNavigate();
  const { cart, subtotal, totalItems, clearCart, loading: cartLoading } = useCart();

  const [formData, setFormData] = useState({
    fullName: customer?.fullName || '',
    phone: customer?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [isSimulatingSandbox, setIsSimulatingSandbox] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  useEffect(() => {
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || customer.fullName || '',
        phone: prev.phone || customer.phone || '',
      }));
    }
  }, [customer]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else {
      const cleanPhone = formData.phone.replace(/[\s\-+]/g, '');
      if (cleanPhone.length < 10 || !/^\d+$/.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number.';
      }
    }

    if (!formData.addressLine1 || !formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address is required.';
    }

    if (!formData.city || !formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state || !formData.state.trim()) {
      newErrors.state = 'State is required.';
    }

    if (!formData.pincode || !formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain exactly 6 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (backendError) {
      setBackendError(null);
    }
  };

  const handleVerifyAndComplete = async (paymentPayload) => {
    try {
      setIsProcessing(true);
      const verifyRes = await verifyPayment(paymentPayload);

      if (verifyRes.success) {
        clearCart();
        const orderId = verifyRes.order?._id || paymentPayload.shopKartOrderId;
        navigate(`/order-success/${orderId}`, {
          state: { order: verifyRes.order },
          replace: true,
        });
      } else {
        setBackendError(verifyRes.message || 'Payment verification failed.');
      }
    } catch (err) {
      setBackendError(
        err.response?.data?.message || 'Payment signature verification failed. Cart was not cleared.'
      );
    } finally {
      setIsProcessing(false);
      setIsSimulatingSandbox(false);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (cart.length === 0) {
      setBackendError('Your cart is empty.');
      return;
    }

    setIsProcessing(true);
    setBackendError(null);

    try {
      const orderRes = await createPaymentOrder(formData);

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to initiate order.');
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = orderRes;

      const isScriptLoaded = await loadRazorpayScript();

      if (!isScriptLoaded || typeof window.Razorpay === 'undefined') {
        setPendingOrderData({
          shopKartOrderId,
          razorpayOrderId,
          amount,
        });
        setIsSimulatingSandbox(true);
        setIsProcessing(false);
        return;
      }

      const options = {
        key: key || 'rzp_test_shopkart2026lab06',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `Order #${shopKartOrderId.slice(-6).toUpperCase()}`,
        order_id: razorpayOrderId,
        image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80',
        handler: async function (response) {
          await handleVerifyAndComplete({
            shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id || razorpayOrderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: customer?.email || 'customer@shopkart.com',
        },
        theme: {
          color: '#FF5A1F',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            setBackendError('Payment cancelled. Your cart items are preserved.');
          },
        },
      };

      const razorpayObj = new window.Razorpay(options);

      razorpayObj.on('payment.failed', function (response) {
        console.error('Razorpay Payment Failed:', response.error);
        setIsProcessing(false);
        setBackendError(
          response.error?.description || 'Payment failed. Your cart has not been cleared.'
        );
      });

      razorpayObj.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      setBackendError(
        err.response?.data?.message || err.message || 'Unable to place order. Please try again.'
      );
    }
  };

  if (!customer) {
    return (
      <div className="cart-page-container">
        <div className="products-state-box empty-state">
          <div className="state-icon-box empty">
            <Lock size={36} />
          </div>
          <h3>Login Required</h3>
          <p>Please log in to your account to proceed with checkout.</p>
          <Link to="/login" className="btn btn-primary">
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !cartLoading) {
    return (
      <div className="cart-page-container">
        <div className="products-state-box empty-state">
          <div className="state-icon-box empty">
            <ShoppingBag size={36} />
          </div>
          <h3>Your cart is empty</h3>
          <p>Add some products to your cart before proceeding to checkout.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-container">
      <div className="checkout-header-bar">
        <Link to="/cart" className="back-link">
          <ArrowLeft size={16} />
          <span>Back to Cart</span>
        </Link>
        <h1 className="checkout-main-title">Secure Checkout</h1>
        <div className="checkout-secure-badge">
          <ShieldCheck size={16} />
          <span>256-Bit SSL Encryption</span>
        </div>
      </div>

      {backendError && (
        <div className="checkout-error-banner" role="alert">
          <AlertCircle size={18} />
          <span>{backendError}</span>
        </div>
      )}

      {isSimulatingSandbox && pendingOrderData && (
        <div className="sandbox-modal-overlay">
          <div className="sandbox-modal-card">
            <div className="sandbox-modal-header">
              <CreditCard size={22} className="sandbox-icon" />
              <h3>Razorpay Test Mode Sandbox</h3>
            </div>
            <p className="sandbox-modal-text">
              Simulate standard Razorpay Test Mode payment callback for Order:{' '}
              <strong>#{pendingOrderData.shopKartOrderId.slice(-6).toUpperCase()}</strong>
            </p>
            <div className="sandbox-summary-line">
              <span>Payable Amount:</span>
              <strong>{formatPrice(pendingOrderData.amount / 100)}</strong>
            </div>

            <div className="sandbox-actions-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  handleVerifyAndComplete({
                    shopKartOrderId: pendingOrderData.shopKartOrderId,
                    razorpay_order_id: pendingOrderData.razorpayOrderId,
                    razorpay_payment_id: `pay_test_${Date.now()}`,
                    razorpay_signature: 'sandbox_test_signature',
                  })
                }
              >
                <CheckCircle2 size={16} />
                <span>Simulate Successful Payment</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsSimulatingSandbox(false);
                  setBackendError('Test payment cancelled by user.');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="checkout-grid-layout">
        <section className="checkout-form-section">
          <div className="checkout-card">
            <div className="checkout-card-header">
              <MapPin size={20} className="section-icon" />
              <h2>Delivery Address</h2>
            </div>

            <form onSubmit={handleSubmitOrder} className="shipping-address-form" id="shipping-form">
              <div className="form-group-grid">
                <div className="form-field full-width">
                  <label htmlFor="fullName">
                    <User size={14} />
                    <span>Full Name *</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'input-error' : ''}
                  />
                  {errors.fullName && <span className="field-error-text">{errors.fullName}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="phone">
                    <Phone size={14} />
                    <span>Phone Number *</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'input-error' : ''}
                  />
                  {errors.phone && <span className="field-error-text">{errors.phone}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="pincode">
                    <Building size={14} />
                    <span>Pincode (6 Digits) *</span>
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    maxLength={6}
                    placeholder="e.g. 560001"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={errors.pincode ? 'input-error' : ''}
                  />
                  {errors.pincode && <span className="field-error-text">{errors.pincode}</span>}
                </div>

                <div className="form-field full-width">
                  <label htmlFor="addressLine1">
                    <MapPin size={14} />
                    <span>Address Line (House, Flat, Street) *</span>
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    placeholder="e.g. 22 MG Road, Koramangala"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className={errors.addressLine1 ? 'input-error' : ''}
                  />
                  {errors.addressLine1 && (
                    <span className="field-error-text">{errors.addressLine1}</span>
                  )}
                </div>

                <div className="form-field">
                  <label htmlFor="city">
                    <span>City *</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={errors.city ? 'input-error' : ''}
                  />
                  {errors.city && <span className="field-error-text">{errors.city}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="state">
                    <span>State *</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={errors.state ? 'input-error' : ''}
                  />
                  {errors.state && <span className="field-error-text">{errors.state}</span>}
                </div>
              </div>

              <div className="checkout-payment-callout">
                <div className="callout-badge">
                  <CreditCard size={18} />
                  <span>Razorpay Standard Test Mode Checkout</span>
                </div>
                <p>
                  You will be prompted with Razorpay's secure test payment gateway. Use test cards or UPI
                  simulation — no real money will be charged.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-primary place-order-submit-btn"
                disabled={isProcessing}
                id="place-order-btn"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={18} className="btn-spinner" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Pay {formatPrice(subtotal)} with Razorpay</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        <aside className="checkout-summary-section">
          <div className="checkout-summary-card">
            <h2 className="summary-title">
              <ShoppingBag size={20} />
              <span>Order Items ({totalItems})</span>
            </h2>

            <div className="checkout-items-mini-list">
              {cart.map((item) => {
                const product = item.product || {};
                return (
                  <div key={product._id || item._id} className="checkout-mini-item">
                    <img
                      src={
                        product.image
                      }
                      alt={product.name}
                      className="mini-item-img"
                    />
                    <div className="mini-item-details">
                      <h4 className="mini-item-name">{product.name}</h4>
                      <span className="mini-item-qty">
                        Qty: <strong>{item.quantity}</strong> × {formatPrice(product.price)}
                      </span>
                    </div>
                    <span className="mini-item-total">
                      {formatPrice((product.price || 0) * (item.quantity || 0))}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="summary-details-list">
              <div className="summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-tag">FREE</span>
              </div>
              <div className="summary-row">
                <span>Taxes</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Included</span>
              </div>
              <div className="summary-row total-row">
                <span>Total Due</span>
                <span className="total-amount">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <div className="checkout-perks-list">
              <div className="perk-item">
                <Truck size={16} />
                <span>Express Dispatched in 24-48 Hours</span>
              </div>
              <div className="perk-item">
                <ShieldCheck size={16} />
                <span>100% Genuine Certified Merchandise</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
