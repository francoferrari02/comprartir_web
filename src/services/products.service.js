// src/services/products.service.js
import api from '@/services/http'

// Search or list products
// params: { name?: string, page?: number, per_page?: number }
export const searchProducts = (params) => api.get('/products', { params }).then(r => r.data)

/**
 * Get all products with optional filters
 * @param {Object} params - { name?, categoryId?, page?, per_page?, sort_by?, order? }
 */
export const getProducts = (params) =>
  api.get('/products', { params }).then(r => r.data)

/**
 * Get a single product by ID
 * @param {string|number} id
 */
export const getProduct = (id) =>
  api.get(`/products/${id}`).then(r => r.data)

/**
 * Search for a product by exact name
 * @param {string} name
 * @returns {Promise<Product|null>}
 */
export const getProductByName = async (name) => {
  try {
    const data = await searchProducts({ name, page: 1, per_page: 1 })
    const list = Array.isArray(data) ? data : (data.data ?? data.items ?? data.results ?? data.products ?? [])
    // Return first exact match (case-insensitive)
    const exactMatch = list.find(p => p.name.toLowerCase() === name.toLowerCase())
    return exactMatch || null
  } catch (e) {
    console.error('getProductByName error', e)
    return null
  }
}

/**
 * Ensure a product exists: search by name, create if not found
 * @param {string} name - Product name
 * @returns {Promise<Product>} - Product with valid id
 */
export const ensureProduct = async (name) => {
  const trimmedName = (name || '').trim()
  if (!trimmedName) {
    throw new Error('Product name is required')
  }

  // First, try to find existing product
  const existing = await getProductByName(trimmedName)
  if (existing && existing.id) {
    console.log('✅ ensureProduct - Found existing:', existing)
    return existing
  }

  // Not found, create new product
  console.log('🆕 ensureProduct - Creating new product:', trimmedName)
  const newProduct = await createProduct({ name: trimmedName })
  console.log('✅ ensureProduct - Created:', newProduct)
  return newProduct
}

/**
 * Create a new product (minimal; UI does not handle categories)
 * @param {Object} data - { name: string, metadata?: object }
 * Si la API exige un campo adicional (p.ej. categoryId), enviar null u omitir según esquema.
 */
export const createProduct = (data) =>
  api.post('/products', data).then(r => r.data)

/**
 * Update a product
 * @param {string|number} id
 * @param {Object} data - { name?, categoryId?, metadata? }
 */
export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data).then(r => r.data)

/**
 * Delete a product
 * @param {string|number} id
 */
export const deleteProduct = (id) =>
  api.delete(`/products/${id}`).then(r => r.data)
