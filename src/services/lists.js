// src/services/lists.js
import { api } from './http'
import { mockShoppingLists, delay } from './mockData'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

/** SHOPPING LISTS **/

// GET /shopping-lists?name=&owner=&recurring=&page=&per_page=&sort_by=&order=
export async function getShoppingLists(params = {}) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.getAll(params)
    }
    try {
        const { data } = await api.get('/shopping-lists', { params })
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener las listas',
            status: error.response?.status
        }
    }
}

// POST /shopping-lists  body: { name, description?, recurring?, metadata? }
export async function createShoppingList(body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.create(body)
    }
    try {
        const { data } = await api.post('/shopping-lists', body)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al crear la lista',
            status: error.response?.status
        }
    }
}

// GET /shopping-lists/{id}
export async function getShoppingListById(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.getById(id)
    }
    try {
        const { data } = await api.get(`/shopping-lists/${id}`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener la lista',
            status: error.response?.status
        }
    }
}

// PUT /shopping-lists/{id} body: { name?, description?, recurring?, metadata? }
export async function updateShoppingList(id, body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.update(id, body)
    }
    try {
        const { data } = await api.put(`/shopping-lists/${id}`, body)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al actualizar la lista',
            status: error.response?.status
        }
    }
}

// DELETE /shopping-lists/{id}
export async function deleteShoppingList(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.delete(id)
    }
    try {
        const { data } = await api.delete(`/shopping-lists/${id}`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al eliminar la lista',
            status: error.response?.status
        }
    }
}

// POST /shopping-lists/{id}/purchase  body: { metadata? }
export async function purchaseShoppingList(id, metadata = {}) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.purchase(id, metadata)
    }
    try {
        const { data } = await api.post(`/shopping-lists/${id}/purchase`, { metadata })
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al marcar como comprada',
            status: error.response?.status
        }
    }
}

// POST /shopping-lists/{id}/reset
export async function resetShoppingList(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.reset(id)
    }
    try {
        const { data } = await api.post(`/shopping-lists/${id}/reset`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al resetear la lista',
            status: error.response?.status
        }
    }
}

// POST /shopping-lists/{id}/move-to-pantry
export async function moveToPantry(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.moveToPantry(id)
    }
    try {
        const { data } = await api.post(`/shopping-lists/${id}/move-to-pantry`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al mover a despensa',
            status: error.response?.status
        }
    }
}

// POST /shopping-lists/{id}/share  body: { email }
export async function shareShoppingList(id, email) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.share(id, email)
    }
    try {
        const { data } = await api.post(`/shopping-lists/${id}/share`, { email })
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al compartir la lista',
            status: error.response?.status
        }
    }
}

// GET /shopping-lists/{id}/shared-users
export async function getSharedUsers(id) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.getSharedUsers(id)
    }
    try {
        const { data } = await api.get(`/shopping-lists/${id}/shared-users`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener usuarios compartidos',
            status: error.response?.status
        }
    }
}

// DELETE /shopping-lists/{id}/shared-users/{userId}
export async function revokeShareShoppingList(id, userId) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.revokeShare(id, userId)
    }
    try {
        const { data } = await api.delete(`/shopping-lists/${id}/shared-users/${userId}`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al revocar acceso',
            status: error.response?.status
        }
    }
}

/** LIST ITEMS **/

// GET /shopping-lists/{id}/items?purchased=&page=&per_page=&sort_by=&order=&pantry_id=&category_id=&search=
export async function getListItems(listId, params = {}) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.getItems(listId, params)
    }
    try {
        const { data } = await api.get(`/shopping-lists/${listId}/items`, { params })
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al obtener los ítems',
            status: error.response?.status
        }
    }
}

// POST /shopping-lists/{id}/items  body: { product_id, quantity, unit, metadata? }
export async function addListItem(listId, body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.addItem(listId, body)
    }
    try {
        const { data } = await api.post(`/shopping-lists/${listId}/items`, body)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al añadir el ítem',
            status: error.response?.status
        }
    }
}

// PUT /shopping-lists/{id}/items/{item_id} body: { quantity?, unit?, metadata? }
export async function updateListItem(listId, itemId, body) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.updateItem(listId, itemId, body)
    }
    try {
        const { data } = await api.put(`/shopping-lists/${listId}/items/${itemId}`, body)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al actualizar el ítem',
            status: error.response?.status
        }
    }
}

// PATCH /shopping-lists/{id}/items/{item_id} body: { purchased? }
export async function toggleItemPurchased(listId, itemId, purchased) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.toggleItemPurchased(listId, itemId, purchased)
    }
    try {
        const { data } = await api.patch(`/shopping-lists/${listId}/items/${itemId}`, { purchased })
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al marcar el ítem',
            status: error.response?.status
        }
    }
}

// DELETE /shopping-lists/{id}/items/{item_id}
export async function deleteListItem(listId, itemId) {
    if (USE_MOCKS) {
        await delay(300)
        return mockShoppingLists.deleteItem(listId, itemId)
    }
    try {
        const { data } = await api.delete(`/shopping-lists/${listId}/items/${itemId}`)
        return data
    } catch (error) {
        throw {
            message: error.response?.data?.message || 'Error al eliminar el ítem',
            status: error.response?.status
        }
    }
}
