import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import './App.css';

const TYPES = ['Wine', 'Whisky', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Brandy', 'Other'];
const WINE_TYPES = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'];
const COUNTRIES = ['France', 'Italy', 'Spain', 'USA', 'Argentina', 'Chile', 'Australia', 'Germany', 'Portugal', 'New Zealand', 'South Africa', 'Scotland', 'Ireland', 'Japan', 'Other'];

function App() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, totalSpent: 0, totalLiked: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    country: '',
    wineType: '',
    fav: '',
    purchased: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getProducts(filters);
      setProducts(data.products || []);
      setStats({
        totalCount: data.totalCount || 0,
        totalSpent: data.totalSpent || 0,
        totalLiked: data.totalLiked || 0,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (productData) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id, productData);
      } else {
        await api.createProduct(productData);
      }
      handleFormClose();
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleLiked = async (product) => {
    try {
      await api.updateProduct(product._id, { liked: !product.liked });
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleBought = async (product) => {
    try {
      await api.updateProduct(product._id, { bought: !product.bought });
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Wine & Spirit Tracker</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          + Add New
        </button>
      </header>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{stats.totalCount}</span>
          <span className="stat-label">Total Items</span>
        </div>
        <div className="stat">
          <span className="stat-value">${stats.totalSpent.toFixed(2)}</span>
          <span className="stat-label">Total Spent</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.totalLiked}</span>
          <span className="stat-label">Favorites</span>
        </div>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="filter-input"
        />
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="filter-select"
        >
          <option value="">All Types</option>
          {TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <select
          value={filters.country}
          onChange={(e) => handleFilterChange('country', e.target.value)}
          className="filter-select"
        >
          <option value="">All Countries</option>
          {COUNTRIES.map(country => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
        {filters.type === 'Wine' && (
          <select
            value={filters.wineType}
            onChange={(e) => handleFilterChange('wineType', e.target.value)}
            className="filter-select"
          >
            <option value="">All Wine Types</option>
            {WINE_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        )}
        <select
          value={filters.fav}
          onChange={(e) => handleFilterChange('fav', e.target.value)}
          className="filter-select"
        >
          <option value="">All Items</option>
          <option value="true">Favorites Only</option>
        </select>
        <select
          value={filters.purchased}
          onChange={(e) => handleFilterChange('purchased', e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="true">Purchased</option>
          <option value="false">Wishlist</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          className="filter-select"
        >
          <option value="createdAt">Date Added</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="dateOfPurchase">Purchase Date</option>
        </select>
        <select
          value={filters.order}
          onChange={(e) => handleFilterChange('order', e.target.value)}
          className="filter-select"
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="product-grid">
          {products.length === 0 ? (
            <div className="empty">No items found. Add your first bottle!</div>
          ) : (
            products.map(product => (
              <div key={product._id} className="product-card">
                {product.picture && (
                  <img
                    src={product.picture}
                    alt={product.name}
                    className="product-image"
                  />
                )}
                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-meta">
                    <span className="product-type">{product.type}</span>
                    {product.country && (
                      <span className="product-country">{product.country}</span>
                    )}
                  </div>
                  {product.wineType && (
                    <div className="product-wine-type">{product.wineType}</div>
                  )}
                  {product.grapeType && product.grapeType.length > 0 && (
                    <div className="product-grape">{product.grapeType.join(', ')}</div>
                  )}
                  {product.description && (
                    <p className="product-description">{product.description}</p>
                  )}
                  <div className="product-price">
                    ${product.price ? product.price.toFixed(2) : '0.00'}
                  </div>
                  {product.alcoholPercent && (
                    <div className="product-alcohol">{product.alcoholPercent}% ABV</div>
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div className="product-tags">
                      {product.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="product-actions">
                    <button
                      className={`btn-icon ${product.liked ? 'active' : ''}`}
                      onClick={() => handleToggleLiked(product)}
                      title={product.liked ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {product.liked ? '★' : '☆'}
                    </button>
                    <button
                      className={`btn-icon ${product.bought ? 'active' : ''}`}
                      onClick={() => handleToggleBought(product)}
                      title={product.bought ? 'Mark as wishlist' : 'Mark as purchased'}
                    >
                      {product.bought ? '✓' : '○'}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(product)}
                      title="Edit"
                    >
                      ✎
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

function ProductForm({ product, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    type: product?.type || 'Wine',
    country: product?.country || '',
    wineType: product?.wineType || '',
    grapeType: product?.grapeType?.join(', ') || '',
    alcoholPercent: product?.alcoholPercent || '',
    url: product?.url || '',
    tags: product?.tags?.join(', ') || '',
    liked: product?.liked || false,
    bought: product?.bought || false,
    picture: product?.picture || '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, picture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      alcoholPercent: parseFloat(formData.alcoholPercent) || 0,
      grapeType: formData.grapeType ? formData.grapeType.split(',').map(s => s.trim()).filter(Boolean) : [],
      tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    onSubmit(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Item' : 'Add New Item'}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                {TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Country</label>
              <select name="country" value={formData.country} onChange={handleChange}>
                <option value="">Select...</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>
          {formData.type === 'Wine' && (
            <div className="form-group">
              <label>Wine Type</label>
              <select name="wineType" value={formData.wineType} onChange={handleChange}>
                <option value="">Select...</option>
                {WINE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Alcohol %</label>
              <input
                type="number"
                name="alcoholPercent"
                value={formData.alcoholPercent}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Grape Types (comma-separated)</label>
            <input
              type="text"
              name="grapeType"
              value={formData.grapeType}
              onChange={handleChange}
              placeholder="e.g., Cabernet Sauvignon, Merlot"
            />
          </div>
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., gift, special occasion"
            />
          </div>
          <div className="form-group">
            <label>URL</label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {formData.picture && (
              <img src={formData.picture} alt="Preview" className="image-preview" />
            )}
          </div>
          <div className="form-row checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="liked"
                checked={formData.liked}
                onChange={handleChange}
              />
              Favorite
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="bought"
                checked={formData.bought}
                onChange={handleChange}
              />
              Purchased
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
