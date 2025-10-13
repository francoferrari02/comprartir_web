// src/services/products.service.js
import api from '@/services/http'
import { normalizePaginatedResponse, unwrapEntityResponse } from '@/services/pagination'

// Search or list products
// params: { name?: string, page?: number, per_page?: number }
export const searchProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params })
  return normalizePaginatedResponse(data, {
    page: params.page,
    per_page: params.per_page,
  })
}

/**
 * Get all products with optional filters
 * @param {Object} params - { name?, categoryId?, page?, per_page?, sort_by?, order? }
 */
export const getProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params })
  return normalizePaginatedResponse(data, {
    page: params.page,
    per_page: params.per_page,
  })
}

/**
 * Get a single product by ID
 * @param {string|number} id
 */
export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`)
  return unwrapEntityResponse(data)
}

async function resolveCategoryPayload({ categoryId, categoryKey }) {
  if (categoryId) {
    return { id: Number(categoryId) }
  }

  // categoryKey ya no es soportado - todas las categorías deben tener ID
  if (categoryKey) {
    console.warn('⚠️ categoryKey is deprecated, use categoryId instead')
  }

  return null
}

/**
 * Search for a product by exact name
 * @param {string} name
 * @returns {Promise<Product|null>}
 */
export const getProductByName = async (name) => {
  try {
    const result = await searchProducts({ name, page: 1, per_page: 1 })
    const list = Array.isArray(result) ? result : result.data ?? []
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
 * @param {Object} options - Additional options
 * @param {string} [options.categoryKey] - Category key to ensure when creating
 * @param {number} [options.categoryId] - Existing category id to associate
 * @returns {Promise<Product>} - Product with valid id
 */
export const ensureProduct = async (name, options = {}) => {
  const trimmedName = (name || '').trim()
  if (!trimmedName) {
    throw new Error('Product name is required')
  }

  const { categoryKey, categoryId } = options

  // First, try to find existing product
  const existing = await getProductByName(trimmedName)
  if (existing && existing.id) {
    console.log('✅ ensureProduct - Found existing:', existing)
    // If the existing product has no category and we received one, try to update it
    if (!existing.category && (categoryId || categoryKey)) {
      const categoryPayload = await resolveCategoryPayload({ categoryId, categoryKey })
      if (categoryPayload) {
        try {
          const updated = await updateProduct(existing.id, { category: categoryPayload })
          return updated
        } catch (error) {
          console.warn('⚠️ ensureProduct - Unable to update product category', error)
        }
      }
    }
    return existing
  }

  // Not found, create new product
  console.log('🆕 ensureProduct - Creating new product:', trimmedName)
  const categoryPayload = await resolveCategoryPayload({ categoryId, categoryKey })
  const payload = {
    name: trimmedName,
    ...(categoryPayload ? { category: categoryPayload } : {}),
  }
  const newProduct = await createProduct(payload)
  console.log('✅ ensureProduct - Created:', newProduct)
  return newProduct
}

/**
 * Create a new product (minimal; UI does not handle categories)
 * @param {Object} data - { name: string, metadata?: object }
 * Si la API exige un campo adicional (p.ej. categoryId), enviar null u omitir según esquema.
 */
export const createProduct = async (data) => {
  const response = await api.post('/products', data)
  return unwrapEntityResponse(response.data)
}

export async function updateProduct(id, data) {
  const response = await api.put(`/products/${id}`, data)
  return unwrapEntityResponse(response.data)
}

/**
 * Delete a product
 * @param {string|number} id
 */
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`)
  return unwrapEntityResponse(response.data)
}
