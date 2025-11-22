import React from 'react';
import { Product } from '../interfaces/Product';
import ProductItem from './ProductItem';
import './ProductList.css';

interface ProductListProps {
  products: Product[];
  onEditProduct?: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEditProduct }) => {
  if (products.length === 0) {
    return <p className="no-products-message">לא נמצאו מוצרים.</p>;
  }

  return (
    <ul className="product-list-container">
      {products.map((product) => (
        <ProductItem 
          key={product._id} 
          product={product} 
          onEdit={onEditProduct}
        />
      ))}
    </ul>
  );
};

export default ProductList;