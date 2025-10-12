// src/services/pantries.js
import { api } from './http'
import { mockPantries, delay } from './mockData'
import { normalizePaginatedResponse, unwrapEntityResponse } from './pagination'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

/** PANTRIES **/

// GET /pantries?owner=&page=&per_page=&sort_by=&order=
export async function getPantries(params = {}) {
    if (USE_MOCKS) {
        await delay(300)
        return normalizePaginatedResponse(mockPantries.getAll(params), {
            page: params.page,
            per_page: params.per_page,
        })
    }
    try {
        const { data } = await api.get('/pantries', { params })
        return normalizePaginatedResponse(data, {
            page: params.page,
            per_page: params.per_page,
        })
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener las despensas',
            status: error.response?.status
        }
    }
}

// POST /pantries  body: { name, metadata? }
export async function createPantry(body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.create(body)
    }
    try {
        const { data } = await api.post('/pantries', body)
        return unwrapEntityResponse(data)
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al crear la despensa',
            status: error.response?.status
        }
    }
}

// GET /pantries/{id}
export async function getPantryById(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.getById(id)
    }
    try {
        const { data } = await api.get(`/pantries/${id}`)
        return unwrapEntityResponse(data)
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener la despensa',
            status: error.response?.status
        }
    }
}

// PUT /pantries/{id} body: { name?, metadata? }
export async function updatePantry(id, body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.update(id, body)
    }
    try {
        const { data } = await api.put(`/pantries/${id}`, body)
        return unwrapEntityResponse(data)
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al actualizar la despensa',
            status: error.response?.status
        }
    }
}

// DELETE /pantries/{id}
export async function deletePantry(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.delete(id)
    }
    try {
        const { data } = await api.delete(`/pantries/${id}`)
        return unwrapEntityResponse(data)
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al eliminar la despensa',
            status: error.response?.status
        }
    }
}

/** SHARING **/

// POST /pantries/{id}/share  body: { email }
export async function sharePantry(id, email) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.share(id, email)
    }
    try {
        const { data } = await api.post(`/pantries/${id}/share`, { email })
        return unwrapEntityResponse(data)
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al compartir la despensa',
            status: error.response?.status
        }
    }
}

// GET /pantries/{id}/shared-users
export async function getPantrySharedUsers(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.getSharedUsers(id)
    }
    try {
        const { data } = await api.get(`/pantries/${id}/shared-users`)
        return unwrapEntityResponse(data)
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener usuarios compartidos',
            status: error.response?.status
        }
    }
}

// DELETE /pantries/{id}/share/{user_id}
export async function revokePantryShare(id, userId) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.revokeShare(id, userId)
    }
    try {
        const { data } = await api.delete(`/pantries/${id}/share/${userId}`)
        return unwrapEntityResponse(data)
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al revocar acceso',
            status: error.response?.status
        }
    }
}
