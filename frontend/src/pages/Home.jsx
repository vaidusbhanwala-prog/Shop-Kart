import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Package,
  KeyRound,
  Zap,
  Headphones,
  Watch,
  Keyboard,
  Coffee,
} from 'lucide-react';
import { getMyProfile } from '../services/api';

const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'ShopKart Pro Noise-Cancelling Headphones',
    category: 'Electronics',
    price: '$189.99',
    badge: 'Popular',
    icon: Headphones,
  },
  {
    id: 2,
    name: 'Minimalist Ultra-Thin Chronograph Watch',
    category: 'Accessories',
    price: '$124.50',
    badge: 'Trending',
    icon: Watch,
  },
  {
    id: 3,
    name: 'Ergonomic Mechanical Wireless Keyboard',
    category: 'Computers',
    price: '$99.00',
    badge: 'Top Pick',
    icon: Keyboard,
  },
  {
    id: 4,
    name: 'Eco-Friendly Smart Stainless Thermal Flask',
    category: 'Lifestyle',
    price: '$34.99',
    badge: 'Eco',
    icon: Coffee,
  },
];

const Home = ({ customer, setCustomer, onOpenChangePassword }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(customer || null);

  useEffect(() => {
    let isMounted = true;

    const fetchCustomerProfile = async () => {
      try {
        setLoading(true);
        const data = await getMyProfile();

        if (isMounted) {
          const userObj = data.customer || data;
          setProfileData(userObj);
          if (setCustomer) setCustomer(userObj);
          setLoading(false);
        }
      } catch (_error) {
        if (isMounted) {
          if (setCustomer) setCustomer(null);
          navigate('/login');
        }
      }
    };

    fetchCustomerProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate, setCustomer]);

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <div className="spinner-primary" />
        <p style={{ color: 'var(--text-secondary)', fontWeight: 700, marginTop: '1rem' }}>
          Loading profile...
        </p>
      </div>
    );
  }

  const initials = profileData?.fullName
    ? profileData.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SK';

  const memberSince = profileData?.createdAt
    ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Today';

  return (
    <div className="dashboard-container">
      <div className="welcome-banner">
        <div className="welcome-text">
          <div className="auth-status-chip">
            <span className="pulse-dot" />
            <span>Authenticated Customer Session Active</span>
          </div>
          <h1>Welcome back, {profileData?.fullName || 'Valued Customer'}!</h1>
          <p>
            Your ShopKart customer account is fully verified and connected. Explore your profile,
            view live member benefits, and shop our newest inventory.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {onOpenChangePassword && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenChangePassword}
            >
              <KeyRound size={18} />
              <span>Change Password</span>
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="profile-card" id="customer-profile-card">
          <div className="card-header-flex">
            <h2 className="card-title">
              <User size={20} color="var(--primary)" />
              <span>Customer Profile</span>
            </h2>
            <span className="verified-badge">
              <ShieldCheck size={14} /> Verified
            </span>
          </div>

          <div className="profile-avatar-block">
            <div className="large-avatar">{initials}</div>
            <h3 className="profile-name">{profileData?.fullName}</h3>
            <p className="profile-role">ShopKart Prime Member</p>
          </div>

          <div className="info-list">
            <div className="info-item">
              <div className="info-icon">
                <User size={18} />
              </div>
              <div className="info-details">
                <div className="info-label">Full Name</div>
                <div className="info-value" id="profile-fullname">
                  {profileData?.fullName || '—'}
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Mail size={18} />
              </div>
              <div className="info-details">
                <div className="info-label">Email Address</div>
                <div className="info-value" id="profile-email">
                  {profileData?.email || '—'}
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Phone size={18} />
              </div>
              <div className="info-details">
                <div className="info-label">Phone Number</div>
                <div className="info-value" id="profile-phone">
                  {profileData?.phone || '—'}
                </div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Calendar size={18} />
              </div>
              <div className="info-details">
                <div className="info-label">Member Since</div>
                <div className="info-value">{memberSince}</div>
              </div>
            </div>

            <div className="info-item">
              <div className="info-icon">
                <Zap size={18} />
              </div>
              <div className="info-details">
                <div className="info-label">Account ID</div>
                <div
                  className="info-value"
                  style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}
                >
                  {profileData?._id || '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="features-section">
          <div className="catalog-header">
            <div>
              <h2 className="card-title">
                <ShoppingBag size={20} color="var(--primary)" />
                <span>Featured Catalog for You</span>
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Exclusive authenticated customer pricing applied
              </p>
            </div>
          </div>

          <div className="catalog-grid">
            {FEATURED_PRODUCTS.map((item) => (
              <div key={item.id} className="product-card">
                <div className="product-img-wrapper">
                  <span className="product-badge">{item.badge}</span>
                  <item.icon size={30} strokeWidth={1.75} />
                </div>
                <div className="product-body">
                  <span className="product-cat">{item.category}</span>
                  <h4 className="product-name">{item.name}</h4>
                  <div className="product-pricing">
                    <span className="product-price">{item.price}</span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`Added "${item.name}" to cart!`)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="perks-grid">
            <div className="perk-card">
              <div className="perk-icon-box delivery">
                <Package size={22} />
              </div>
              <div>
                <div className="perk-title">FREE DELIVERY</div>
                <div className="perk-val">On Orders $40+</div>
              </div>
            </div>

            <div className="perk-card">
              <div className="perk-icon-box cashback">
                <CreditCard size={22} />
              </div>
              <div>
                <div className="perk-title">CASHBACK</div>
                <div className="perk-val">5% On All Items</div>
              </div>
            </div>

            <div className="perk-card">
              <div className="perk-icon-box rewards">
                <Sparkles size={22} />
              </div>
              <div>
                <div className="perk-title">REWARDS</div>
                <div className="perk-val">250 Points Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
