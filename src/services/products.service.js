// src/services/products.service.js
import api from './http';

/**
 * Get all products with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.name - Filter by product name (optional)
 * @param {string|number} params.category_id - Filter by category ID (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Items per page (default: 10)
 * @param {string} params.sort_by - Sort field: 'name' | 'createdAt' | 'updatedAt' (default: 'createdAt')
 * @param {string} params.order - Sort order: 'ASC' | 'DESC' (default: 'DESC')
 * @returns {Promise} Products data
 */
export const getProducts = (params = {}) => {
  return api.get('/products', { params }).then(r => r.data);
};

/**
 * Get a single product by ID
 * @param {string|number} id - Product ID
 * @returns {Promise} Product object
 */
export const getProduct = (id) => {
  return api.get(`/products/${id}`).then(r => r.data);
};

/**
 * Create a new product
 * @param {Object} data - Product data
 * @param {string} data.name - Product name (required)
 * @param {string|number} data.category_id - Category ID (required)
 * @param {Object} data.metadata - Additional metadata (optional)
 * @returns {Promise} Created product
 */
export const createProduct = (data) => {
  return api.post('/products', data).then(r => r.data);
};

/**
 * Update an existing product
 * @param {string|number} id - Product ID
 * @param {Object} data - Product data to update
 * @param {string} data.name - Product name (optional)
 * @param {string|number} data.category_id - Category ID (optional)
 * @param {Object} data.metadata - Additional metadata (optional)
 * @returns {Promise} Updated product
 */
export const updateProduct = (id, data) => {
  return api.put(`/products/${id}`, data).then(r => r.data);
};

/**
 * Delete a product
 * @param {string|number} id - Product ID
 * @returns {Promise} Deletion result
 */
export const deleteProduct = (id) => {
  return api.delete(`/products/${id}`).then(r => r.data);
};

