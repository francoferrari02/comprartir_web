// src/services/pantryItems.js
import { api } from './http'
import { mockPantries, delay } from './mockData'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

/** PANTRY ITEMS **/

// GET /api/pantries/{id}/items?page=&per_page=&sort_by=&order=&search=&category_id=
export async function getPantryItems(id, params = {}) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.getItems(id, params)
    }
    try {
        const { data } = await api.get(`/api/pantries/${id}/items`, { params })
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener los ítems',
            status: error.response?.status
        }
    }
}

// POST /api/pantries/{id}/items  body: { product_id, quantity?, unit?, metadata? }
export async function addPantryItem(id, body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.addItem(id, body)
    }
    try {
        const { data } = await api.post(`/api/pantries/${id}/items`, body)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al añadir el ítem',
            status: error.response?.status
        }
    }
}

// PUT /api/pantries/{id}/items/{item_id} body: { quantity?, unit?, metadata? }
export async function updatePantryItem(id, itemId, body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.updateItem(id, itemId, body)
    }
    try {
        const { data } = await api.put(`/api/pantries/${id}/items/${itemId}`, body)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al actualizar el ítem',
            status: error.response?.status
        }
    }
}

// DELETE /api/pantries/{id}/items/{item_id}
export async function deletePantryItem(id, itemId) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.deleteItem(id, itemId)
    }
    try {
        const { data } = await api.delete(`/api/pantries/${id}/items/${itemId}`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al eliminar el ítem',
            status: error.response?.status
        }
    }
}
