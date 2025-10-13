import { defineStore } from 'pinia'
import { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory } from '@/services/categories'

function dedupeCategories(list = []) {
  const map = new Map()

  list.forEach((category) => {
    if (!category || !category.name) return
    const key = category.name.trim().toLowerCase()
    // Prefer the first occurrence to keep pagination order stable
    if (!map.has(key)) {
      map.set(key, category)
    }
  })

  return Array.from(map.values())
}

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
        const { data, pagination } = await getCategories(this.filterParams)

        this.items = dedupeCategories(Array.isArray(data) ? data : [])
        this.categories = this.items

        if (pagination) {
          this.pagination = {
            ...this.pagination,
            ...pagination,
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

        // Add to local list and dedupe to avoid duplicate names
        this.items = dedupeCategories([newCategory, ...this.items])
        this.categories = this.items

        const perPage = this.pagination.perPage || this.pagination.per_page || 10
        const totalItems = this.items.length
        this.pagination.totalItems = totalItems
        this.pagination.total = totalItems
        this.pagination.total_pages = Math.max(1, Math.ceil(totalItems / perPage))
        
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

        // Update in local list and re-dedupe by name
        const index = this.items.findIndex(c => c.id === id)
        if (index > -1) {
          this.items.splice(index, 1, updated)
        } else {
          this.items = [updated, ...this.items]
        }

        this.items = dedupeCategories(this.items)
        this.categories = this.items

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

        // Remove from local list and update counts
        this.items = dedupeCategories(this.items.filter(c => c.id !== id))
        this.categories = this.items

        const perPage = this.pagination.perPage || this.pagination.per_page || 10
        const totalItems = this.items.length
        this.pagination.totalItems = totalItems
        this.pagination.total = totalItems
        this.pagination.total_pages = Math.max(1, Math.ceil(totalItems / perPage))

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

    /**
     * Add multiple categories to the store (útil para categorías extraídas de items)
     * Solo agrega las que no existen ya (por ID)
     */
    addCategories(categories) {
      if (!Array.isArray(categories) || categories.length === 0) return

      const existingIds = new Set(this.items.map(c => c.id))
      const newCategories = categories.filter(c => c && c.id && !existingIds.has(c.id))

      if (newCategories.length > 0) {
        this.items = dedupeCategories([...this.items, ...newCategories])
        this.categories = this.items
        
        // Actualizar contadores de paginación
        const perPage = this.pagination.perPage || this.pagination.per_page || 10
        const totalItems = this.items.length
        this.pagination.totalItems = totalItems
        this.pagination.total = totalItems
        this.pagination.total_pages = Math.max(1, Math.ceil(totalItems / perPage))

        console.log(`✅ Store - Agregadas ${newCategories.length} categorías nuevas`)
      }
    },
  },
})
