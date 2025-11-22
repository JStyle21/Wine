import React, { useState, useEffect, useCallback } from 'react';
import { Product } from './interfaces/Product';
import { getProducts, GetProductsParams } from './services/api';
import ProductList from './components/ProductList';
import AddProductForm from './components/AddProductForm';
import EditProductForm from './components/EditProductForm';
import FilterControls from './components/FilterControls';
import './App.css';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalLiked, setTotalLiked] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<GetProductsParams>({});
  const [showAddProductForm, setShowAddProductForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [initialFilters, setInitialFilters] = useState<GetProductsParams>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    getProducts({ limit: 0, year: selectedYear }).then(({ totalCount, totalSpent, totalLiked }) => {
      setTotalProducts(totalCount);
      setTotalSpent(totalSpent);
      setTotalLiked(totalLiked);
    }).catch(err => {
      setError('נכשל בטעינת מספר המוצרים.');
      console.error(err);
    });
  }, [selectedYear]);

  const fetchProducts = useCallback(async (filters: GetProductsParams) => {
    setLoading(true);
    setError(null);
    try {
      const { products, totalCount, totalSpent, totalLiked } = await getProducts(filters);
      setProducts(products);
      setTotalProducts(totalCount);
      setTotalSpent(totalSpent);
      setTotalLiked(totalLiked);
    } catch (err) {
      setError('נכשל בטעינת המוצרים.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProductAdded = useCallback(() => {
    if (hasSearched) {
      fetchProducts(currentFilters);
    } else {
      getProducts({ limit: 0, year: selectedYear }).then(({ totalCount, totalSpent, totalLiked }) => {
        setTotalProducts(totalCount);
        setTotalSpent(totalSpent);
        setTotalLiked(totalLiked);
      });
    }
    setShowAddProductForm(false);
    setEditingProduct(null);
  }, [hasSearched, fetchProducts, currentFilters, selectedYear]);

  const handleFilterChange = useCallback((filters: GetProductsParams) => {
    setHasSearched(true);
    setCurrentFilters(filters);
    fetchProducts(filters);
  }, [fetchProducts]);

  const handleProductUpdated = useCallback((updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    setEditingProduct(null);
    // Update stats if needed
    if (hasSearched) {
      fetchProducts(currentFilters);
    } else {
      getProducts({ limit: 0, year: selectedYear }).then(({ totalCount, totalSpent, totalLiked }) => {
        setTotalProducts(totalCount);
        setTotalSpent(totalSpent);
        setTotalLiked(totalLiked);
      });
    }
  }, [hasSearched, fetchProducts, currentFilters, selectedYear]);

  const handleCancelEdit = useCallback(() => {
    setEditingProduct(null);
  }, []);

  const renderProductList = () => {
    if (!hasSearched) {
      return <p className="info-message">התחילו חיפוש כדי לראות מוצרים</p>;
    }
    if (loading) {
      return <p className="loading-message">טוען מוצרים...</p>;
    }
    if (error) {
      return <p className="error-message">נכשל בטעינת המוצרים.</p>;
    }
    return <ProductList products={products} onEditProduct={setEditingProduct} />;
  };

  const formatPrice = (price: number): string => {
    if (Number.isInteger(price)) {
      return price.toString();
    }
    return price.toFixed(2);
  };

  return (
    <div className="App">
      <h1>ניהול אלכוהול</h1>
      <div className="stats-container">
        <p className="total-count-message">סך הכל מוצרים במערכת: {totalProducts}</p>
        <div className="expense-year-container">
          <p className="total-count-message">סה"כ הוצאות בשנת {selectedYear}: ₪{formatPrice(totalSpent)}</p>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="year-selector"
          >
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
        <p className="total-count-message">סה"כ מוצרים שאהבתי: {totalLiked}</p>
      </div>

      <div className="add-product-toggle-container">
        <button 
          onClick={() => {
            setShowAddProductForm(!showAddProductForm);
            setEditingProduct(null);
          }}
          className="toggle-add-product-button"
          disabled={editingProduct !== null}
        >
          {showAddProductForm ? 'ביטול' : 'צור מוצר חדש'}
        </button>
      </div>

      {showAddProductForm && !editingProduct && (
        <div className="section-container">
          <AddProductForm onProductAdded={handleProductAdded} />
        </div>
      )}

      {editingProduct && (
        <div className="section-container">
          <EditProductForm 
            product={editingProduct} 
            onProductUpdated={handleProductUpdated}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      <div className="section-container">
        <FilterControls onFilterChange={handleFilterChange} initialFilters={initialFilters} />
      </div>

      <div className="section-container">
        {renderProductList()}
      </div>
    </div>
  );
}

export default App;