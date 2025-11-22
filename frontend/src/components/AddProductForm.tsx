import React, { useState, KeyboardEvent, useRef } from 'react';
import { addProduct } from '../services/api';
import { Product } from '../interfaces/Product';
import './AddProductForm.css'; // Import the CSS file

interface AddProductFormProps {
  onProductAdded: (product: Product) => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onProductAdded }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [liked, setLiked] = useState(false);
  const [bought, setBought] = useState(false);
  const [type, setType] = useState('');
  const [country, setCountry] = useState('');
  const [wineType, setWineType] = useState('');
  const [grapeTypes, setGrapeTypes] = useState<string[]>([]);
  const [currentGrape, setCurrentGrape] = useState('');
  const [alcoholPercent, setAlcoholPercent] = useState('');
  const [url, setUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [picture, setPicture] = useState('');
  const [dateOfPurchase, setDateOfPurchase] = useState('');
  const [stock, setStock] = useState('');
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
      const newProduct = await addProduct({
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
      onProductAdded(newProduct);
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setLiked(false);
      setBought(false);
      setType('');
      setCountry('');
      setWineType('');
      setGrapeTypes([]);
      setCurrentGrape('');
      setAlcoholPercent('');
      setUrl('');
      setTags([]);
      setCurrentTag('');
      setPicture('');
      setDateOfPurchase('');
      setStock('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Failed to add product:', error);
      if (error.response && error.response.status === 409) {
        alert(error.response.data.message || 'מוצר עם שם זה כבר קיים.');
      } else {
        alert('נכשל בהוספת המוצר.');
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


  return (
    <form onSubmit={handleSubmit} className="add-product-form compact-form">
      <h3>הוסף מוצר חדש</h3>
      
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
        
        {picture && (
          <div className="image-preview compact">
            <img src={picture} alt="Product preview" />
            <button type="button" onClick={clearImage} className="clear-image-btn">הסר</button>
          </div>
        )}

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

      <button type="submit" className="submit-button">הוסף מוצר</button>
    </form>
  );
};

export default AddProductForm;