import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getWishlist } from '../services/api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import {
  AlertCircle,
  RefreshCw,
  SearchX,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';

const Products = ({ onWishlistUpdate }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All Categories';

  const [products, setProducts] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const data = await getWishlist();
        if (data && Array.isArray(data.wishlist)) {
          const ids = new Set(data.wishlist.map((item) => item._id || item));
          setWishlistedIds(ids);
          if (onWishlistUpdate) onWishlistUpdate(data.wishlist.length);
        }
      } catch {
        
      }
    };
    loadWishlist();
  }, [onWishlistUpdate]);

  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All Categories');
  }, [searchParams]);

  const updateFilters = (newSearch, newCategory) => {
    const params = {};
    if (newSearch && newSearch.trim()) {
      params.search = newSearch.trim();
    }
    if (
      newCategory &&
      newCategory !== 'All Categories' &&
      newCategory.toLowerCase() !== 'all'
    ) {
      params.category = newCategory;
    }
    setSearchParams(params, { replace: true });
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    updateFilters(value, selectedCategory);
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    updateFilters(searchTerm, cat);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSearchParams({}, { replace: true });
  };

  const fetchCatalogProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      const querySearch = searchParams.get('search');
      const queryCategory = searchParams.get('category');

      if (querySearch && querySearch.trim()) {
        params.search = querySearch.trim();
      }
      if (
        queryCategory &&
        queryCategory !== 'All Categories' &&
        queryCategory.toLowerCase() !== 'all'
      ) {
        params.category = queryCategory;
      }

      const data = await getProducts(params);
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalogProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [fetchCatalogProducts]);

  return (
    <div className="products-page-container">
      <section className="catalog-hero-section">
        <div className="catalog-hero-badge">
          <Sparkles size={14} />
          <span>ShopKart Live Catalog</span>
        </div>
        <h1 className="catalog-hero-title">Discover Our Premium Collection</h1>
        <p className="catalog-hero-subtitle">
          Explore top-rated gadgets, apparel, literature, and home essentials with verified quality.
        </p>
      </section>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onClearFilters={handleClearFilters}
        totalResults={products.length}
      />

      <div className="catalog-status-bar">
        <div className="catalog-status-info">
          <SlidersHorizontal size={16} />
          <span>
            {loading ? (
              'Searching catalogue...'
            ) : (
              <>
                Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
                {selectedCategory !== 'All Categories' && (
                  <> in <em>"{selectedCategory}"</em></>
                )}
                {searchTerm && (
                  <> matching <em>"{searchTerm}"</em></>
                )}
              </>
            )}
          </span>
        </div>

        {(searchTerm || selectedCategory !== 'All Categories') && !loading && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleClearFilters}
          >
            Reset Filters
          </button>
        )}
      </div>

      {loading ? (
        <div className="products-state-box loading-state">
          <div className="spinner-primary" />
          <h3>Loading products...</h3>
          <p>Fetching real-time inventory from ShopKart backend.</p>
        </div>
      ) : error ? (
        <div className="products-state-box error-state">
          <div className="state-icon-box error">
            <AlertCircle size={36} />
          </div>
          <h3>Something went wrong while loading products.</h3>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={fetchCatalogProducts}
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="products-state-box empty-state">
          <div className="state-icon-box empty">
            <SearchX size={36} />
          </div>
          <h3>No products found.</h3>
          <p>
            We couldn't find any items matching your current filters. Try changing your search keywords
            or selecting another category.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleClearFilters}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="products-grid" id="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isWishlisted={wishlistedIds.has(product._id)}
              onWishlistChange={(productId, isAdded) => {
                setWishlistedIds((prev) => {
                  const next = new Set(prev);
                  if (isAdded) next.add(productId);
                  else next.delete(productId);
                  if (onWishlistUpdate) onWishlistUpdate(next.size);
                  return next;
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
