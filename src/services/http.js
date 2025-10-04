// src/services/http.js
import axios from 'axios'

// Usa la URL del .env (o localhost:8080 si no existe)
const BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

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
        // Log detallado para debugging
        console.error('API error:', {
            url: err?.config?.url, 
            method: err?.config?.method,
            code: err?.code, 
            status: err?.response?.status,
            data: err?.response?.data, 
            message: err?.message,
        })
        
        // Manejo específico de errores de conexión
        if (err?.code === 'ERR_NETWORK' || err?.code === 'ECONNREFUSED' || !err?.response) {
            err.message = `No se puede conectar al servidor (${BASE_URL}). Verifica que la API esté corriendo.`
            console.error('🔴 API Server not available at:', BASE_URL)
            return Promise.reject(err)
        }
        
        // Manejo específico de códigos de estado según el swagger
        if (err?.response?.status === 401) {
            // Token inválido o expirado
            localStorage.removeItem('auth_token')
            
            // Si no estamos ya en login/register, redirigir
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register') &&
                !window.location.pathname.includes('/reset-password')) {
                window.location.href = '/login'
            }
        }
        
        // Mejorar el mensaje de error basado en el swagger
        if (err?.response?.data) {
            const errorData = err.response.data
            
            // Si el servidor devuelve un mensaje específico, usarlo
            if (errorData.message) {
                err.message = errorData.message
            }
            
            // Agregar contexto según el código de estado
            switch (err.response.status) {
                case 400:
                    if (!errorData.message) {
                        err.message = 'Solicitud inválida'
                    }
                    break
                case 404:
                    if (!errorData.message) {
                        err.message = 'Recurso no encontrado'
                    }
                    break
                case 500:
                    if (!errorData.message) {
                        err.message = 'Error interno del servidor'
                    }
                    break
            }
        }
        
        return Promise.reject(err)
    }
)
