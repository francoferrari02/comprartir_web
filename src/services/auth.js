// src/services/auth.js
import { api } from './http'

// Guarda / lee token - USAR MISMO NOMBRE QUE http.js (accessToken)
export function setAuthToken(token) {
    if (token) localStorage.setItem('accessToken', token)
    else localStorage.removeItem('accessToken')
}
export function getAuthToken() {
    return localStorage.getItem('accessToken')
}
export function isLoggedIn() {
    return !!getAuthToken()
}

// POST /users/login  -> { token }
export async function login({ email, password }) {
    const { data } = await api.post('/users/login', { email, password })
    // data: { token: '...' }
    setAuthToken(data.token)
    return data
}

// POST /users/register
export async function register({ name, surname, email, password, metadata = {} }) {
    const { data } = await api.post('/users/register', { name, surname, email, password, metadata })
    return data
}

// GET /users/profile
export async function getProfile() {
    const { data } = await api.get('/users/profile')
    return data
}

// PUT /users/profile
export async function updateProfile(payload) {
    const { data } = await api.put('/users/profile', payload)
    return data
}

// POST /users/logout (opcional payload vacío)
export async function logout() {
    try { await api.post('/users/logout', {}) } catch {}
    setAuthToken('')
}

// POST /users/forgot-password
export async function sendPasswordRecoveryCode(email) {
    const { data } = await api.post('/users/forgot-password', null, {
        params: { email }
    })
    return data
}

// POST /users/reset-password
export async function resetPassword({ code, password }) {
    const { data } = await api.post('/users/reset-password', { code, password })
    return data
}

// POST /users/verify-account
export async function verifyAccount(code) {
    const { data } = await api.post('/users/verify-account', { code })
    return data
}

// POST /users/send-verification
export async function sendVerificationCode(email) {
    const { data } = await api.post('/users/send-verification', null, {
        params: { email }
    })
    return data
}

// POST /users/change-password
export async function changePassword({ currentPassword, newPassword }) {
    const { data } = await api.post('/users/change-password', {
        currentPassword,
        newPassword 
    })
    return data
}
