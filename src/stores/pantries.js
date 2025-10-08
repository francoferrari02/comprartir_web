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
        console.log('🏪 Store.fetch - Llamando getPantries con params:', params)
        const response = await getPantries(params);
        console.log('🏪 Store.fetch - Respuesta RAW del backend:', response)

        // El servicio ya extrae "data" de axios, así que response ES el objeto con data y pagination
        // Backend devuelve: { data: [...], pagination: {...} }
        // Servicio hace: const { data } = await api.get() y retorna data
        // Por lo tanto response ya tiene la estructura completa

        // Verificar si response es un array directamente o tiene propiedades data/pagination
        if (Array.isArray(response)) {
          // Si response es un array directo
          this.items = response;
          console.log('🏪 Store.fetch - Response es array directo, items asignados:', this.items.length)
        } else if (response.data) {
          // Si response tiene propiedad data
          this.items = response.data;
          console.log('🏪 Store.fetch - items asignados desde response.data:', this.items.length)
        } else if (response.pantries) {
          // Si response tiene propiedad pantries
          this.items = response.pantries;
          console.log('🏪 Store.fetch - items asignados desde response.pantries:', this.items.length)
        } else {
          // Fallback: asumir que response ES el array o tiene items
          this.items = response.items || response || [];
          console.log('🏪 Store.fetch - items asignados con fallback:', this.items.length)
        }

        console.log('🏪 Store.fetch - items finales:', this.items)
        console.log('🏪 Store.fetch - items.length:', this.items.length)

        // Actualizar paginación si existe
        if (response.pagination) {
          this.pagination = { ...this.pagination, ...response.pagination };
          console.log('🏪 Store.fetch - pagination actualizada:', this.pagination)
        } else if (response.total !== undefined) {
          // Si no hay objeto pagination pero hay total
          this.pagination.totalItems = response.total;
          this.pagination.totalPages = Math.ceil(response.total / this.pagination.perPage);
          console.log('🏪 Store.fetch - pagination calculada desde total:', this.pagination)
        } else {
          // Sin info de paginación, usar el length del array
          this.pagination.totalItems = this.items.length;
          this.pagination.totalPages = 1;
          console.log('🏪 Store.fetch - pagination desde array length:', this.pagination)
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
