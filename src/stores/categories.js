import { defineStore } from 'pinia'
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '@/services/categories'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    // Categories list (changed from 'categories' to 'items' for consistency)
    items: [],
    categories: [], // Keep for backward compatibility

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
    hasCategories: (state) => state.items.length > 0,

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
      sort_by: state.filters.sortBy,
    }),
  },

  actions: {
    /**
     * Fetch all categories with current filters and pagination
     */
    async fetch() {
      this.loading = true
      this.error = null
      
      try {
        const response = await getCategories(this.filterParams)

        // Handle different response formats
        if (Array.isArray(response)) {
          this.items = response
          this.categories = response
        } else if (response.data) {
          this.items = response.data
          this.categories = response.data
          if (response.pagination) {
            this.pagination = { ...this.pagination, ...response.pagination }
          }
        } else if (response.items || response.results) {
          this.items = response.items || response.results
          this.categories = this.items
          if (response.total !== undefined) {
            this.pagination.totalItems = response.total
            this.pagination.totalPages = Math.ceil(response.total / this.pagination.perPage)
          }
        }
        
        return this.items
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al cargar categorías'
        console.error('Error fetching categories:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Alias for backward compatibility
    async fetchCategories() {
      return this.fetch()
    },

    /**
     * Fetch a single category by ID
     */
    async fetchCategoryById(id) {
      this.loadingOne = true
      this.error = null
      
      try {
        const response = await getCategoryById(id)
        this.currentCategory = response
        return this.currentCategory
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al cargar categoría'
        console.error('Error fetching category:', error)
        throw error
      } finally {
        this.loadingOne = false
      }
    },

    /**
     * Create a new category
     */
    async create(data) {
      this.creating = true
      this.error = null
      
      try {
        const newCategory = await createCategory(data)

        // Add to local list
        this.items.unshift(newCategory)
        this.categories = this.items
        this.pagination.totalItems += 1
        
        return newCategory
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al crear categoría'
        console.error('Error creating category:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    // Alias for backward compatibility
    async createCategory(data) {
      return this.create(data)
    },

    /**
     * Update an existing category
     */
    async update(id, data) {
      this.updating = true
      this.error = null
      
      try {
        const updated = await updateCategory(id, data)

        // Update in local list
        const index = this.items.findIndex(c => c.id === id)
        if (index > -1) {
          this.items[index] = updated
          this.categories = this.items
        }
        
        if (this.currentCategory?.id === id) {
          this.currentCategory = updated
        }
        
        return updated
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al actualizar categoría'
        console.error('Error updating category:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    // Alias for backward compatibility
    async updateCategory(id, data) {
      return this.update(id, data)
    },

    /**
     * Delete a category
     */
    async remove(id) {
      this.deleting = true
      this.error = null
      
      try {
        await deleteCategory(id)

        // Remove from local list
        this.items = this.items.filter(c => c.id !== id)
        this.categories = this.items
        this.pagination.totalItems = Math.max(0, this.pagination.totalItems - 1)

        if (this.currentCategory?.id === id) {
          this.currentCategory = null
        }
      } catch (error) {
        this.error = error.response?.data?.message || error.message || 'Error al eliminar categoría'
        console.error('Error deleting category:', error)
        throw error
      } finally {
        this.deleting = false
      }
    },

    // Alias for backward compatibility
    async deleteCategory(id) {
      return this.remove(id)
    },

    /**
     * Update filters
     */
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
    },

    /**
     * Reset filters to default
     */
    resetFilters() {
      this.filters = {
        name: '',
        sortBy: 'createdAt',
        order: 'ASC',
      }
      this.pagination.currentPage = 1
    },

    /**
     * Go to specific page
     */
    goToPage(page) {
      this.pagination.currentPage = page
      return this.fetch()
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null
    },
  },
})
