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
  console.log('🔍 ensureProduct - Name:', trimmedName, 'Options:', options)

  // First, try to find existing product
  const existing = await getProductByName(trimmedName)
  if (existing && existing.id) {
    console.log('✅ ensureProduct - Found existing:', existing)
    console.log('🏷️ ensureProduct - Existing category:', existing.category)
    console.log('🏷️ ensureProduct - Requested categoryId:', categoryId)
    
    // If the existing product has no category and we received one, try to update it
    if (!existing.category && (categoryId || categoryKey)) {
      console.log('⚡ ensureProduct - Producto sin categoría, intentando actualizar...')
      const categoryPayload = await resolveCategoryPayload({ categoryId, categoryKey })
      console.log('🏷️ ensureProduct - Category payload:', categoryPayload)
      
      if (categoryPayload) {
        try {
          console.log('🔄 ensureProduct - Llamando updateProduct...')
          const updated = await updateProduct(existing.id, { category: categoryPayload })
          console.log('✅ ensureProduct - Producto actualizado con categoría:', updated)
          return updated
        } catch (error) {
          console.error('❌ ensureProduct - Error al actualizar categoría:', error)
          console.error('❌ ensureProduct - Error stack:', error.stack)
        }
      }
    }
    return existing
  }

  // Not found, create new product
  console.log('🆕 ensureProduct - Creating new product:', trimmedName)
  const categoryPayload = await resolveCategoryPayload({ categoryId, categoryKey })
  console.log('🏷️ ensureProduct - Category payload for new product:', categoryPayload)
  
  const payload = {
    name: trimmedName,
    ...(categoryPayload ? { category: categoryPayload } : {}),
  }
  console.log('📦 ensureProduct - Payload completo:', payload)
  
  const newProduct = await createProduct(payload)
  console.log('✅ ensureProduct - Created:', newProduct)
  console.log('✅ ensureProduct - Created product category:', newProduct.category)
  return newProduct
}

/**
 * Create a new product (minimal; UI does not handle categories)
 * @param {Object} data - { name: string, metadata?: object, category?: { id: number } }
 * Si la API exige un campo adicional (p.ej. categoryId), enviar null u omitir según esquema.
 * 
 * NOTE: La API ya NO devuelve product.category poblado después de crear.
 * Hacemos un GET adicional para obtenerlo completo.
 */
export const createProduct = async (data) => {
  console.log('🔨 createProduct - Enviando al backend:', data)
  const response = await api.post('/products', data)
  const created = unwrapEntityResponse(response.data)
  console.log('📥 createProduct - Respuesta del backend:', created)
  
  // Si el producto fue creado con categoría, recargar para obtenerla poblada
  if (created && created.id && data.category) {
    console.log('🔄 createProduct - Recargando producto para obtener categoría poblada...')
    try {
      const reloaded = await getProduct(created.id)
      console.log('✅ createProduct - Producto recargado:', reloaded)
      console.log('✅ createProduct - Categoría del producto recargado:', reloaded.category)
      return reloaded
    } catch (error) {
      console.error('❌ createProduct - Error al recargar producto:', error)
      return created
    }
  }
  
  return created
}

export async function updateProduct(id, data) {
  console.log('🔧 updateProduct - ID:', id, 'tipo:', typeof id)
  console.log('🔧 updateProduct - Data:', data)
  console.log('🔧 updateProduct - Data.category:', data.category)
  console.log('🔧 updateProduct - Data.category.id:', data.category?.id, 'tipo:', typeof data.category?.id)
  console.log('🔧 updateProduct - Data.name:', data.name, 'tipo:', typeof data.name)
  
  const response = await api.put(`/products/${id}`, data)
  const updated = unwrapEntityResponse(response.data)
  console.log('📥 updateProduct - Respuesta del backend:', updated)
  
  // Si se actualizó la categoría, recargar para obtenerla poblada
  if (updated && updated.id && data.category) {
    console.log('🔄 updateProduct - Recargando producto para obtener categoría poblada...')
    try {
      const reloaded = await getProduct(updated.id)
      console.log('✅ updateProduct - Producto recargado:', reloaded)
      console.log('✅ updateProduct - Categoría del producto recargado:', reloaded.category)
      return reloaded
    } catch (error) {
      console.error('❌ updateProduct - Error al recargar producto:', error)
      return updated
    }
  }
  
  return updated
}

/**
 * Delete a product
 * @param {string|number} id
 */
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`)
  return unwrapEntityResponse(response.data)
}
