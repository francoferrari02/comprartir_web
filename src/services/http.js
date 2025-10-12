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
    (error) => {
        // Network or CORS blocked: no response object
        if (!error.response) {
            console.error('🔴 Network/CORS error calling API:', error?.message || error);
            const err = new Error('Network/CORS error: API inaccesible desde el navegador');
            err.isNetworkError = true;
            return Promise.reject(err);
        }

        // Have a response: map server message/status and propagate cleanly
        const { status, data } = error.response;
        const serverMsg = data?.message || data?.error || 'Request failed';
        const err = new Error(serverMsg);
        err.status = status;
        err.data = data;

        // 401 → token inválido/expirado
        if (status === 401) {
            setAuthToken(null); // limpia storage y header

            // Evitar loop si ya estás en auth screens
            const p = window.location.pathname;
            if (!p.includes('/login') && !p.includes('/register') && !p.includes('/reset-password') && !p.includes('/verify') && !p.includes('/forgot-password')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(err);
    }
);

export { api };
export default api;
