// src/services/auth.js
import { api } from './http'

// Guarda / lee token
export function setAuthToken(token) {
    if (token) localStorage.setItem('auth_token', token)
    else localStorage.removeItem('auth_token')
}
export function getAuthToken() {
    return localStorage.getItem('auth_token')
}
export function isLoggedIn() {
    return !!getAuthToken()
}

// POST /api/users/login  -> { token }
export async function login({ email, password }) {
    const { data } = await api.post('/api/users/login', { email, password })
    // data: { token: '...' }
    setAuthToken(data.token)
    return data
}

// POST /api/users/register
export async function register({ name, surname, email, password, metadata = {} }) {
    const { data } = await api.post('/api/users/register', { name, surname, email, password, metadata })
    return data
}

// GET /api/users/profile
export async function getProfile() {
    const { data } = await api.get('/api/users/profile')
    return data
}

// PUT /api/users/profile
export async function updateProfile(payload) {
    const { data } = await api.put('/api/users/profile', payload)
    return data
}

// POST /api/users/logout (opcional payload vacío)
export async function logout() {
    try { await api.post('/api/users/logout', {}) } catch {}
    setAuthToken('')
}

// POST /api/users/forgot-password
export async function sendPasswordRecoveryCode(email) {
    const { data } = await api.post('/api/users/forgot-password', null, {
        params: { email }
    })
    return data
}

// POST /api/users/reset-password
export async function resetPassword({ code, password }) {
    const { data } = await api.post('/api/users/reset-password', { code, password })
    return data
}

// POST /api/users/verify-account
export async function verifyAccount(code) {
    const { data } = await api.post('/api/users/verify-account', { code })
    return data
}

// POST /api/users/send-verification
export async function sendVerificationCode(email) {
    const { data } = await api.post('/api/users/send-verification', null, {
        params: { email }
    })
    return data
}

// POST /api/users/change-password
export async function changePassword({ currentPassword, newPassword }) {
    const { data } = await api.post('/api/users/change-password', { 
        currentPassword, 
        newPassword 
    })
    return data
}
