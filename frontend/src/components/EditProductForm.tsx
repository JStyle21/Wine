import React, { useState, KeyboardEvent, useRef } from 'react';
import { updateProduct } from '../services/api';
import { Product } from '../interfaces/Product';
import './AddProductForm.css'; // Reuse the same styles

interface EditProductFormProps {
  product: Product;
  onProductUpdated: (product: Product) => void;
  onCancel: () => void;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ product, onProductUpdated, onCancel }) => {
  const [name, setName] = useState(product.name || '');
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(product.price ? product.price.toString() : '');
  const [liked, setLiked] = useState(product.liked || false);
  const [bought, setBought] = useState(product.bought || false);
  const [type, setType] = useState(product.type || '');
  const [country, setCountry] = useState(product.country || '');
  const [wineType, setWineType] = useState(product.wineType || '');
  const [grapeTypes, setGrapeTypes] = useState<string[]>(product.grapeType || []);
  const [currentGrape, setCurrentGrape] = useState('');
  const [alcoholPercent, setAlcoholPercent] = useState(product.alcoholPercent ? product.alcoholPercent.toString() : '');
  const [url, setUrl] = useState(product.url || '');
  const [tags, setTags] = useState<string[]>(product.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [picture, setPicture] = useState(product.picture || '');
  const [dateOfPurchase, setDateOfPurchase] = useState(product.dateOfPurchase ? product.dateOfPurchase.split('T')[0] : '');
  const [stock, setStock] = useState(product.stock ? product.stock.toString() : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('גודל התמונה גדול מדי. אנא בחר תמונה קטנה מ-5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 800x800)
          const maxSize = 800;
          let { width, height } = img;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress image
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setPicture(compressedBase64);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPicture('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGrapeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (currentGrape.trim() && !grapeTypes.includes(currentGrape.trim())) {
        setGrapeTypes([...grapeTypes, currentGrape.trim()]);
      }
      setCurrentGrape('');
    }
  };

  const removeGrape = (grapeToRemove: string) => {
    setGrapeTypes(grapeTypes.filter(grape => grape !== grapeToRemove));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (currentTag.trim() && !tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('שם הוא שדה חובה.');
      return;
    }
    try {
      const updatedProduct = await updateProduct(product._id!, {
        name,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        liked,
        bought,
        stock: stock ? parseInt(stock) : undefined,
        type: type || undefined,
        country: country || undefined,
        wineType: wineType || undefined,
        grapeType: grapeTypes.length > 0 ? grapeTypes : undefined,
        alcoholPercent: alcoholPercent ? parseFloat(alcoholPercent) : undefined,
        url: url || undefined,
        tags: tags.length > 0 ? tags : undefined,
        picture: picture || undefined,
        dateOfPurchase: dateOfPurchase || undefined,
      });
      onProductUpdated(updatedProduct);
    } catch (error: any) {
      console.error('Failed to update product:', error);
      if (error.response && error.response.status === 409) {
        alert(error.response.data.message || 'מוצר עם שם זה כבר קיים.');
      } else {
        alert('נכשל בעדכון המוצר.');
      }
    }
  };

  const typeOptions = [
    { value: 'wine', label: 'יין' },
    { value: 'whisky', label: 'ויסקי' },
    { value: 'beer', label: 'בירה' },
    { value: 'vodka', label: 'וודקה' },
    { value: 'rum', label: 'רום' },
    { value: 'gin', label: 'ג\'ין' },
  ];

  const wineTypeOptions = [
    { value: 'Red', label: 'אדום' },
    { value: 'White', label: 'לבן' },
    { value: 'Rosé', label: 'רוזה' },
    { value: 'Sparkling', label: 'מבעבע' },
    { value: 'Dessert', label: 'קינוח' },
  ];

  const getPlaceholderImage = () => {
    // Wine bottle placeholder SVG
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><path fill="#f07281" d="M56.475 6.307h15.05v8.482h-15.05z"/><path d="M58.159 14.789v25.534l-9.54 12.826a12 12 0 0 0-2.372 7.162v57.382a4 4 0 0 0 4 4h27.506a4 4 0 0 0 4-4V60.311a12 12 0 0 0-2.372-7.162l-9.54-12.826V14.789z" fill="#7a6d79"/><path fill="#f07281" d="M55.898 66h25.856v38.492H55.898z"/><path fill="#eaf6ff" d="M58.159 14.789h11.682v12.534H58.159z"/><path d="m80.786 52.105-3.994-5.368a1.75 1.75 0 1 0-2.808 2.089l3.993 5.368A10.313 10.313 0 0 1 80 60.311v3.939H55.9A1.75 1.75 0 0 0 54.148 66v38.492a1.75 1.75 0 0 0 1.75 1.75H80v11.451a2.252 2.252 0 0 1-2.25 2.25H50.247a2.252 2.252 0 0 1-2.25-2.25v-10.048a1.75 1.75 0 0 0-3.5 0v10.048a5.757 5.757 0 0 0 5.75 5.75h27.506a5.757 5.757 0 0 0 5.75-5.75V60.311a13.842 13.842 0 0 0-2.717-8.206zm-23.138 50.637V67.75H80v34.992z"/><path d="M46.247 100.158A1.751 1.751 0 0 0 48 98.408v-4.5a1.75 1.75 0 0 0-3.5 0v4.5a1.751 1.751 0 0 0 1.747 1.75zM46.247 86A1.751 1.751 0 0 0 48 84.253V60.311a10.313 10.313 0 0 1 2.026-6.117l9.541-12.826a1.753 1.753 0 0 0 .345-1.045v-11.25h8.182v11.25a1.75 1.75 0 0 0 3.5 0V16.532a1.746 1.746 0 0 0 1.684-1.743V6.307a1.751 1.751 0 0 0-1.75-1.75H56.475a1.751 1.751 0 0 0-1.75 1.75v8.482a1.746 1.746 0 0 0 1.684 1.743v23.212l-9.195 12.361a13.842 13.842 0 0 0-2.714 8.206v23.942A1.751 1.751 0 0 0 46.247 86zm13.662-60.43v-9.031h8.182v9.034zM58.225 8.057h11.55v4.982h-11.55z"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svgString)}`;
  };

  return (
    <form onSubmit={handleSubmit} className="add-product-form compact-form">
      <h3>ערוך מוצר</h3>
      
      {/* Basic Info Section */}
      <div className="form-section">
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="productName">שם *</label>
            <input id="productName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group half-width">
            <label htmlFor="productCountry">מדינת ייצור</label>
            <input id="productCountry" type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="productDescription">תיאור</label>
          <input id="productDescription" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>

      {/* Type Selection */}
      <div className="form-section">
        <div className="form-group">
          <label>סוג אלכוהול</label>
          <div className="radio-group-compact">
            {typeOptions.map(option => (
              <div key={option.value} className="radio-option">
                <input 
                  type="radio" 
                  id={`type-${option.value}`} 
                  name="type" 
                  value={option.value} 
                  checked={type === option.value} 
                  onChange={(e) => setType(e.target.value)} 
                />
                <label htmlFor={`type-${option.value}`}>{option.label}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wine-specific fields - only show if wine is selected */}
      {type === 'wine' && (
        <div className="form-section wine-section">
          <div className="section-title">פרטי יין</div>
          <div className="form-row">
            <div className="form-group half-width">
              <label>סוג יין</label>
              <div className="radio-group-compact vertical">
                {wineTypeOptions.map(option => (
                  <div key={option.value} className="radio-option small">
                    <input 
                      type="radio" 
                      id={`wineType-${option.value}`} 
                      name="wineType" 
                      value={option.value} 
                      checked={wineType === option.value} 
                      onChange={(e) => setWineType(e.target.value)} 
                    />
                    <label htmlFor={`wineType-${option.value}`}>{option.label}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group half-width">
              <label htmlFor="grapeType">זני ענבים</label>
              <div className="tag-input-container compact">
                {grapeTypes.map(grape => (
                  <div key={grape} className="tag-item small">
                    {grape}
                    <button type="button" onClick={() => removeGrape(grape)}>&times;</button>
                  </div>
                ))}
                <input 
                  id="grapeType" 
                  type="text" 
                  value={currentGrape} 
                  onChange={(e) => setCurrentGrape(e.target.value)}
                  onKeyDown={handleGrapeKeyDown}
                  placeholder="הוסף זן"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Section */}
      <div className="form-section">
        <div className="form-row">
          <div className="form-group third-width">
            <label htmlFor="productPrice">מחיר</label>
            <input id="productPrice" type="number" value={price} onChange={(e) => setPrice(e.target.value)} step="0.01" />
          </div>
          <div className="form-group third-width">
            <label htmlFor="alcoholPercent">אחוז אלכוהול</label>
            <input id="alcoholPercent" type="number" value={alcoholPercent} onChange={(e) => setAlcoholPercent(e.target.value)} step="0.1" min="0" max="100" />
          </div>
          <div className="form-group third-width checkboxes-section">
            <div className="checkbox-group">
              <input id="productLiked" type="checkbox" checked={liked} onChange={(e) => setLiked(e.target.checked)} />
              <label htmlFor="productLiked">אהבתי</label>
            </div>
            <div className="checkbox-group">
              <input id="productBought" type="checkbox" checked={bought} onChange={(e) => setBought(e.target.checked)} />
              <label htmlFor="productBought">קניתי</label>
            </div>
          </div>
        </div>
        
        {/* Purchase Date and Stock - only show if bought is checked */}
        {bought && (
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="purchaseDate">תאריך קנייה</label>
              <input 
                id="purchaseDate" 
                type="date" 
                value={dateOfPurchase} 
                onChange={(e) => setDateOfPurchase(e.target.value)} 
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor="stock">כמות במלאי</label>
              <input 
                id="stock" 
                type="number" 
                value={stock} 
                onChange={(e) => setStock(e.target.value)} 
                min="0"
                placeholder="מספר בקבוקים"
              />
            </div>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="form-section">
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="productUrl">קישור למוצר</label>
            <input id="productUrl" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="form-group half-width">
            <label htmlFor="productImage">תמונה</label>
            <input 
              ref={fileInputRef}
              id="productImage" 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="compact-file-input"
            />
          </div>
        </div>
        
        <div className="image-preview compact">
          <img 
            src={picture || getPlaceholderImage()} 
            alt={picture ? "Product preview" : "Placeholder bottle"} 
          />
          {picture && (
            <button type="button" onClick={clearImage} className="clear-image-btn">הסר</button>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="tags">תגיות</label>
          <div className="tag-input-container compact">
            {tags.map(tag => (
              <div key={tag} className="tag-item small">
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>&times;</button>
              </div>
            ))}
            <input 
              id="tags" 
              type="text" 
              value={currentTag} 
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="הוסף תגית"
            />
          </div>
        </div>
      </div>

      <div className="form-buttons">
        <button type="submit" className="submit-button">עדכן מוצר</button>
        <button type="button" onClick={onCancel} className="cancel-button">ביטול</button>
      </div>
    </form>
  );
};

export default EditProductForm;