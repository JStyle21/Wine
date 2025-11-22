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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPicture(base64);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert('שם ומחיר הם שדות חובה.');
      return;
    }
    try {
      const newProduct = await addProduct({
        name,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        liked,
        bought,
        type: type || undefined,
        country: country || undefined,
        wineType: wineType || undefined,
        grapeType: grapeTypes.length > 0 ? grapeTypes : undefined,
        alcoholPercent: alcoholPercent ? parseFloat(alcoholPercent) : undefined,
        url: url || undefined,
        tags: tags.length > 0 ? tags : undefined,
        picture: picture || undefined,
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

  const wineTypeOptions = [
    { value: 'Red', label: 'אדום' },
    { value: 'White', label: 'לבן' },
    { value: 'Rosé', label: 'רוזה' },
    { value: 'Sparkling', label: 'מבעבע' },
    { value: 'Dessert', label: 'קינוח' },
  ];

  const typeOptions = [
    { value: 'wine', label: 'יין' },
    { value: 'whisky', label: 'ויסקי' },
    { value: 'beer', label: 'בירה' },
    { value: 'vodka', label: 'וודקה' },
    { value: 'rum', label: 'רום' },
    { value: 'gin', label: 'ג\'ין' },
  ];

  return (
    <form onSubmit={handleSubmit} className="add-product-form">
      <h3>הוסף מוצר חדש</h3>
      <div className="form-group">
        <label htmlFor="productName">שם:</label>
        <input id="productName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="productDescription">תיאור:</label>
        <input id="productDescription" type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      <div className="form-group">
        <label>סוג אלכוהול:</label>
        <div className="radio-group-container">
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

      <div className="form-group">
        <label htmlFor="productCountry">מדינת ייצור:</label>
        <input id="productCountry" type="text" value={country} onChange={(e) => setCountry(e.target.value)} />
      </div>

      <div className="form-group">
        <label>סוג יין:</label>
        <div className="radio-group-container">
          {wineTypeOptions.map(option => (
            <div key={option.value} className="radio-option">
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

      <div className="form-group">
        <label htmlFor="alcoholPercent">אחוז אלכוהול:</label>
        <input id="alcoholPercent" type="number" value={alcoholPercent} onChange={(e) => setAlcoholPercent(e.target.value)} step="0.1" min="0" max="100" />
      </div>
      
      <div className="form-group">
        <label htmlFor="grapeType">זן ענבים (רק ליין - הוסף עם Enter או פסיק):</label>
        <div className="tag-input-container">
          {grapeTypes.map(grape => (
            <div key={grape} className="tag-item">
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
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="productUrl">קישור למוצר:</label>
        <input id="productUrl" type="url" value={url} onChange={(e) => setUrl(e.target.value)} />
      </div>

      <div className="form-group">
        <label htmlFor="productImage">תמונה:</label>
        <input 
          ref={fileInputRef}
          id="productImage" 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
        />
        {picture && (
          <div className="image-preview">
            <img src={picture} alt="Product preview" style={{maxWidth: '200px', maxHeight: '200px'}} />
            <button type="button" onClick={clearImage} className="clear-image-btn">הסר תמונה</button>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="tags">תגיות (שם הפרויקט, תגיות נוספות - הוסף עם Enter או פסיק):</label>
        <div className="tag-input-container">
          {tags.map(tag => (
            <div key={tag} className="tag-item">
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
          />
        </div>
      </div>

      <div className="form-row-condensed">
        <div className="form-group">
          <label htmlFor="productPrice">מחיר:</label>
          <input id="productPrice" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required step="0.01" />
        </div>
        <div className="checkboxes-container">
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

      <button type="submit" className="submit-button">הוסף מוצר</button>
    </form>
  );
};

export default AddProductForm;