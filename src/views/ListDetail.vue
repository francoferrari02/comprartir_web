<template>
  <v-container fluid class="py-8 bg-surface">
    <div class="shell">
      <v-row v-if="!error">
        <!-- Columna izquierda: Detalle de la lista -->
        <v-col cols="12" md="8" class="left-col">
          <ListDetailCard
            :list="list"
            :products="visibleProducts"
            :show-completed="showCompleted"
            @toggle-completed="showCompleted = !showCompleted"
            @update-list-name="updateListName"
            @toggle-product="toggleProduct"
            @delete-product="deleteProduct"
            @show-details="showProductDetails"
            @reset-list="resetList"
            @print-list="printList"
          />
        </v-col>
        <!-- Columna derecha: Añadir items y compartir -->
        <v-col cols="12" md="4" class="right-col">
          <AddItemCard
            :suggestions="itemSuggestions"
            :recommended="recommendedItems"
            v-model="addItemQuery"
            @add-item="addProduct"
          />
          <ShareListCard class="mt-4" />
        </v-col>
      </v-row>
      <div v-else class="text-center py-16">
        <h2 class="text-h5 mb-4">Lista no encontrada</h2>
        <v-btn color="primary" @click="router.push('/lists')">Volver a Listas</v-btn>
      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ListDetailCard from '@/components/ListDetailCard.vue'
import AddItemCard from '@/components/AddItemCard.vue'
import ShareListCard from '@/components/ShareListCard.vue'

// Datos simulados globales (igual que en Lists.vue)
const mockLists = [
  {
    id: 1,
    name: 'Supermercado - Semana',
    description: 'Compras para toda la semana',
    bought: 3,
    total: 8,
    lastModified: '2024-01-15',
    tags: ['supermercado', 'semanal'],
    sharedWith: ['Sofía', 'Juan'],
    progress: 37.5,
    products: [
      { id: 1, name: 'Leche', done: true },
      { id: 2, name: 'Pan', done: false },
      { id: 3, name: 'Huevos', done: false },
      { id: 4, name: 'Queso', done: false },
      { id: 5, name: 'Arroz', done: false },
      { id: 6, name: 'Fideos', done: false },
      { id: 7, name: 'Tomate', done: true },
      { id: 8, name: 'Aceite', done: false },
    ]
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
    progress: 40,
    products: [
      { id: 1, name: 'Tomates', done: true },
      { id: 2, name: 'Lechuga', done: false },
      { id: 3, name: 'Zanahoria', done: false },
      { id: 4, name: 'Cebolla', done: false },
      { id: 5, name: 'Papa', done: true },
    ]
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
    progress: 33.3,
    products: [
      { id: 1, name: 'Ibuprofeno', done: true },
      { id: 2, name: 'Algodón', done: false },
      { id: 3, name: 'Alcohol', done: false },
    ]
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
    progress: 57.1,
    products: [
      { id: 1, name: 'Globos', done: true },
      { id: 2, name: 'Torta', done: false },
      { id: 3, name: 'Velas', done: false },
      { id: 4, name: 'Bebidas', done: true },
      { id: 5, name: 'Snacks', done: true },
      { id: 6, name: 'Piñata', done: false },
      { id: 7, name: 'Decoración', done: false },
    ]
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
    progress: 0,
    products: [
      { id: 1, name: 'Martillo', done: false },
      { id: 2, name: 'Clavos', done: false },
      { id: 3, name: 'Destornillador', done: false },
      { id: 4, name: 'Cinta aisladora', done: false },
    ]
  }
]

const route = useRoute()
const router = useRouter()
const showCompleted = ref(true)
const error = ref(false)

// Buscar la lista por id de la ruta
const list = ref(null)
const products = ref([])

function loadList() {
  const id = Number(route.params.id)
  const found = mockLists.find(l => l.id === id)
  if (found) {
    list.value = { ...found, done: found.products.filter(p => p.done).length }
    products.value = found.products.map(p => ({ ...p }))
    error.value = false
  } else {
    list.value = null
    products.value = []
    error.value = true
  }
}

loadList()

// Si cambia el id de la ruta, recargar
watch(() => route.params.id, loadList)

// Computed para productos visibles
const visibleProducts = computed(() => {
  const incompletos = products.value.filter(p => !p.done)
  const completos = products.value.filter(p => p.done)
  return showCompleted.value
    ? [...incompletos, ...completos]
    : incompletos
})

// Sugerencias y recomendaciones para añadir productos
const addItemQuery = ref('')
const allSuggestions = ['Tomate', 'Lechuga', 'Zanahoria', 'Cebolla', 'Papa', 'Banana', 'Manzana', 'Pera', 'Espinaca', 'Acelga']
const itemSuggestions = computed(() => {
  if (!addItemQuery.value) return []
  return allSuggestions.filter(s => s.toLowerCase().includes(addItemQuery.value.toLowerCase()) && !products.value.some(p => p.name.toLowerCase() === s.toLowerCase()))
})
const recommendedItems = computed(() => {
  if (!list.value) return []
  if (list.value.name && list.value.name.toLowerCase().includes('verduler')) {
    return ['Tomate', 'Lechuga', 'Zanahoria', 'Cebolla', 'Papa', 'Banana'].filter(s => !products.value.some(p => p.name.toLowerCase() === s.toLowerCase()))
  }
  return allSuggestions.filter(s => !products.value.some(p => p.name.toLowerCase() === s.toLowerCase())).slice(0, 6)
})

function updateListName(newName) {
  if (list.value) list.value.name = newName
}
function toggleProduct(id) {
  const p = products.value.find(p => p.id === id)
  if (p) p.done = !p.done
  if (list.value) list.value.done = products.value.filter(p => p.done).length
}
function deleteProduct(id) {
  const idx = products.value.findIndex(p => p.id === id)
  if (idx !== -1) products.value.splice(idx, 1)
  if (list.value) {
    list.value.total = products.value.length
    list.value.done = products.value.filter(p => p.done).length
  }
}
function addProduct(name) {
  if (!name.trim()) return
  products.value.push({ id: Date.now(), name, done: false })
  if (list.value) list.value.total = products.value.length
  addItemQuery.value = ''
}
function showProductDetails(id) {
  alert('Detalles del producto: ' + id)
}
function resetList() {
  products.value.forEach(p => p.done = false)
  if (list.value) list.value.done = 0
}
function printList() {
  window.print()
}
</script>

<style scoped>
.shell { max-width: 1200px; margin: 0 auto; padding: 0 16px; }
.left-col { min-width: 0; padding-right: 24px; }
.right-col { min-width: 280px; }
@media (min-width: 960px) {
  .right-col { position: sticky; top: 88px; }
}
</style>
