// src/services/categories.js
import { api } from './http'

// GET /api/categories?name=&page=&per_page=&order=&sort_by=
export async function getCategories(params = {}) {
    const { data } = await api.get('/api/categories', { params })
    return data
}

// POST /api/categories  body: { name, metadata? }
export async function createCategory(body) {
    const { data } = await api.post('/api/categories', body)
    return data
}

// GET /api/categories/{categoryId}
export async function getCategoryById(id) {
    const { data } = await api.get(`/api/categories/${id}`)
    return data
}

// PUT /api/categories/{id} body: { name?, metadata? }
export async function updateCategory(id, body) {
    const { data } = await api.put(`/api/categories/${id}`, body)
    return data
}

// DELETE /api/categories/{id}
export async function deleteCategory(id) {
    const { data } = await api.delete(`/api/categories/${id}`)
    return data
}
