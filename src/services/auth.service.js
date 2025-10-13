// src/services/auth.service.js
import api, { setAuthToken } from './http'

// Helper: check if user is logged in
export function isLoggedIn() {
    return !!localStorage.getItem('accessToken')
}

// Helper: get current token
export function getAuthToken() {
    return localStorage.getItem('accessToken')
}

// POST /users/register → { name, surname, email, password }
export async function register(data) {
    const response = await api.post('/users/register', data)
    return response.data
}

// POST /users/login → { email, password } returns { token }
export async function login(credentials) {
    const response = await api.post('/users/login', credentials)
    const { token } = response.data
    if (token) {
        setAuthToken(token)
    }
    return response.data
}

// POST /users/send-verification?email=<email>
export async function sendVerification(email) {
    const response = await api.post('/users/send-verification', {}, {
        params: { email }
    })
    return response.data
}

// POST /users/verify-account → { code }
export async function verifyAccount(payload) {
    const response = await api.post('/users/verify-account', payload)
    return response.data
}

// POST /users/forgot-password?email=<email>
export async function forgotPassword(email) {
    const response = await api.post('/users/forgot-password', {}, {
        params: { email }
    })
    return response.data
}

// POST /users/reset-password → { code, password }
export async function resetPassword(payload) {
    const response = await api.post('/users/reset-password', payload)
    return response.data
}

// GET /users/profile (auth required)
export async function getProfile() {
    const response = await api.get('/users/profile')
    return response.data
}

// PUT /users/profile (auth required)
export async function updateProfile(payload) {
    const response = await api.put('/users/profile', payload)
    return response.data
}

// POST /users/change-password (auth required) → { currentPassword, newPassword }
export async function changePassword(payload) {
    const response = await api.post('/users/change-password', payload)
    return response.data
}

// POST /users/logout (auth required)
export async function logout() {
    try {
        await api.post('/users/logout', {})
    } catch (error) {
        console.warn('Logout API call failed (non-critical):', error.message)
    } finally {
        // Always clear client-side token
        setAuthToken(null)
    }
}
