<template>
  <v-container fluid class="py-8 bg-surface">
    <div class="shell">
      <v-row>
        <!-- COLUMNA IZQUIERDA (principal) -->
        <v-col cols="12" md="8" class="left-col">
          <!-- Tarjeta unificada con buscador y carrousel -->
          <v-card class="card card--hover mb-4">
            <!-- Buscador y nueva lista -->
            <ListSearch 
              v-model="searchQuery" 
              @new-list="onNewList" 
              class="search-section"
            />

            <!-- Carrousel de listas -->
            <ListCarousel 
              :lists="filteredLists" 
              class="carousel-section"
            />
          </v-card>
        </v-col>

        <!-- COLUMNA DERECHA (sidebar) -->
        <v-col cols="12" md="4" class="right-col">
          <!-- Filtros y orden -->
          <FiltersCard 
            v-model:sort-by="sortBy"
            v-model:selected-tags="selectedTags"
            :available-tags="availableTags"
            class="card card--hover mb-4" 
          />

          <!-- Resumen -->
          <SummaryCard 
            :stats="summaryStats"
            class="card card--hover mb-4" 
          />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import ListSearch from '@/components/ListSearch.vue'
import ListCarousel from '@/components/ListCarousel.vue'
import FiltersCard from '@/components/FiltersCard.vue'
import SummaryCard from '@/components/SummaryCard.vue'

// Estado reactivo
const searchQuery = ref('')
const sortBy = ref('recent')
const selectedTags = ref([])

// Datos de ejemplo
const lists = ref([
  {
    id: 1,
    name: 'Supermercado - Semana',
    description: 'Compras para toda la semana',
    bought: 3,
    total: 8,
    lastModified: '2024-01-15',
    tags: ['supermercado', 'semanal'],
    sharedWith: ['Sofía', 'Juan'],
    progress: 37.5
  },
  {
    id: 2,
    name: 'Verdulería',
    description: 'Frutas y verduras frescas',
    bought: 2,
    total: 5,
    lastModified: '2024-01-14',
    tags: ['verdulería', 'fresco'],
    sharedWith: [],
    progress: 40
  },
  {
    id: 3,
    name: 'Farmacia',
    description: 'Medicamentos y productos de higiene',
    bought: 1,
    total: 3,
    lastModified: '2024-01-13',
    tags: ['farmacia', 'salud'],
    sharedWith: ['María'],
    progress: 33.3
  },
  {
    id: 4,
    name: 'Cumple Emma',
    description: 'Decoración y comida para el cumpleaños',
    bought: 4,
    total: 7,
    lastModified: '2024-01-12',
    tags: ['cumpleaños', 'decoración'],
    sharedWith: ['Emma', 'Carlos'],
    progress: 57.1
  },
  {
    id: 5,
    name: 'Ferretería',
    description: 'Herramientas y materiales para el hogar',
    bought: 0,
    total: 4,
    lastModified: '2024-01-11',
    tags: ['ferretería', 'hogar'],
    sharedWith: [],
    progress: 0
  }
])

const availableTags = ref([
  'supermercado', 'semanal', 'verdulería', 'fresco', 
  'farmacia', 'salud', 'cumpleaños', 'decoración', 
  'ferretería', 'hogar', 'trabajo', 'personal'
])

// Computed properties
const filteredLists = computed(() => {
  let filtered = lists.value

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(list => 
      list.name.toLowerCase().includes(query) ||
      list.description.toLowerCase().includes(query) ||
      list.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Filtrar por etiquetas
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter(list => 
      selectedTags.value.some(tag => list.tags.includes(tag))
    )
  }

  // Ordenar
  switch (sortBy.value) {
    case 'recent':
      filtered = [...filtered].sort((a, b) => 
        new Date(b.lastModified) - new Date(a.lastModified)
      )
      break
    case 'complete':
      filtered = [...filtered].sort((a, b) => b.progress - a.progress)
      break
    case 'name':
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'shared':
      filtered = [...filtered].sort((a, b) => b.sharedWith.length - a.sharedWith.length)
      break
  }

  return filtered
})

const summaryStats = computed(() => {
  const totalLists = lists.value.length
  const totalItems = lists.value.reduce((sum, list) => sum + list.total, 0)
  const completedItems = lists.value.reduce((sum, list) => sum + list.bought, 0)
  const pendingItems = totalItems - completedItems
  const sharedLists = lists.value.filter(list => list.sharedWith.length > 0).length
  const completedLists = lists.value.filter(list => list.progress === 100).length

  return {
    totalLists,
    totalItems,
    completedItems,
    pendingItems,
    sharedLists,
    completedLists
  }
})

// Métodos
function onNewList() {
  // Abrir modal o navegar a crear lista
  console.log('Crear nueva lista')
}
</script>

<style scoped>
.shell { 
  max-width: 1200px; 
  margin: 0 auto; 
  padding: 0 16px; 
}

.left-col { 
  min-width: 0; 
  padding-right: 24px; 
}

.right-col { 
  min-width: 280px; 
}

@media (min-width: 960px) {
  .right-col { 
    position: sticky; 
    top: 88px; 
  }
}

.search-section {
  border-bottom: 1px solid var(--border);
  margin-bottom: 0;
}

.carousel-section {
  margin-top: 0;
}
</style>