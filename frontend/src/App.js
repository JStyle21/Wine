import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import './App.css';

const TYPES = ['Wine', 'Whisky', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Brandy', 'Other'];
const WINE_TYPES = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'];
const COUNTRIES = ['France', 'Italy', 'Spain', 'USA', 'Argentina', 'Chile', 'Australia', 'Germany', 'Portugal', 'New Zealand', 'South Africa', 'Scotland', 'Ireland', 'Japan', 'Israel', 'Other'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ totalCount: 0, totalSpent: 0, totalLiked: 0, totalItems: 0, yearlyStats: [] });
  const [loading, setLoading] = useState(false);
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
    reviewed: '',
    interested: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then(userData => setUser(userData))
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.getProducts(filters);
      setProducts(data.products || []);
      setStats({
        totalCount: data.totalCount || 0,
        totalSpent: data.totalSpent || 0,
        totalLiked: data.totalLiked || 0,
        totalItems: data.totalItems || 0,
        yearlyStats: data.yearlyStats || [],
      });
      setError(null);
    } catch (err) {
      if (err.message === 'Unauthorized') {
        localStorage.removeItem('token');
        setUser(null);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    if (user) fetchProducts();
  }, [fetchProducts, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProducts([]);
  };

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

  const handleDelete = async (product) => {
    if (window.confirm(`Delete "${product.name}"?`)) {
      try {
        await api.deleteProduct(product._id);
        fetchProducts();
      } catch (err) {
        alert(err.message);
      }
    }
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

  const handleToggleField = async (product, field) => {
    try {
      await api.updateProduct(product._id, { [field]: !product[field] });
      fetchProducts();
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <AuthForm onSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Wine & Spirit Tracker</h1>
        <div className="header-actions">
          <span className="user-info">Welcome, {user.username}</span>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          <button className="btn btn-primary" onClick={handleAddNew}>+ Add New</button>
        </div>
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
        <div className="stat">
          <span className="stat-value">{stats.totalItems}</span>
          <span className="stat-label">Bottles Bought</span>
        </div>
      </div>

      {stats.yearlyStats.length > 0 && (
        <div className="yearly-stats">
          <h3>Spending by Year</h3>
          <div className="yearly-grid">
            {stats.yearlyStats.map(year => (
              <div key={year._id} className="yearly-item">
                <span className="year">{year._id}</span>
                <span className="amount">${year.spent.toFixed(2)}</span>
                <span className="count">{year.count} items</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="filter-input"
        />
        <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} className="filter-select">
          <option value="">All Types</option>
          {TYPES.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
        <select value={filters.country} onChange={(e) => handleFilterChange('country', e.target.value)} className="filter-select">
          <option value="">All Countries</option>
          {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
        </select>
        {filters.type === 'Wine' && (
          <select value={filters.wineType} onChange={(e) => handleFilterChange('wineType', e.target.value)} className="filter-select">
            <option value="">All Wine Types</option>
            {WINE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        )}
        <select value={filters.fav} onChange={(e) => handleFilterChange('fav', e.target.value)} className="filter-select">
          <option value="">All Items</option>
          <option value="true">Favorites</option>
        </select>
        <select value={filters.purchased} onChange={(e) => handleFilterChange('purchased', e.target.value)} className="filter-select">
          <option value="">All Status</option>
          <option value="true">Purchased</option>
          <option value="false">Wishlist</option>
        </select>
        <select value={filters.reviewed} onChange={(e) => handleFilterChange('reviewed', e.target.value)} className="filter-select">
          <option value="">All Review Status</option>
          <option value="true">Reviewed</option>
          <option value="false">Not Reviewed</option>
        </select>
        <select value={filters.interested} onChange={(e) => handleFilterChange('interested', e.target.value)} className="filter-select">
          <option value="">All Interest</option>
          <option value="true">Interested</option>
        </select>
        <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)} className="filter-select">
          <option value="createdAt">Date Added</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="dateOfPurchase">Purchase Date</option>
        </select>
        <select value={filters.order} onChange={(e) => handleFilterChange('order', e.target.value)} className="filter-select">
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
                  <img src={product.picture} alt={product.name} className="product-image" />
                )}
                <div className="product-content">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-meta">
                    <span className="product-type">{product.type}</span>
                    {product.country && <span className="product-country">{product.country}</span>}
                    {product.kosher && <span className="product-kosher">Kosher</span>}
                  </div>
                  {product.wineType && <div className="product-wine-type">{product.wineType}</div>}
                  {product.grapeType && product.grapeType.length > 0 && (
                    <div className="product-grape">{product.grapeType.join(', ')}</div>
                  )}
                  {product.description && <p className="product-description">{product.description}</p>}
                  <div className="product-price">${product.price ? product.price.toFixed(2) : '0.00'}</div>
                  {product.alcoholPercent && <div className="product-alcohol">{product.alcoholPercent}% ABV</div>}

                  <div className="product-inventory">
                    {product.quantityBought > 0 && <span>Bought: {product.quantityBought}</span>}
                    {product.quantityLeft !== undefined && product.quantityLeft >= 0 && <span>Left: {product.quantityLeft}</span>}
                  </div>

                  {product.pickupRange && (
                    <div className="product-pickup">
                      Pickup: {product.pickupRange}
                      {product.pickupStatus && <span className="picked-up"> (Picked up)</span>}
                    </div>
                  )}

                  {product.url && (
                    <a href={product.url} target="_blank" rel="noopener noreferrer" className="product-link">
                      View Product
                    </a>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <div className="product-tags">
                      {product.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                    </div>
                  )}

                  <div className="product-status">
                    {product.reviewed && <span className="status-badge reviewed">Reviewed</span>}
                    {product.interested && <span className="status-badge interested">Interested</span>}
                  </div>

                  <div className="product-actions">
                    <button
                      className={`btn-icon ${product.liked ? 'active' : ''}`}
                      onClick={() => handleToggleField(product, 'liked')}
                      title="Favorite"
                    >
                      {product.liked ? '★' : '☆'}
                    </button>
                    <button
                      className={`btn-icon ${product.bought ? 'active' : ''}`}
                      onClick={() => handleToggleField(product, 'bought')}
                      title="Purchased"
                    >
                      {product.bought ? '✓' : '○'}
                    </button>
                    <button
                      className={`btn-icon ${product.reviewed ? 'active' : ''}`}
                      onClick={() => handleToggleField(product, 'reviewed')}
                      title="Reviewed"
                    >
                      R
                    </button>
                    <button
                      className={`btn-icon ${product.interested ? 'active' : ''}`}
                      onClick={() => handleToggleField(product, 'interested')}
                      title="Interested"
                    >
                      !
                    </button>
                    <button className="btn-icon" onClick={() => handleEdit(product)} title="Edit">✎</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(product)} title="Delete">×</button>
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

function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await api.login(email, password);
      } else {
        data = await api.register(username, email, password);
      }
      localStorage.setItem('token', data.token);
      onSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>Wine & Spirit Tracker</h1>
        <h2>{isLogin ? 'Login' : 'Register'}</h2>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
                minLength={3}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
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
    kosher: product?.kosher || false,
    alcoholPercent: product?.alcoholPercent || '',
    url: product?.url || '',
    tags: product?.tags?.join(', ') || '',
    liked: product?.liked || false,
    bought: product?.bought || false,
    picture: product?.picture || '',
    dateOfPurchase: product?.dateOfPurchase ? product.dateOfPurchase.split('T')[0] : '',
    pickupRangeStart: '',
    pickupRangeEnd: '',
    pickupStatus: product?.pickupStatus || false,
    reviewed: product?.reviewed || false,
    interested: product?.interested || false,
    quantityBought: product?.quantityBought || '',
    quantityLeft: product?.quantityLeft || '',
  });

  useEffect(() => {
    if (product?.pickupRange) {
      const parts = product.pickupRange.split('-');
      if (parts.length === 2) {
        setFormData(prev => ({
          ...prev,
          pickupRangeStart: parts[0].trim(),
          pickupRangeEnd: parts[1].trim(),
        }));
      }
    }
  }, [product]);

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
    const pickupRange = formData.pickupRangeStart && formData.pickupRangeEnd
      ? `${formData.pickupRangeStart}-${formData.pickupRangeEnd}`
      : '';

    const data = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      alcoholPercent: parseFloat(formData.alcoholPercent) || 0,
      quantityBought: parseInt(formData.quantityBought) || 0,
      quantityLeft: parseInt(formData.quantityLeft) || 0,
      grapeType: formData.grapeType ? formData.grapeType.split(',').map(s => s.trim()).filter(Boolean) : [],
      tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      pickupRange,
      dateOfPurchase: formData.dateOfPurchase || undefined,
    };

    delete data.pickupRangeStart;
    delete data.pickupRangeEnd;

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
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                {TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Country</label>
              <select name="country" value={formData.country} onChange={handleChange}>
                <option value="">Select...</option>
                {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
              </select>
            </div>
          </div>

          {formData.type === 'Wine' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Wine Type</label>
                  <select name="wineType" value={formData.wineType} onChange={handleChange}>
                    <option value="">Select...</option>
                    {WINE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="form-group checkbox-inline">
                  <label className="checkbox-label">
                    <input type="checkbox" name="kosher" checked={formData.kosher} onChange={handleChange} />
                    Kosher
                  </label>
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
            </>
          )}

          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price ($)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" />
            </div>
            <div className="form-group">
              <label>Alcohol %</label>
              <input type="number" name="alcoholPercent" value={formData.alcoholPercent} onChange={handleChange} step="0.1" min="0" max="100" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Quantity Bought</label>
              <input type="number" name="quantityBought" value={formData.quantityBought} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label>Quantity Left</label>
              <input type="number" name="quantityLeft" value={formData.quantityLeft} onChange={handleChange} min="0" />
            </div>
          </div>

          <div className="form-group">
            <label>Date of Purchase</label>
            <input type="date" name="dateOfPurchase" value={formData.dateOfPurchase} onChange={handleChange} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Pickup Range Start</label>
              <select name="pickupRangeStart" value={formData.pickupRangeStart} onChange={handleChange}>
                <option value="">Select...</option>
                {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Pickup Range End</label>
              <select name="pickupRangeEnd" value={formData.pickupRangeEnd} onChange={handleChange}>
                <option value="">Select...</option>
                {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Product URL</label>
            <input type="url" name="url" value={formData.url} onChange={handleChange} placeholder="https://..." />
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., gift, special occasion" />
          </div>

          <div className="form-group">
            <label>Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {formData.picture && <img src={formData.picture} alt="Preview" className="image-preview" />}
          </div>

          <div className="form-row checkboxes">
            <label className="checkbox-label">
              <input type="checkbox" name="liked" checked={formData.liked} onChange={handleChange} />
              Favorite
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="bought" checked={formData.bought} onChange={handleChange} />
              Purchased
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="pickupStatus" checked={formData.pickupStatus} onChange={handleChange} />
              Picked Up
            </label>
          </div>

          <div className="form-row checkboxes">
            <label className="checkbox-label">
              <input type="checkbox" name="reviewed" checked={formData.reviewed} onChange={handleChange} />
              Reviewed
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="interested" checked={formData.interested} onChange={handleChange} />
              Interested
            </label>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{product ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
