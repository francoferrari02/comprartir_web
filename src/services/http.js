// src/services/http.js
import axios from 'axios';

// Usa solo VITE_API_BASE_URL; fallback a la real con /api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Helper para setear/limpiar token global y storage
export function setAuthToken(token) {
    if (token) {
        localStorage.setItem('accessToken', token);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        localStorage.removeItem('accessToken');
        delete api.defaults.headers.common.Authorization;
    }
}

// Adjunta token si existe
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

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
        });

        // Problemas de red / servidor caído
        if (err?.code === 'ERR_NETWORK' || err?.code === 'ECONNREFUSED' || !err?.response) {
            err.message = `No se puede conectar al servidor (${BASE_URL}). Verifica que la API esté corriendo.`;
            console.error('🔴 API Server not available at:', BASE_URL);
            return Promise.reject(err);
        }

        // 401 → token inválido/expirado
        if (err?.response?.status === 401) {
            setAuthToken(null); // limpia storage y header

            // Evitar loop si ya estás en auth screens
            const p = window.location.pathname;
            if (!p.includes('/login') && !p.includes('/register') && !p.includes('/reset-password') && !p.includes('/verify') && !p.includes('/forgot-password')) {
                window.location.href = '/login';
            }
        }

        // Mensajes de error más claros
        if (err?.response?.data) {
            const { message } = err.response.data || {};
            if (message) err.message = message;

            switch (err.response.status) {
                case 400: if (!message) err.message = 'Solicitud inválida'; break;
                case 404: if (!message) err.message = 'Recurso no encontrado'; break;
                case 500: if (!message) err.message = 'Error interno del servidor'; break;
            }
        }

        return Promise.reject(err);
    }
);

export { api };
export default api;
