import React from 'react';
import { Search, X, Filter, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home',
];

const SearchBar = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onClearFilters: _onClearFilters,
  totalResults: _totalResults,
}) => {
  return (
    <div className="discovery-toolbar">
      <div className="search-bar-wrapper">
        <div className="search-input-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            id="product-search-input"
            className="search-input"
            placeholder="Search products by name, gadget, brand..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="category-select-box">
          <Filter size={16} className="category-select-icon" />
          <select
            id="category-filter-select"
            className="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="category-chips-row">
        {CATEGORIES.map((cat) => {
          const isActive =
            (cat === 'All Categories' && (!selectedCategory || selectedCategory === 'All Categories')) ||
            selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              {cat === 'All Categories' && <Sparkles size={14} />}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SearchBar;
