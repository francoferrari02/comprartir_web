// src/services/lists.js
import { api } from './http'

/** SHOPPING LISTS **/

// GET /api/shopping-lists?name=&owner=&recurring=&page=&per_page=&sort_by=&order=
export async function getLists(params = {}) {
    const { data } = await api.get('/api/shopping-lists', { params })
    return data // array de listas (paginado en backend, según spec)
}

// POST /api/shopping-lists  body: { name, description?, recurring?, metadata? }
export async function createList(body) {
    const { data } = await api.post('/api/shopping-lists', body)
    return data
}

// GET /api/shopping-lists/{id}
export async function getListById(id) {
    const { data } = await api.get(`/api/shopping-lists/${id}`)
    return data
}

// PUT /api/shopping-lists/{id} body: { name?, description?, recurring?, metadata? }
export async function updateList(id, body) {
    const { data } = await api.put(`/api/shopping-lists/${id}`, body)
    return data
}

// DELETE /api/shopping-lists/{id}
export async function deleteList(id) {
    const { data } = await api.delete(`/api/shopping-lists/${id}`)
    return data
}

// POST /api/shopping-lists/{id}/purchase  body: { metadata? }
export async function purchaseList(id, metadata = {}) {
    const { data } = await api.post(`/api/shopping-lists/${id}/purchase`, { metadata })
    return data
}

// POST /api/shopping-lists/{id}/reset
export async function resetList(id) {
    const { data } = await api.post(`/api/shopping-lists/${id}/reset`)
    return data
}

// POST /api/shopping-lists/{id}/move-to-pantry
export async function moveToPantry(id) {
    const { data } = await api.post(`/api/shopping-lists/${id}/move-to-pantry`)
    return data
}

// POST /api/shopping-lists/{id}/share  body: { email }
export async function shareList(id, email) {
    const { data } = await api.post(`/api/shopping-lists/${id}/share`, { email })
    return data
}

// GET /api/shopping-lists/{id}/shared-users
export async function getSharedUsers(id) {
    const { data } = await api.get(`/api/shopping-lists/${id}/shared-users`)
    return data
}

// DELETE /api/shopping-lists/{id}/share/{user_id}
export async function revokeShare(id, userId) {
    const { data } = await api.delete(`/api/shopping-lists/${id}/share/${userId}`)
    return data
}

/** LIST ITEMS **/

// GET /api/shopping-lists/{id}/items?purchased=&page=&per_page=&sort_by=&order=&pantry_id=&category_id=&search=
export async function getListItems(listId, params = {}) {
    const { data } = await api.get(`/api/shopping-lists/${listId}/items`, { params })
    return data
}

// POST /api/shopping-lists/{id}/items  body: { product_id, quantity, unit, metadata? }
export async function addListItem(listId, body) {
    const { data } = await api.post(`/api/shopping-lists/${listId}/items`, body)
    return data
}

// PUT /api/shopping-lists/{id}/items/{item_id} body: { quantity?, unit?, metadata? }
export async function updateListItem(listId, itemId, body) {
    const { data } = await api.put(`/api/shopping-lists/${listId}/items/${itemId}`, body)
    return data
}

// PATCH /api/shopping-lists/{id}/items/{item_id} body: { purchased? }
export async function toggleItemPurchased(listId, itemId, purchased) {
    const { data } = await api.patch(`/api/shopping-lists/${listId}/items/${itemId}`, { purchased })
    return data
}

// DELETE /api/shopping-lists/{id}/items/{item_id}
export async function deleteListItem(listId, itemId) {
    const { data } = await api.delete(`/api/shopping-lists/${listId}/items/${itemId}`)
    return data
}
