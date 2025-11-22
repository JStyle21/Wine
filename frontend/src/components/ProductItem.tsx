import React from 'react';
import { Product } from '../interfaces/Product';
import './ProductList.css';

interface ProductItemProps {
  product: Product;
  onEdit?: (product: Product) => void;
}

// Helper function to format price
const formatPrice = (price: number | undefined): string => {
  if (!price) return 'לא צוין';
  if (Number.isInteger(price)) {
    return price.toString();
  }
  return price.toFixed(2);
};

const ProductItem: React.FC<ProductItemProps> = ({ product, onEdit }) => {
  const getPlaceholderImage = () => {
    // Wine bottle placeholder SVG
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><path fill="#f07281" d="M56.475 6.307h15.05v8.482h-15.05z"/><path d="M58.159 14.789v25.534l-9.54 12.826a12 12 0 0 0-2.372 7.162v57.382a4 4 0 0 0 4 4h27.506a4 4 0 0 0 4-4V60.311a12 12 0 0 0-2.372-7.162l-9.54-12.826V14.789z" fill="#7a6d79"/><path fill="#f07281" d="M55.898 66h25.856v38.492H55.898z"/><path fill="#eaf6ff" d="M58.159 14.789h11.682v12.534H58.159z"/><path d="m80.786 52.105-3.994-5.368a1.75 1.75 0 1 0-2.808 2.089l3.993 5.368A10.313 10.313 0 0 1 80 60.311v3.939H55.9A1.75 1.75 0 0 0 54.148 66v38.492a1.75 1.75 0 0 0 1.75 1.75H80v11.451a2.252 2.252 0 0 1-2.25 2.25H50.247a2.252 2.252 0 0 1-2.25-2.25v-10.048a1.75 1.75 0 0 0-3.5 0v10.048a5.757 5.757 0 0 0 5.75 5.75h27.506a5.757 5.757 0 0 0 5.75-5.75V60.311a13.842 13.842 0 0 0-2.717-8.206zm-23.138 50.637V67.75H80v34.992z"/><path d="M46.247 100.158A1.751 1.751 0 0 0 48 98.408v-4.5a1.75 1.75 0 0 0-3.5 0v4.5a1.751 1.751 0 0 0 1.747 1.75zM46.247 86A1.751 1.751 0 0 0 48 84.253V60.311a10.313 10.313 0 0 1 2.026-6.117l9.541-12.826a1.753 1.753 0 0 0 .345-1.045v-11.25h8.182v11.25a1.75 1.75 0 0 0 3.5 0V16.532a1.746 1.746 0 0 0 1.684-1.743V6.307a1.751 1.751 0 0 0-1.75-1.75H56.475a1.751 1.751 0 0 0-1.75 1.75v8.482a1.746 1.746 0 0 0 1.684 1.743v23.212l-9.195 12.361a13.842 13.842 0 0 0-2.714 8.206v23.942A1.751 1.751 0 0 0 46.247 86zm13.662-60.43v-9.031h8.182v9.034zM58.225 8.057h11.55v4.982h-11.55z"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  };

  return (
    <li className="product-item">
      <div className="product-header">
        <h4>{product.name}</h4>
        {onEdit && (
          <button 
            className="edit-button" 
            onClick={() => onEdit(product)}
            title="ערוך מוצר"
          >
            ✏️
          </button>
        )}
      </div>
      
      <div className="product-content">
        <div className="product-image">
          <img 
            src={product.picture || getPlaceholderImage()} 
            alt={product.picture ? product.name : "Placeholder bottle"} 
            style={{maxWidth: '120px', maxHeight: '120px', objectFit: 'cover'}} 
          />
        </div>
        
        <div className="product-info">
          <div className="product-details">
            {product.type && <p><strong>סוג אלכוהול:</strong> {product.type}</p>}
            {product.country && <p><strong>מדינה:</strong> {product.country}</p>}
            {product.wineType && <p><strong>סוג יין:</strong> {product.wineType}</p>}
            {product.alcoholPercent && <p><strong>אחוז אלכוהול:</strong> {product.alcoholPercent}%</p>}
            {product.grapeType && product.grapeType.length > 0 && <p><strong>זני ענבים:</strong> {product.grapeType.join(', ')}</p>}
          </div>
          
          <div className="product-additional">
            {product.description && <p><strong>תיאור:</strong> {product.description}</p>}
            {product.url && <p><strong>קישור:</strong> <a href={product.url} target="_blank" rel="noopener noreferrer">לינק למוצר</a></p>}
            {product.tags && product.tags.length > 0 && <p><strong>תגיות:</strong> {product.tags.join(', ')}</p>}
          </div>
        </div>
      </div>

      <div className="product-footer">
        {product.price && <span className="product-price">₪{formatPrice(product.price)}</span>}
        <div className="product-status-container">
          <div className="product-status-row">
            <span className={`product-status ${product.liked ? 'fav' : ''}`}>
              <span className="product-detail-label">אהבתי:</span> {product.liked ? 'כן' : 'לא'}
            </span>
            <span className={`product-status ${product.bought ? 'purchased' : ''}`}>
              <span className="product-detail-label">קניתי:</span> {product.bought ? 'כן' : 'לא'}
            </span>
          </div>
          
          {product.bought && (product.dateOfPurchase || product.stock !== undefined) && (
            <div className="product-status-row purchase-info">
              {product.dateOfPurchase && (
                <span className="product-status purchase-date">
                  <span className="product-detail-label">תאריך קנייה:</span> {new Date(product.dateOfPurchase).toLocaleDateString('he-IL')}
                </span>
              )}
              {product.stock !== undefined && (
                <span className="product-status stock">
                  <span className="product-detail-label">במלאי:</span> {product.stock} בקבוקים
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

export default ProductItem;