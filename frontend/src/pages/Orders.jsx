import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Calendar,
  CreditCard,
  MapPin,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getMyOrders, updateOrderStatus } from '../services/api';

const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return 'Recent';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'DELIVERED':
      return 'badge-delivered';
    case 'SHIPPED':
      return 'badge-shipped';
    case 'CONFIRMED':
      return 'badge-confirmed';
    case 'PLACED':
      return 'badge-placed';
    case 'FAILED':
      return 'badge-failed';
    default:
      return 'badge-pending';
  }
};

const Orders = ({ customer }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyOrders();
      if (res.success && Array.isArray(res.orders)) {
        setOrders(res.orders);
        if (res.orders.length > 0) {
          setExpandedOrders(new Set([res.orders[0]._id]));
        }
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to retrieve your order history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const handleStatusProgression = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success && res.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (!customer) {
    return (
      <div className="orders-page-container">
        <div className="products-state-box empty-state">
          <div className="state-icon-box empty">
            <Package size={36} />
          </div>
          <h3>Login to view your orders</h3>
          <p>Sign in with your registered account to inspect order status and delivery updates.</p>
          <Link to="/login" className="btn btn-primary">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-container">
      <section className="catalog-hero-section orders-hero">
        <div className="catalog-hero-badge">
          <Package size={14} />
          <span>Purchase History</span>
        </div>
        <h1 className="catalog-hero-title">My Orders</h1>
        <p className="catalog-hero-subtitle">
          Track previous purchases, delivery progress, and invoice snapshots.
        </p>
      </section>

      {loading ? (
        <div className="products-state-box loading-state" id="orders-loading-state">
          <div className="spinner-primary" />
          <h3>Loading your orders...</h3>
          <p>Fetching verified order history from ShopKart database.</p>
        </div>
      ) : error ? (
        <div className="products-state-box error-state" id="orders-error-state">
          <div className="state-icon-box error">
            <AlertCircle size={36} />
          </div>
          <h3>Something went wrong.</h3>
          <p>{error}</p>
          <button type="button" className="btn btn-primary btn-sm" onClick={fetchOrders}>
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="products-state-box empty-state orders-empty-box" id="orders-empty-state">
          <div className="state-icon-box empty orders-empty-icon-circle">
            <ShoppingBag size={42} className="empty-orders-icon" />
          </div>
          <h2 className="empty-title">You have not placed any orders yet.</h2>
          <p className="empty-description">
            Explore our catalog and find the products you love. Your completed orders will appear here.
          </p>
          <Link to="/products" className="btn btn-primary" id="start-shopping-btn">
            <ShoppingBag size={18} />
            <span>Start Shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="orders-list-wrapper">
          <div className="orders-status-bar">
            <span>
              Showing <strong>{orders.length}</strong> {orders.length === 1 ? 'order' : 'orders'} placed
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm refresh-orders-btn"
              onClick={fetchOrders}
            >
              <RefreshCw size={14} />
              <span>Refresh Orders</span>
            </button>
          </div>

          <div className="orders-grid" id="orders-grid">
            {orders.map((order) => {
              const isExpanded = expandedOrders.has(order._id);
              const items = order.items || [];
              const shipping = order.shippingAddress || {};

              return (
                <div key={order._id} className="order-card-card" id={`order-card-${order._id}`}>
                  <div className="order-card-header" onClick={() => toggleExpand(order._id)}>
                    <div className="order-header-left">
                      <div className="order-id-block">
                        <span className="order-label">Order ID</span>
                        <strong className="order-id-text">#{order._id}</strong>
                      </div>
                      <div className="order-date-block">
                        <Calendar size={13} />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <div className="order-header-right">
                      <div className="order-total-block">
                        <span className="order-label">Total</span>
                        <strong className="order-total-val">{formatPrice(order.totalAmount)}</strong>
                      </div>

                      <span className={`order-status-badge ${getStatusBadgeClass(order.status)}`}>
                        {order.status || 'PLACED'}
                      </span>

                      <button
                        type="button"
                        className="order-collapse-btn"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {!isExpanded && (
                    <div className="order-collapsed-preview" onClick={() => toggleExpand(order._id)}>
                      <div className="collapsed-thumbs-row">
                        {items.slice(0, 4).map((item, i) => (
                          <img
                            key={item.product || i}
                            src={
                              item.image ||
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={item.name}
                            className="collapsed-thumb-img"
                          />
                        ))}
                        {items.length > 4 && (
                          <span className="collapsed-more-badge">+{items.length - 4}</span>
                        )}
                      </div>
                      <span className="collapsed-items-summary">
                        {items.length} {items.length === 1 ? 'item' : 'items'} • Click to view details
                      </span>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="order-card-body">
                      <div className="order-items-table">
                        <h4 className="body-section-title">
                          <Package size={15} />
                          <span>Purchased Items Snapshot</span>
                        </h4>

                        <div className="order-items-sublist">
                          {items.map((item, idx) => (
                            <div key={item.product || idx} className="order-item-detail-row">
                              <img
                                src={
                                  item.image ||
                                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80'
                                }
                                alt={item.name}
                                className="order-detail-img"
                              />
                              <div className="order-detail-info">
                                <h5 className="order-detail-name">{item.name}</h5>
                                <span className="order-detail-unit">
                                  {formatPrice(item.price)} × {item.quantity} {item.quantity === 1 ? 'unit' : 'units'}
                                </span>
                              </div>
                              <span className="order-detail-subtotal">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="order-meta-grid">
                        <div className="order-meta-card">
                          <h5 className="meta-card-title">
                            <MapPin size={14} />
                            <span>Delivery Destination</span>
                          </h5>
                          <strong>{shipping.fullName}</strong>
                          <p>{shipping.addressLine1}</p>
                          <p>
                            {shipping.city}, {shipping.state} - {shipping.pincode}
                          </p>
                          <p style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>
                            Phone: {shipping.phone}
                          </p>
                        </div>

                        <div className="order-meta-card">
                          <h5 className="meta-card-title">
                            <CreditCard size={14} />
                            <span>Payment & Fulfillment</span>
                          </h5>
                          <div className="meta-key-val">
                            <span>Status:</span>
                            <span className="badge-paid">{order.paymentStatus || 'PAID'}</span>
                          </div>
                          {order.razorpayPaymentId && (
                            <div className="meta-key-val">
                              <span>Ref ID:</span>
                              <code>{order.razorpayPaymentId}</code>
                            </div>
                          )}
                          <div className="meta-key-val">
                            <span>Fulfillment:</span>
                            <strong>Standard Express</strong>
                          </div>
                        </div>
                      </div>

                      <div className="order-status-progression-box">
                        <div className="progression-header">
                          <Clock size={14} />
                          <span>Status Progression (Demo & Testing):</span>
                        </div>
                        <div className="progression-buttons-row">
                          {['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((st) => (
                            <button
                              key={st}
                              type="button"
                              className={`btn btn-xs status-step-btn ${
                                order.status === st ? 'active' : ''
                              }`}
                              disabled={updatingOrderId === order._id || order.status === st}
                              onClick={() => handleStatusProgression(order._id, st)}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
