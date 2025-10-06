import axios from 'axios'
import { mockApiResponses, delay } from './mockData'

// 🔧 Toggle this to switch between mock and real API
const USE_MOCK_API = true // Set to false when API is ready

// Base API URL - change this to your actual API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
})

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage or your auth store
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      // Handle specific error cases
      switch (status) {
        case 400:
          console.error('Bad Request:', data.message || 'Invalid request')
          break
        case 401:
          console.error('Unauthorized:', data.message || 'Authentication required')
          // Optional: redirect to login
          // window.location.href = '/login'
          break
        case 404:
          console.error('Not Found:', data.message || 'Resource not found')
          break
        case 500:
          console.error('Server Error:', data.message || 'Internal server error')
          break
        default:
          console.error('API Error:', data.message || 'An error occurred')
      }
    } else if (error.request) {
      console.error('Network Error: No response received from server')
    } else {
      console.error('Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// ============================================
// CATEGORIES API ENDPOINTS
// ============================================

export const categoriesApi = {
  /**
   * Get all categories with pagination and filters
   * @param {Object} params - Query parameters
   * @param {string} params.name - Filter by name (optional)
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.per_page - Items per page (default: 10)
   * @param {string} params.order - Sort order: ASC or DESC (default: ASC)
   * @param {string} params.sortBy - Sort field: name, createdAt, updatedAt (default: createdAt)
   * @returns {Promise} Array of categories with pagination info
   */
  async getAll(params = {}) {
    if (USE_MOCK_API) {
      await delay(300) // Simulate network delay
      return { data: mockApiResponses.getAll(params) }
    }
    return apiClient.get('/categories', { params })
  },

  /**
   * Get a specific category by ID
   * @param {number} categoryId - Category ID
   * @returns {Promise} Category object
   */
  async getById(categoryId) {
    if (USE_MOCK_API) {
      await delay(300)
      return { data: mockApiResponses.getById(categoryId) }
    }
    return apiClient.get(`/categories/${categoryId}`)
  },

  /**
   * Create a new category
   * @param {Object} data - Category data
   * @param {string} data.name - Category name
   * @param {Object} data.metadata - Additional metadata (optional)
   * @returns {Promise} Created category object
   */
  async create(data) {
    if (USE_MOCK_API) {
      await delay(500)
      return { data: mockApiResponses.create(data) }
    }
    return apiClient.post('/categories', data)
  },

  /**
   * Update an existing category
   * @param {number} id - Category ID
   * @param {Object} data - Updated category data
   * @param {string} data.name - Category name
   * @param {Object} data.metadata - Additional metadata (optional)
   * @returns {Promise} Updated category object
   */
  async update(id, data) {
    if (USE_MOCK_API) {
      await delay(500)
      return { data: mockApiResponses.update(id, data) }
    }
    return apiClient.put(`/categories/${id}`, data)
  },

  /**
   * Delete a category
   * @param {number} id - Category ID
   * @returns {Promise} Deletion confirmation
   */
  async delete(id) {
    if (USE_MOCK_API) {
      await delay(300)
      return { data: mockApiResponses.delete(id) }
    }
    return apiClient.delete(`/categories/${id}`)
  },
}

// Export the axios instance for other API endpoints
export default apiClient
