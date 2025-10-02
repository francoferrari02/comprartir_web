// src/services/http.js
import axios from 'axios'

// Usa la URL del .env (o localhost:8080 si no existe)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
})

// Adjunta token si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    (res) => res,
    (err) => {
        // dejá este log para ver rápidamente el motivo real
        console.error('API error:', {
            url: err?.config?.url, method: err?.config?.method,
            code: err?.code, status: err?.response?.status,
            data: err?.response?.data, message: err?.message,
        })
        if (err?.response?.status === 401) localStorage.removeItem('auth_token')
        return Promise.reject(err)
    }
)
