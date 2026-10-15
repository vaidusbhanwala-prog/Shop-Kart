import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  MapPin,
  CreditCard,
  Truck,
  Loader2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { getOrderById } from '../services/api';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Just now';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderSuccess = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!order && id) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const res = await getOrderById(id);
          if (res.success && res.order) {
            setOrder(res.order);
          } else {
            setError('Order details could not be retrieved.');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Unable to load order details.');
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="order-success-page">
        <div className="products-state-box loading-state">
          <Loader2 size={36} className="btn-spinner" style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
          <h3>Loading your order confirmation...</h3>
          <p>Retrieving verified purchase records from ShopKart.</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-success-page">
        <div className="products-state-box error-state">
          <div className="state-icon-box error">
            <AlertCircle size={36} />
          </div>
          <h3>Order Notice</h3>
          <p>{error || 'Order record not found.'}</p>
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const { shippingAddress, items = [], totalAmount, status, paymentStatus, razorpayPaymentId, createdAt } = order;

  return (
    <div className="order-success-page">
      <div className="order-success-hero">
        <div className="success-icon-circle">
          <CheckCircle2 size={48} className="success-check-icon" />
        </div>
        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-subtitle">
          Thank you for shopping with ShopKart. Your payment has been verified and your order is confirmed.
        </p>

        <div className="success-meta-pills">
          <div className="meta-pill">
            <span>Order ID:</span>
            <strong>#{order._id}</strong>
          </div>
          <div className="meta-pill">
            <Calendar size={13} />
            <span>{formatDate(createdAt)}</span>
          </div>
          <div className="meta-pill status-pill">
            <span>Status:</span>
            <strong className="badge-placed">{status || 'PLACED'}</strong>
          </div>
        </div>
      </div>

      <div className="order-success-details-card">
        <div className="success-items-column">
          <h3 className="card-section-heading">
            <Package size={18} />
            <span>Purchased Items ({items.length})</span>
          </h3>

          <div className="success-items-list">
            {items.map((item, idx) => (
              <div key={item.product || idx} className="success-item-row">
                <img
                  src={
                    item.image ||
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={item.name}
                  className="success-item-img"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="success-item-info">
                  <h4 className="success-item-name">{item.name}</h4>
                  <span className="success-item-sub">
                    Price snapshot: {formatPrice(item.price)} × {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                  </span>
                </div>
                <div className="success-item-price">{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="success-total-breakdown">
            <div className="breakdown-row">
              <span>Items Total:</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div className="breakdown-row">
              <span>Shipping Delivery:</span>
              <span className="free-tag">FREE</span>
            </div>
            <div className="breakdown-row grand-total">
              <span>Total Paid:</span>
              <span className="total-val">{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="success-sidebar-column">
          {shippingAddress && (
            <div className="success-info-block">
              <h4 className="info-block-title">
                <MapPin size={16} />
                <span>Shipping Address</span>
              </h4>
              <div className="info-block-content">
                <strong>{shippingAddress.fullName}</strong>
                <p>{shippingAddress.addressLine1}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                </p>
                <p className="phone-line">Contact: {shippingAddress.phone}</p>
              </div>
            </div>
          )}

          <div className="success-info-block">
            <h4 className="info-block-title">
              <CreditCard size={16} />
              <span>Payment Information</span>
            </h4>
            <div className="info-block-content">
              <div className="payment-status-row">
                <span>Payment Method:</span>
                <strong>Razorpay Test Payment</strong>
              </div>
              <div className="payment-status-row">
                <span>Payment Status:</span>
                <span className="badge-paid">{paymentStatus || 'PAID'}</span>
              </div>
              {razorpayPaymentId && (
                <div className="payment-status-row">
                  <span>Payment Ref ID:</span>
                  <code className="pay-ref-code">{razorpayPaymentId}</code>
                </div>
              )}
            </div>
          </div>

          <div className="success-info-block">
            <h4 className="info-block-title">
              <Truck size={16} />
              <span>Estimated Delivery</span>
            </h4>
            <p className="delivery-est-text">
              Estimated delivery in <strong>2-4 business days</strong>. Tracking details will be updated under My Orders.
            </p>
          </div>

          <div className="success-actions-box">
            <Link to="/orders" className="btn btn-primary full-width" id="view-my-orders-btn">
              <Package size={16} />
              <span>View My Orders</span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/products" className="btn btn-secondary full-width" id="continue-shopping-btn">
              <ShoppingBag size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
