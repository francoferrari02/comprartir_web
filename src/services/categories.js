// src/services/categories.js
import { api } from './http'
import { normalizePaginatedResponse, unwrapEntityResponse } from './pagination'
import { CATEGORY_BY_KEY } from '@/constants/categories'

// GET /categories?name=&page=&per_page=&order=&sort_by=
export async function getCategories(params = {}) {
    const { data } = await api.get('/categories', { params })
    return normalizePaginatedResponse(data, {
        page: params.page,
        per_page: params.per_page,
    })
}

// POST /categories  body: { name, metadata? }
export async function createCategory(body) {
    const { data } = await api.post('/categories', body)
    return unwrapEntityResponse(data)
}

// GET /categories/{categoryId}
export async function getCategoryById(id) {
    const { data } = await api.get(`/categories/${id}`)
    return unwrapEntityResponse(data)
}

// PUT /categories/{id} body: { name?, metadata? }
export async function updateCategory(id, body) {
    const { data } = await api.put(`/categories/${id}`, body)
    return unwrapEntityResponse(data)
}

// DELETE /categories/{id}
export async function deleteCategory(id) {
    const { data } = await api.delete(`/categories/${id}`)
    return unwrapEntityResponse(data)
}

export async function ensureCategoryByKey(key) {
    const definition = CATEGORY_BY_KEY[key]
    if (!definition) {
        throw new Error(`Categoría desconocida: ${key}`)
    }

    const response = await getCategories({ name: definition.name, page: 1, per_page: 1 })
    const list = Array.isArray(response) ? response : response?.data ?? []
    const existing = list.find(cat => cat.name.toLowerCase() === definition.name.toLowerCase())
    if (existing) {
        return existing
    }

    return await createCategory({
        name: definition.name,
        metadata: {
            key: definition.key,
            icon: definition.icon,
        },
    })
}
