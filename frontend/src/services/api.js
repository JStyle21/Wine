const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const api = {
  async getProducts(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value);
      }
    });

    const response = await fetch(`${API_URL}/products?${params}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async createProduct(product) {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create product');
    }
    return response.json();
  },

  async updateProduct(id, product) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update product');
    }
    return response.json();
  },

  async deleteProduct(id) {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  async getSuggestions(query) {
    const response = await fetch(`${API_URL}/products/suggestions?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    return response.json();
  },
};
