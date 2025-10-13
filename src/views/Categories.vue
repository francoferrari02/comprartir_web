<template>
  <v-container fluid class="py-8 bg-surface">
    <div class="view-shell">
      <AppBreadcrumbs :items="breadcrumbs" />

      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-6">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">Categorías</h1>
          <p class="text-body-1 text-medium-emphasis">
            Gestiona tus categorías de productos
          </p>
        </div>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          size="large"
          @click="openCreateDialog"
        >
          Nueva Categoría
        </v-btn>
      </div>

      <!-- Filters Card -->
      <v-card class="mb-6 pa-4" elevation="2">
        <v-row>
          <v-col cols="12" md="4">
            <div class="mb-4">
              <label class="app-input-label" for="categories-filter-name">Buscar por nombre</label>
              <v-text-field
                id="categories-filter-name"
                v-model="localFilters.name"
                prepend-inner-icon="mdi-magnify"
                density="comfortable"
                clearable
                hide-details
                class="app-input"
                @keyup.enter="applyFilters"
              />
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="mb-4">
              <label class="app-input-label" for="categories-filter-sort">Ordenar por</label>
              <v-select
                id="categories-filter-sort"
                v-model="localFilters.sortBy"
                :items="sortByOptions"
                density="comfortable"
                hide-details
                class="app-input"
              />
            </div>
          </v-col>
          <v-col cols="12" md="3">
            <div class="mb-4">
              <label class="app-input-label" for="categories-filter-order">Orden</label>
              <v-select
                id="categories-filter-order"
                v-model="localFilters.order"
                :items="orderOptions"
                density="comfortable"
                hide-details
                class="app-input"
              />
            </div>
          </v-col>
          <v-col cols="12" md="2" class="d-flex align-center ga-2">
            <v-btn
              color="primary"
              variant="flat"
              @click="applyFilters"
              block
            >
              Buscar
            </v-btn>
            <v-btn
              color="secondary"
              variant="outlined"
              icon="mdi-refresh"
              @click="resetFilters"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- Error Alert -->
      <v-alert
        v-if="store.error"
        type="error"
        variant="tonal"
        closable
        class="mb-4"
        @click:close="store.clearError()"
      >
        {{ store.error }}
      </v-alert>

      <!-- Loading State -->
      <div v-if="store.loading" class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
        <p class="text-body-1 mt-4">Cargando categorías...</p>
      </div>

      <!-- Empty State -->
      <v-card v-else-if="!store.hasCategories" class="pa-12 text-center" elevation="1">
        <v-icon size="80" color="grey-lighten-1" class="mb-4">
          mdi-folder-outline
        </v-icon>
        <h3 class="text-h6 mb-2">No hay categorías</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Comienza creando tu primera categoría
        </p>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Crear Categoría
        </v-btn>
      </v-card>

      <!-- Categories Table -->
      <v-card v-else elevation="2">
        <v-table>
          <thead>
            <tr>
              <th class="text-left font-weight-bold">ID</th>
              <th class="text-left font-weight-bold">Nombre</th>
              <th class="text-left font-weight-bold">Fecha de Creación</th>
              <th class="text-left font-weight-bold">Última Actualización</th>
              <th class="text-center font-weight-bold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="category in store.categories"
              :key="category.id"
              class="category-row"
            >
              <td class="text-medium-emphasis">{{ category.id }}</td>
              <td class="font-weight-medium">{{ category.name }}</td>
              <td class="text-medium-emphasis">
                {{ formatDate(category.createdAt) }}
              </td>
              <td class="text-medium-emphasis">
                {{ formatDate(category.updatedAt) }}
              </td>
              <td class="text-center">
                <div class="d-flex justify-center ga-1">
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="primary"
                    @click="viewCategory(category.id)"
                  >
                    <v-icon>mdi-eye</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Ver detalles
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="primary"
                    @click="openEditDialog(category)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Editar
                    </v-tooltip>
                  </v-btn>
                  <v-btn
                    icon
                    size="small"
                    variant="text"
                    color="error"
                    @click="confirmDelete(category)"
                  >
                    <v-icon>mdi-delete</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Eliminar
                    </v-tooltip>
                  </v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Pagination -->
        <v-divider />
        <div class="d-flex justify-space-between align-center pa-4">
          <div class="text-body-2 text-medium-emphasis">
            Mostrando {{ startItem }} - {{ endItem }} de {{ store.pagination.totalItems }} categorías
          </div>
          <v-pagination
            v-model="store.pagination.currentPage"
            :length="store.totalPages"
            :total-visible="7"
            @update:model-value="onPageChange"
          />
        </div>
      </v-card>

      <!-- Create Category Dialog -->
      <CreateCategory
        v-model="createDialog"
        @success="onCategoryCreated"
      />

      <!-- Edit Category Dialog -->
      <EditCategory
        v-model="editDialog"
        :category="selectedCategory"
        @success="onCategoryUpdated"
      />

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h6">
            Confirmar eliminación
          </v-card-title>
          <v-card-text>
            ¿Estás seguro de que deseas eliminar la categoría
            <strong>{{ selectedCategory?.name }}</strong>?
            Esta acción no se puede deshacer.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              variant="text"
              @click="deleteDialog = false"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              :loading="store.deleting"
              @click="deleteCategory"
            >
              Eliminar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Success Snackbar -->
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="3000"
      >
        {{ snackbar.message }}
        <template #actions>
          <v-btn
            icon="mdi-close"
            size="small"
            @click="snackbar.show = false"
          />
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import CreateCategory from '@/components/CreateCategory.vue'
import EditCategory from '@/components/EditCategory.vue'
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'

const router = useRouter()
const store = useCategoriesStore()

const breadcrumbs = computed(() => [
  { title: 'Inicio', to: { name: 'home' } },
  { title: 'Categorías' }
])

// Dialog states
const createDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)
const selectedCategory = ref(null)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Local filters (bound to inputs)
const localFilters = ref({
  name: store.filters.name,
  sortBy: store.filters.sortBy,
  order: store.filters.order,
})

// Filter options
const sortByOptions = [
  { title: 'Nombre', value: 'name' },
  { title: 'Fecha de Creación', value: 'createdAt' },
  { title: 'Última Actualización', value: 'updatedAt' },
]

const orderOptions = [
  { title: 'Ascendente', value: 'ASC' },
  { title: 'Descendente', value: 'DESC' },
]

// Computed
const startItem = computed(() => {
  if (store.categories.length === 0) return 0
  return (store.pagination.currentPage - 1) * store.pagination.perPage + 1
})

const endItem = computed(() => {
  const end = store.pagination.currentPage * store.pagination.perPage
  return Math.min(end, store.pagination.totalItems)
})

// Methods
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function openCreateDialog() {
  createDialog.value = true
}

function openEditDialog(category) {
  selectedCategory.value = { ...category }
  editDialog.value = true
}

function viewCategory(id) {
  router.push(`/categories/${id}`)
}

function confirmDelete(category) {
  selectedCategory.value = category
  deleteDialog.value = true
}

async function deleteCategory() {
  try {
    await store.deleteCategory(selectedCategory.value.id)
    deleteDialog.value = false
    showSnackbar('Categoría eliminada exitosamente', 'success')
  } catch (error) {
    showSnackbar('Error al eliminar categoría', 'error')
  }
}

async function applyFilters() {
  await store.updateFilters(localFilters.value)
}

async function resetFilters() {
  localFilters.value = {
    name: '',
    sortBy: 'createdAt',
    order: 'ASC',
  }
  await store.resetFilters()
}

async function onPageChange(page) {
  await store.setPage(page)
}

function onCategoryCreated() {
  createDialog.value = false
  showSnackbar('Categoría creada exitosamente', 'success')
  store.fetchCategories()
}

function onCategoryUpdated() {
  editDialog.value = false
  showSnackbar('Categoría actualizada exitosamente', 'success')
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(async () => {
  await store.fetchCategories()
})
</script>

<style scoped>
.category-row {
  cursor: pointer;
  transition: background-color 0.2s;
}

.category-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
