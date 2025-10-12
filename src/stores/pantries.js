import { defineStore } from 'pinia';
import { getPantries, createPantry, updatePantry, deletePantry } from '@/services/pantries';

export const usePantriesStore = defineStore('pantries', {
  state: () => ({
    items: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      perPage: 20,
      totalPages: 1,
      totalItems: 0,
    },
  }),
  actions: {
    async fetch(params) {
      this.loading = true;
      this.error = null;
      try {
        const { data, pagination } = await getPantries(params);
        this.items = Array.isArray(data) ? data : [];
        if (pagination) {
          this.pagination = { ...this.pagination, ...pagination };
        } else {
          this.pagination.totalItems = this.items.length;
          this.pagination.totalPages = 1;
        }
      } catch (err) {
        this.error = err.message || 'Error loading pantries';
        console.error('❌ Store.fetch - Error:', err);
      } finally {
        this.loading = false;
      }
    },
    async add(pantryData) {
      this.loading = true;
      try {
        const newPantry = await createPantry(pantryData);
        this.items.unshift(newPantry); // Add to the beginning of the list
        this.pagination.totalItems = (this.pagination.totalItems ?? 0) + 1;
        this.pagination.total = (this.pagination.total ?? 0) + 1;
        this.pagination.totalPages = Math.max(1, Math.ceil((this.pagination.total ?? 0) / (this.pagination.perPage || this.pagination.per_page || 1)));
        return newPantry;
      } catch (err) {
        this.error = err.message || 'Error creating pantry';
        console.error('Error creating pantry:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async update(id, pantryData) {
        try {
            const updatedPantry = await updatePantry(id, pantryData);
            const index = this.items.findIndex(p => p.id === id);
            if (index !== -1) {
                this.items.splice(index, 1, updatedPantry);
            }
            return updatedPantry;
        } catch (err) {
            this.error = err.message || 'Error updating pantry';
            console.error('Error updating pantry:', err);
            throw err;
        }
    },
    async remove(id) {
        try {
            await deletePantry(id);
            const index = this.items.findIndex(p => p.id === id);
            if (index !== -1) {
                this.items.splice(index, 1);
          const updatedTotal = Math.max(0, (this.pagination.total ?? this.pagination.totalItems ?? this.items.length) - 1);
          this.pagination.totalItems = Math.max(0, (this.pagination.totalItems ?? this.items.length) - 1);
          this.pagination.total = updatedTotal;
          this.pagination.totalPages = Math.max(1, Math.ceil(updatedTotal / (this.pagination.perPage || this.pagination.per_page || 1)));
            }
        } catch (err) {
            this.error = err.message || 'Error deleting pantry';
            console.error('Error deleting pantry:', err);
            throw err;
        }
    }
  },
});
