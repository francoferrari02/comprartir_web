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
        const response = await getPantries(params);
        this.items = response.data || [];
        if (response.pagination) {
          this.pagination = { ...this.pagination, ...response.pagination };
        }
      } catch (err) {
        this.error = err.message || 'Error loading pantries';
        console.error('Error fetching pantries:', err);
      } finally {
        this.loading = false;
      }
    },
    async add(pantryData) {
      this.loading = true;
      try {
        const newPantry = await createPantry(pantryData);
        this.items.unshift(newPantry); // Add to the beginning of the list
        this.pagination.totalItems++;
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
                this.pagination.totalItems--;
            }
        } catch (err) {
            this.error = err.message || 'Error deleting pantry';
            console.error('Error deleting pantry:', err);
            throw err;
        }
    }
  },
});

