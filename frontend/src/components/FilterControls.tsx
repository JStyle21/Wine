import React, { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { GetProductsParams, getSuggestions } from '../services/api';
import './FilterControls.css';

interface FilterControlsProps {
  onFilterChange: (filters: GetProductsParams) => void;
  initialFilters: GetProductsParams;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const isInitialMount = useRef(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length > 1) {
      const result = await getSuggestions(query);
      setSuggestions(result);
    } else {
      setSuggestions([]);
    }
  };

  const debouncedFetchSuggestions = useRef(debounce(fetchSuggestions, 300)).current;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    if (name === 'search') {
      debouncedFetchSuggestions(value);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setFilters(prev => ({ ...prev, search: suggestion }));
    setSuggestions([]);
    if(searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const handler = setTimeout(() => {
      const queryFilters: GetProductsParams = {};
      if (filters.search) queryFilters.name = filters.search;
      if (filters.wineType) queryFilters.wineType = filters.wineType;
      if (filters.fav !== undefined) queryFilters.fav = filters.fav;
      
      onFilterChange(queryFilters);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters, onFilterChange]);

  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [debouncedFetchSuggestions]);

  const handleLikedFilter = (liked: boolean | undefined) => {
    setFilters(prev => ({ ...prev, fav: liked }));
  };

  const handleTypeFilter = (type: string) => {
    setFilters(prev => ({ ...prev, type: type || undefined }));
  };

  return (
    <div className="filter-controls">
      <div className="filter-group-row">
        <div className="filter-group search-group">
          <label htmlFor="nameSearch">חיפוש</label>
          <div className="search-container">
            <input
              ref={searchInputRef}
              id="nameSearch"
              type="text"
              placeholder="הכנס שם מוצר..."
              name="search"
              value={filters.search || ''}
              onChange={handleInputChange}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="filter-group">
          <label htmlFor="wineTypeFilter">סנן לפי סוג יין:</label>
          <select id="wineTypeFilter" name="wineType" value={filters.wineType || ''} onChange={handleInputChange}>
            <option value="">כל הסוגים</option>
            <option value="Red">אדום</option>
            <option value="White">לבן</option>
            <option value="Rosé">רוזה</option>
            <option value="Sparkling">מבעבע</option>
            <option value="Dessert">קינוח</option>
          </select>
        </div>
        <div className="filter-group">
          <label>אהבתי</label>
          <div className="filter-buttons-group">
            <button onClick={() => handleLikedFilter(undefined)} className={filters.fav === undefined ? 'active' : ''}>הכל</button>
            <button onClick={() => handleLikedFilter(true)} className={filters.fav === true ? 'active' : ''}>כן</button>
            <button onClick={() => handleLikedFilter(false)} className={filters.fav === false ? 'active' : ''}>לא</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FilterControls;