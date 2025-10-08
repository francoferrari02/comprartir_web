// src/services/categories.js
import { api } from './http'

// GET /categories?name=&page=&per_page=&order=&sort_by=
export async function getCategories(params = {}) {
    const { data } = await api.get('/categories', { params })
    return data
}

// POST /categories  body: { name, metadata? }
export async function createCategory(body) {
    const { data } = await api.post('/categories', body)
    return data
}

// GET /categories/{categoryId}
export async function getCategoryById(id) {
    const { data } = await api.get(`/categories/${id}`)
    return data
}

// PUT /categories/{id} body: { name?, metadata? }
export async function updateCategory(id, body) {
    const { data } = await api.put(`/categories/${id}`, body)
    return data
}

// DELETE /categories/{id}
export async function deleteCategory(id) {
    const { data } = await api.delete(`/categories/${id}`)
    return data
}
