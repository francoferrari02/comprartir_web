// src/services/pantries.js
import { api } from './http'
import { mockPantries, delay } from './mockData'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

/** PANTRIES **/

// GET /api/pantries?owner=&page=&per_page=&sort_by=&order=
export async function getPantries(params = {}) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.getAll(params)
    }
    try {
        const { data } = await api.get('/api/pantries', { params })
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener las despensas',
            status: error.response?.status
        }
    }
}

// POST /api/pantries  body: { name, metadata? }
export async function createPantry(body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.create(body)
    }
    try {
        const { data } = await api.post('/api/pantries', body)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al crear la despensa',
            status: error.response?.status
        }
    }
}

// GET /api/pantries/{id}
export async function getPantryById(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.getById(id)
    }
    try {
        const { data } = await api.get(`/api/pantries/${id}`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener la despensa',
            status: error.response?.status
        }
    }
}

// PUT /api/pantries/{id} body: { name?, metadata? }
export async function updatePantry(id, body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.update(id, body)
    }
    try {
        const { data } = await api.put(`/api/pantries/${id}`, body)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al actualizar la despensa',
            status: error.response?.status
        }
    }
}

// DELETE /api/pantries/{id}
export async function deletePantry(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.delete(id)
    }
    try {
        const { data } = await api.delete(`/api/pantries/${id}`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al eliminar la despensa',
            status: error.response?.status
        }
    }
}

/** SHARING **/

// POST /api/pantries/{id}/share  body: { email }
export async function sharePantry(id, email) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.share(id, email)
    }
    try {
        const { data } = await api.post(`/api/pantries/${id}/share`, { email })
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al compartir la despensa',
            status: error.response?.status
        }
    }
}

// GET /api/pantries/{id}/shared-users
export async function getPantrySharedUsers(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.getSharedUsers(id)
    }
    try {
        const { data } = await api.get(`/api/pantries/${id}/shared-users`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener usuarios compartidos',
            status: error.response?.status
        }
    }
}

// DELETE /api/pantries/{id}/share/{user_id}
export async function revokePantryShare(id, userId) {
    if (USE_MOCKS) {
        await delay(300)
        return mockPantries.revokeShare(id, userId)
    }
    try {
        const { data } = await api.delete(`/api/pantries/${id}/share/${userId}`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al revocar acceso',
            status: error.response?.status
        }
    }
}

