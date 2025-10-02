// src/services/pantries.js
import { api } from './http'

// GET /api/pantries?owner=&page=&per_page=&sort_by=&order=
export async function getPantries(params = {}) {
    const { data } = await api.get('/api/pantries', { params })
    return data
}

// POST /api/pantries  body: { name, metadata? }
export async function createPantry(body) {
    const { data } = await api.post('/api/pantries', body)
    return data
}

// GET /api/pantries/{id}
export async function getPantryById(id) {
    const { data } = await api.get(`/api/pantries/${id}`)
    return data
}

// PUT /api/pantries/{id} body: { name?, metadata? }
export async function updatePantry(id, body) {
    const { data } = await api.put(`/api/pantries/${id}`, body)
    return data
}

// DELETE /api/pantries/{id}
export async function deletePantry(id) {
    const { data } = await api.delete(`/api/pantries/${id}`)
    return data
}

// POST /api/pantries/{id}/share  body: { email }
export async function sharePantry(id, email) {
    const { data } = await api.post(`/api/pantries/${id}/share`, { email })
    return data
}

// GET /api/pantries/{id}/shared-users
export async function getPantrySharedUsers(id) {
    const { data } = await api.get(`/api/pantries/${id}/shared-users`)
    return data
}

// DELETE /api/pantries/{id}/share/{user_id}
export async function revokePantryShare(id, userId) {
    const { data } = await api.delete(`/api/pantries/${id}/share/${userId}`)
    return data
}
