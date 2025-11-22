import axios from 'axios';
import { Product } from '../interfaces/Product';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

export interface GetProductsParams {
  search?: string;
  name?: string;
  description?: string;
  minPrice?: number;
  maxPrice?: number;
  fav?: boolean;
  purchased?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
  limit?: number;
  type?: string;
  country?: string;
  wineType?: string;
  dryness?: string;
  tags?: string;
  year?: number;
}

export interface GetProductsResponse {
  products: Product[];
  totalCount: number;
  totalSpent: number;
  totalLiked: number;
}

export const getProducts = async (params: GetProductsParams = {}): Promise<GetProductsResponse> => {
  try {
    const response = await apiClient.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getSuggestions = async (query: string): Promise<string[]> => {
  const { data } = await apiClient.get('/products/suggestions', { params: { q: query } });
  return data;
};

export const addProduct = async (productData: Omit<Product, '_id' | 'createdAt'>): Promise<Product> => {
  const { data } = await apiClient.post('/products', productData);
  return data;
};

export const updateProduct = async (id: string, productData: Partial<Omit<Product, '_id' | 'createdAt'>>): Promise<Product> => {
  const { data } = await apiClient.put(`/products/${id}`, productData);
  return data;
};