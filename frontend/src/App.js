import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from './services/api';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  RateReview as ReviewIcon,
  Bookmark as BookmarkIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#722f37',
    },
    secondary: {
      main: '#4A0E1E',
    },
    ...(mode === 'light'
      ? {
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
        }
      : {
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
        }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const TYPES = ['Wine', 'Whisky', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Brandy', 'Other'];
const WINE_TYPES = ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert', 'Fortified'];
const COUNTRIES = ['France', 'Italy', 'Spain', 'USA', 'Argentina', 'Chile', 'Australia', 'Germany', 'Portugal', 'New Zealand', 'South Africa', 'Scotland', 'Ireland', 'Japan', 'Israel', 'Other'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || (prefersDarkMode ? 'dark' : 'light');
  });

  const theme = useMemo(() => getTheme(mode), [mode]);

  const toggleDarkMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

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
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (!user) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthForm onSuccess={(userData) => setUser(userData)} mode={mode} toggleDarkMode={toggleDarkMode} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Wine & Spirit Tracker
            </Typography>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Welcome, {user.username}
            </Typography>
            <IconButton color="inherit" onClick={toggleDarkMode} title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Logout
            </Button>
            <Button color="inherit" variant="outlined" startIcon={<AddIcon />} onClick={handleAddNew} sx={{ ml: 1 }}>
              Add New
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
          {/* Stats Bar */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{stats.totalCount}</Typography>
                <Typography variant="body2" color="text.secondary">Total Items</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">₪{stats.totalSpent.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">סה"כ הוצאות</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{stats.totalLiked}</Typography>
                <Typography variant="body2" color="text.secondary">Favorites</Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">{stats.totalItems}</Typography>
                <Typography variant="body2" color="text.secondary">Bottles Bought</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Yearly Stats */}
          {stats.yearlyStats.length > 0 && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Spending by Year</Typography>
              <Grid container spacing={2}>
                {stats.yearlyStats.map(year => (
                  <Grid item xs={6} sm={4} md={2} key={year._id}>
                    <Box textAlign="center">
                      <Typography variant="h6">{year._id}</Typography>
                      <Typography variant="body1" color="primary">₪{year.spent.toFixed(2)}</Typography>
                      <Typography variant="caption" color="text.secondary">{year.count} פריטים</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select value={filters.type} label="Type" onChange={(e) => handleFilterChange('type', e.target.value)}>
                    <MenuItem value="">All Types</MenuItem>
                    {TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Country</InputLabel>
                  <Select value={filters.country} label="Country" onChange={(e) => handleFilterChange('country', e.target.value)}>
                    <MenuItem value="">All Countries</MenuItem>
                    {COUNTRIES.map(country => <MenuItem key={country} value={country}>{country}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              {filters.type === 'Wine' && (
                <Grid item xs={6} sm={3} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Wine Type</InputLabel>
                    <Select value={filters.wineType} label="Wine Type" onChange={(e) => handleFilterChange('wineType', e.target.value)}>
                      <MenuItem value="">All Wine Types</MenuItem>
                      {WINE_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Favorites</InputLabel>
                  <Select value={filters.fav} label="Favorites" onChange={(e) => handleFilterChange('fav', e.target.value)}>
                    <MenuItem value="">All Items</MenuItem>
                    <MenuItem value="true">Favorites Only</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select value={filters.purchased} label="Status" onChange={(e) => handleFilterChange('purchased', e.target.value)}>
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="true">Purchased</MenuItem>
                    <MenuItem value="false">Wishlist</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Reviewed</InputLabel>
                  <Select value={filters.reviewed} label="Reviewed" onChange={(e) => handleFilterChange('reviewed', e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Reviewed</MenuItem>
                    <MenuItem value="false">Not Reviewed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Interested</InputLabel>
                  <Select value={filters.interested} label="Interested" onChange={(e) => handleFilterChange('interested', e.target.value)}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="true">Interested</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select value={filters.sortBy} label="Sort By" onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
                    <MenuItem value="createdAt">Date Added</MenuItem>
                    <MenuItem value="name">Name</MenuItem>
                    <MenuItem value="price">Price</MenuItem>
                    <MenuItem value="dateOfPurchase">Purchase Date</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Order</InputLabel>
                  <Select value={filters.order} label="Order" onChange={(e) => handleFilterChange('order', e.target.value)}>
                    <MenuItem value="desc">Descending</MenuItem>
                    <MenuItem value="asc">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : products.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No items found. Add your first bottle!
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {products.map(product => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {product.picture && (
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.picture}
                        alt={product.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" gutterBottom>
                        {product.name}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Chip label={product.type} size="small" color="primary" sx={{ mr: 0.5 }} />
                        {product.country && <Chip label={product.country} size="small" variant="outlined" sx={{ mr: 0.5 }} />}
                        {product.kosher && <Chip label="Kosher" size="small" color="secondary" />}
                      </Box>
                      {product.wineType && (
                        <Typography variant="body2" color="text.secondary">{product.wineType}</Typography>
                      )}
                      {product.grapeType && product.grapeType.length > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          {product.grapeType.join(', ')}
                        </Typography>
                      )}
                      {product.description && (
                        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                          {product.description.length > 100 ? product.description.substring(0, 100) + '...' : product.description}
                        </Typography>
                      )}
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        ₪{product.price ? product.price.toFixed(2) : '0.00'}
                      </Typography>
                      {product.alcoholPercent > 0 && (
                        <Typography variant="body2" color="text.secondary">{product.alcoholPercent}% ABV</Typography>
                      )}
                      {product.stock > 0 && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          במלאי: {product.stock}
                        </Typography>
                      )}
                      {product.pickupRange && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          Pickup: {product.pickupRange}
                          {product.pickupStatus && <Chip label="Picked up" size="small" color="success" sx={{ ml: 1 }} />}
                        </Typography>
                      )}
                      {product.url && (
                        <Button
                          size="small"
                          startIcon={<LinkIcon />}
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mt: 1 }}
                        >
                          View Product
                        </Button>
                      )}
                      {product.tags && product.tags.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {product.tags.map(tag => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      )}
                      <Box sx={{ mt: 1 }}>
                        {product.reviewed && <Chip label="Reviewed" size="small" color="info" sx={{ mr: 0.5 }} />}
                        {product.interested && <Chip label="Interested" size="small" color="warning" />}
                      </Box>
                    </CardContent>
                    <Divider />
                    <CardActions sx={{ justifyContent: 'space-between' }}>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleField(product, 'liked')}
                          color={product.liked ? 'primary' : 'default'}
                          title="Favorite"
                        >
                          {product.liked ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleField(product, 'bought')}
                          color={product.bought ? 'success' : 'default'}
                          title="Purchased"
                        >
                          {product.bought ? <CheckCircleIcon /> : <UncheckedIcon />}
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleField(product, 'reviewed')}
                          color={product.reviewed ? 'info' : 'default'}
                          title="Reviewed"
                        >
                          <ReviewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleField(product, 'interested')}
                          color={product.interested ? 'warning' : 'default'}
                          title="Interested"
                        >
                          <BookmarkIcon />
                        </IconButton>
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleEdit(product)} title="Edit">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(product)} color="error" title="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>

        {showForm && (
          <ProductForm
            product={editingProduct}
            onSubmit={handleFormSubmit}
            onClose={handleFormClose}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

function AuthForm({ onSuccess, mode, toggleDarkMode }) {
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      <IconButton
        onClick={toggleDarkMode}
        sx={{ position: 'absolute', top: 16, right: 16 }}
        title={mode === 'light' ? 'Dark mode' : 'Light mode'}
      >
        {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%', mx: 2 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom color="primary">
          Wine & Spirit Tracker
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          {isLogin ? 'Login' : 'Register'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required={!isLogin}
              inputProps={{ minLength: 3 }}
              margin="normal"
            />
          )}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            inputProps={{ minLength: 6 }}
            margin="normal"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : (isLogin ? 'Login' : 'Register')}
          </Button>
        </form>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Button onClick={() => setIsLogin(!isLogin)} size="small">
              {isLogin ? 'Register' : 'Login'}
            </Button>
          </Typography>
        </Box>
      </Paper>
    </Box>
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
    grapeTypes: product?.grapeType || [],
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
    stock: product?.stock || '',
  });

  const [availableGrapeTypes, setAvailableGrapeTypes] = useState([]);
  const [newGrapeType, setNewGrapeType] = useState('');

  useEffect(() => {
    // Fetch available grape types
    api.getGrapeTypes().then(setAvailableGrapeTypes).catch(() => {});
  }, []);

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

  const handleGrapeTypeToggle = (grape) => {
    setFormData(prev => ({
      ...prev,
      grapeTypes: prev.grapeTypes.includes(grape)
        ? prev.grapeTypes.filter(g => g !== grape)
        : [...prev.grapeTypes, grape]
    }));
  };

  const handleAddNewGrapeType = () => {
    if (newGrapeType.trim() && !formData.grapeTypes.includes(newGrapeType.trim())) {
      setFormData(prev => ({
        ...prev,
        grapeTypes: [...prev.grapeTypes, newGrapeType.trim()]
      }));
      setNewGrapeType('');
    }
  };

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
      stock: parseInt(formData.stock) || 0,
      grapeType: formData.grapeTypes,
      tags: formData.tags ? formData.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      pickupRange,
      dateOfPurchase: formData.dateOfPurchase || undefined,
    };

    delete data.grapeTypes;
    delete data.pickupRangeStart;
    delete data.pickupRangeEnd;

    onSubmit(data);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {product ? 'Edit Item' : 'Add New Item'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select name="type" value={formData.type} label="Type" onChange={handleChange}>
                  {TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select name="country" value={formData.country} label="Country" onChange={handleChange}>
                  <MenuItem value="">Select...</MenuItem>
                  {COUNTRIES.map(country => <MenuItem key={country} value={country}>{country}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {formData.type === 'Wine' && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Wine Type</InputLabel>
                    <Select name="wineType" value={formData.wineType} label="Wine Type" onChange={handleChange}>
                      <MenuItem value="">Select...</MenuItem>
                      {WINE_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Checkbox name="kosher" checked={formData.kosher} onChange={handleChange} />}
                    label="Kosher"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    זני ענבים
                  </Typography>
                  {availableGrapeTypes.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        לחץ לבחירה:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {availableGrapeTypes.map(grape => (
                          <Chip
                            key={grape}
                            label={grape}
                            size="small"
                            onClick={() => handleGrapeTypeToggle(grape)}
                            color={formData.grapeTypes.includes(grape) ? 'primary' : 'default'}
                            variant={formData.grapeTypes.includes(grape) ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      size="small"
                      label="הוסף זן חדש"
                      value={newGrapeType}
                      onChange={(e) => setNewGrapeType(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNewGrapeType())}
                      sx={{ flexGrow: 1 }}
                    />
                    <Button variant="outlined" onClick={handleAddNewGrapeType} disabled={!newGrapeType.trim()}>
                      הוסף
                    </Button>
                  </Box>
                  {formData.grapeTypes.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: '100%' }}>
                        נבחרו:
                      </Typography>
                      {formData.grapeTypes.map(grape => (
                        <Chip
                          key={grape}
                          label={grape}
                          size="small"
                          onDelete={() => handleGrapeTypeToggle(grape)}
                          color="primary"
                        />
                      ))}
                    </Box>
                  )}
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="מחיר (₪)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                inputProps={{ step: 0.01, min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="אחוז אלכוהול"
                name="alcoholPercent"
                type="number"
                value={formData.alcoholPercent}
                onChange={handleChange}
                inputProps={{ step: 0.1, min: 0, max: 100 }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="מלאי"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date of Purchase"
                name="dateOfPurchase"
                type="date"
                value={formData.dateOfPurchase}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Pickup Range Start</InputLabel>
                <Select name="pickupRangeStart" value={formData.pickupRangeStart} label="Pickup Range Start" onChange={handleChange}>
                  <MenuItem value="">Select...</MenuItem>
                  {MONTHS.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Pickup Range End</InputLabel>
                <Select name="pickupRangeEnd" value={formData.pickupRangeEnd} label="Pickup Range End" onChange={handleChange}>
                  <MenuItem value="">Select...</MenuItem>
                  {MONTHS.map(month => <MenuItem key={month} value={month}>{month}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product URL"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., gift, special occasion"
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Image
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {formData.picture && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img src={formData.picture} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200 }} />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <FormControlLabel
                  control={<Checkbox name="liked" checked={formData.liked} onChange={handleChange} />}
                  label="Favorite"
                />
                <FormControlLabel
                  control={<Checkbox name="bought" checked={formData.bought} onChange={handleChange} />}
                  label="Purchased"
                />
                <FormControlLabel
                  control={<Checkbox name="pickupStatus" checked={formData.pickupStatus} onChange={handleChange} />}
                  label="Picked Up"
                />
                <FormControlLabel
                  control={<Checkbox name="reviewed" checked={formData.reviewed} onChange={handleChange} />}
                  label="Reviewed"
                />
                <FormControlLabel
                  control={<Checkbox name="interested" checked={formData.interested} onChange={handleChange} />}
                  label="Interested"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">{product ? 'Save Changes' : 'Add Item'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default App;
