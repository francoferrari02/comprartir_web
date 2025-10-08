import { api } from './http'
// GET /products?name=&category_id=&pantry_id=&page=&per_page=&sort_by=&order=
export async function getProducts(params = {}) {
    const { data } = await api.get('/products', { params })
    return data
}

// POST /products  body: { name, category_id, pantry_id?, metadata? }
export async function createProduct(body) {
    const { data } = await api.post('/products', body)
    return data
}

// GET /products/{id}
export async function getProductById(id) {
    const { data } = await api.get(`/products/${id}`)
    return data
}

// PUT /products/{id} body: { name?, category_id?, pantry_id?, metadata? }
export async function updateProduct(id, body) {
    const { data } = await api.put(`/products/${id}`, body)
    return data
}

// DELETE /products/{id}
export async function deleteProduct(id) {
    const { data } = await api.delete(`/products/${id}`)
    return data
}