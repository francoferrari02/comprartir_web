// src/stores/products.js
import { defineStore } from 'pinia';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '@/services/products.service';

export const useProductsStore = defineStore('products', {
  state: () => ({
    items: [],
    current: null,
    loading: false,
    error: '',
    // table state
    filters: {
      name: '',
      category_id: '',
      page: 1,
      per_page: 10,
      sort_by: 'createdAt',
      order: 'DESC'
    },
    total: 0,
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.total / state.filters.per_page),
  },

  actions: {
    async fetch(params = {}) {
      this.loading = true;
      this.error = '';
      try {
        const { data, pagination } = await getProducts({ ...this.filters, ...params });
        this.items = Array.isArray(data) ? data : [];
        if (pagination) {
          this.total = pagination.total ?? this.items.length;
          this.filters.page = pagination.page ?? this.filters.page;
          this.filters.per_page = pagination.per_page ?? this.filters.per_page;
        } else {
          this.total = this.items.length;
        }
      } catch (e) {
        this.error = e.response?.data?.message || e.message || 'Error al cargar productos';
        console.error('Error fetching products:', e);
      } finally {
        this.loading = false;
      }
    },

    async open(id) {
      this.loading = true;
      this.error = '';
      try {
        this.current = await getProduct(id);
      } catch (e) {
        this.error = e.response?.data?.message || e.message || 'Error al cargar producto';
        console.error('Error fetching product:', e);
      } finally {
        this.loading = false;
      }
    },

    async add(payload) {
      try {
        const created = await createProduct(payload);
        this.items.unshift(created);
        this.total = (this.total ?? 0) + 1;
        return created;
      } catch (e) {
        const error = e.response?.data?.message || e.message || 'Error al crear producto';
        console.error('Error creating product:', e);
        throw new Error(error);
      }
    },

    async patch(id, payload) {
      try {
        const updated = await updateProduct(id, payload);
        const index = this.items.findIndex(p => p.id === id);
        if (index > -1) {
          this.items[index] = updated;
        }
        if (this.current?.id === id) {
          this.current = updated;
        }
        return updated;
      } catch (e) {
        const error = e.response?.data?.message || e.message || 'Error al actualizar producto';
        console.error('Error updating product:', e);
        throw new Error(error);
      }
    },

    async remove(id) {
      try {
        await deleteProduct(id);
        this.items = this.items.filter(p => p.id !== id);
        if (this.current?.id === id) {
          this.current = null;
        }
        this.total = Math.max(0, (this.total ?? 0) - 1);
      } catch (e) {
        const error = e.response?.data?.message || e.message || 'Error al eliminar producto';
        console.error('Error deleting product:', e);
        throw new Error(error);
      }
    },

    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },

    resetFilters() {
      this.filters = {
        name: '',
        category_id: '',
        page: 1,
        per_page: 10,
        sort_by: 'createdAt',
        order: 'DESC'
      };
    }
  }
});

