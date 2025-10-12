// src/services/purchases.js
import { api } from './http'
import { normalizePaginatedResponse, unwrapEntityResponse } from './pagination'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

/**
 * GET /purchases
 * @param {Object} params - Query parameters
 * @param {number} params.list_id - Filter by shopping list ID (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.per_page - Results per page (default: 10)
 * @param {string} params.sort_by - Sort field: createdAt, list, id (default: createdAt)
 * @param {string} params.order - Sort order: ASC, DESC (default: DESC)
 * @returns {Promise<Array>} List of purchases
 */
export async function getPurchases(params = {}) {
    if (USE_MOCKS) {
        // TODO: implement mock if needed
        return normalizePaginatedResponse([], {
            page: params.page,
            per_page: params.per_page,
        })
    }
    try {
        const { data } = await api.get('/purchases', { params })
        return normalizePaginatedResponse(data, {
            page: params.page,
            per_page: params.per_page,
        })
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener el historial de compras',
            status: error.response?.status
        }
    }
}

/**
 * GET /purchases/{id}
 * @param {number} id - Purchase ID
 * @returns {Promise<Object>} Purchase details with items
 */
export async function getPurchaseById(id) {
    if (USE_MOCKS) {
        // TODO: implement mock if needed
        return null
    }
    try {
        const { data } = await api.get(`/purchases/${id}`)
        return unwrapEntityResponse(data)
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener los detalles de la compra',
            status: error.response?.status
        }
    }
}

/**
 * POST /purchases/{id}/restore
 * @param {number} id - Purchase ID to restore as a new shopping list
 * @returns {Promise<Object>} New shopping list created from the purchase
 */
export async function restorePurchase(id) {
    if (USE_MOCKS) {
        // TODO: implement mock if needed
        return null
    }
    try {
        const { data } = await api.post(`/purchases/${id}/restore`)
        return unwrapEntityResponse(data)
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al restaurar la compra',
            status: error.response?.status
        }
    }
}

