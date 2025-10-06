import { defineStore } from 'pinia'
import { categoriesApi } from '@/services/api'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    // Categories list
    categories: [],
    
    // Current category (for detail/edit view)
    currentCategory: null,
    
    // Loading states
    loading: false,
    loadingOne: false,
    creating: false,
    updating: false,
    deleting: false,
    
    // Pagination
    pagination: {
      currentPage: 1,
      perPage: 10,
      totalPages: 1,
      totalItems: 0,
    },
    
    // Filters
    filters: {
      name: '',
      sortBy: 'createdAt', // name, createdAt, updatedAt
      order: 'ASC', // ASC, DESC
    },
    
    // Error handling
    error: null,
  }),

  getters: {
    /**
     * Check if there are any categories
     */
    hasCategories: (state) => state.categories.length > 0,
    
    /**
     * Get total number of pages
     */
    totalPages: (state) => state.pagination.totalPages,
    
    /**
     * Check if we're on the first page
     */
    isFirstPage: (state) => state.pagination.currentPage === 1,
    
    /**
     * Check if we're on the last page
     */
    isLastPage: (state) => state.pagination.currentPage >= state.pagination.totalPages,
    
    /**
     * Get current filter params for API calls
     */
    filterParams: (state) => ({
      name: state.filters.name || undefined,
      page: state.pagination.currentPage,
      per_page: state.pagination.perPage,
      order: state.filters.order,
      sortBy: state.filters.sortBy,
    }),
  },

  actions: {
    /**
     * Fetch all categories with current filters and pagination
     */
    async fetchCategories() {
      this.loading = true
      this.error = null
      
      try {
        const response = await categoriesApi.getAll(this.filterParams)
        
        // Assuming API returns: { data: [...], pagination: {...} }
        // Adjust based on actual API response structure
        if (response.data) {
          this.categories = response.data.data || response.data
          
          // Update pagination info if provided
          if (response.data.pagination) {
            this.pagination.totalPages = response.data.pagination.totalPages || 1
            this.pagination.totalItems = response.data.pagination.totalItems || 0
          } else if (response.headers) {
            // Alternative: extract from headers if API uses X-Total-Count pattern
            this.pagination.totalItems = parseInt(response.headers['x-total-count'] || '0')
            this.pagination.totalPages = Math.ceil(this.pagination.totalItems / this.pagination.perPage)
          }
        }
        
        return this.categories
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch categories'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch a single category by ID
     */
    async fetchCategoryById(id) {
      this.loadingOne = true
      this.error = null
      
      try {
        const response = await categoriesApi.getById(id)
        this.currentCategory = response.data
        return this.currentCategory
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch category'
        throw error
      } finally {
        this.loadingOne = false
      }
    },

    /**
     * Create a new category
     */
    async createCategory(data) {
      this.creating = true
      this.error = null
      
      try {
        const response = await categoriesApi.create(data)
        const newCategory = response.data
        
        // Optimistic update: add to local list
        this.categories.unshift(newCategory)
        this.pagination.totalItems += 1
        
        // Optionally refresh to get updated list
        // await this.fetchCategories()
        
        return newCategory
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create category'
        throw error
      } finally {
        this.creating = false
      }
    },

    /**
     * Update an existing category
     */
    async updateCategory(id, data) {
      this.updating = true
      this.error = null
      
      try {
        const response = await categoriesApi.update(id, data)
        const updatedCategory = response.data
        
        // Optimistic update: replace in local list
        const index = this.categories.findIndex(cat => cat.id === id)
        if (index !== -1) {
          this.categories[index] = updatedCategory
        }
        
        // Update current category if it's the one being edited
        if (this.currentCategory?.id === id) {
          this.currentCategory = updatedCategory
        }
        
        return updatedCategory
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update category'
        throw error
      } finally {
        this.updating = false
      }
    },

    /**
     * Delete a category
     */
    async deleteCategory(id) {
      this.deleting = true
      this.error = null
      
      try {
        await categoriesApi.delete(id)
        
        // Optimistic update: remove from local list
        this.categories = this.categories.filter(cat => cat.id !== id)
        this.pagination.totalItems -= 1
        
        // Clear current category if it was deleted
        if (this.currentCategory?.id === id) {
          this.currentCategory = null
        }
        
        // If page is now empty and not the first page, go back one page
        if (this.categories.length === 0 && this.pagination.currentPage > 1) {
          this.pagination.currentPage -= 1
          await this.fetchCategories()
        }
        
        return true
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete category'
        throw error
      } finally {
        this.deleting = false
      }
    },

    /**
     * Set current page and fetch categories
     */
    async setPage(page) {
      if (page < 1 || page > this.pagination.totalPages) return
      this.pagination.currentPage = page
      await this.fetchCategories()
    },

    /**
     * Go to next page
     */
    async nextPage() {
      if (!this.isLastPage) {
        await this.setPage(this.pagination.currentPage + 1)
      }
    },

    /**
     * Go to previous page
     */
    async previousPage() {
      if (!this.isFirstPage) {
        await this.setPage(this.pagination.currentPage - 1)
      }
    },

    /**
     * Update filters and reset to first page
     */
    async updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.pagination.currentPage = 1
      await this.fetchCategories()
    },

    /**
     * Reset filters to defaults
     */
    async resetFilters() {
      this.filters = {
        name: '',
        sortBy: 'createdAt',
        order: 'ASC',
      }
      this.pagination.currentPage = 1
      await this.fetchCategories()
    },

    /**
     * Clear current category
     */
    clearCurrentCategory() {
      this.currentCategory = null
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    },
  },
})
