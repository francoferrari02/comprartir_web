import { api } from './http'
// GET /api/products?name=&category_id=&pantry_id=&page=&per_page=&sort_by=&order=
export async function getProducts(params = {}) {
    const { data } = await api.get('/api/products', { params })
    return data
}

// POST /api/products  body: { name, category_id, pantry_id?, metadata? }
export async function createProduct(body) {
    const { data } = await api.post('/api/products', body)
    return data
}

// GET /api/products/{id}
export async function getProductById(id) {
    const { data } = await api.get(`/api/products/${id}`)
    return data
}

// PUT /api/products/{id} body: { name?, category_id?, pantry_id?, metadata? }
export async function updateProduct(id, body) {
    const { data } = await api.put(`/api/products/${id}`, body)
    return data
}

// DELETE /api/products/{id}
export async function deleteProduct(id) {
    const { data } = await api.delete(`/api/products/${id}`)
    return data
}