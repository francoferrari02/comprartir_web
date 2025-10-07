<template>
  <v-container fluid class="py-8 bg-surface">
    <div class="shell">
      <!-- Error Alert -->
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        closable
        class="mb-4"
        @click:close="error = null"
      >
        {{ error }}
      </v-alert>

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

      <v-row>
        <!-- COLUMNA IZQUIERDA (principal) -->
        <v-col cols="12" md="8" class="left-col">
          <!-- Tarjeta unificada con buscador, filtros y carrousel -->
          <v-card class="card card--hover mb-4">
            <!-- Buscador y nueva despensa -->
            <PantrySearch
              v-model="searchQuery"
              @new-pantry="openCreateDialog"
              class="search-section"
            />

            <!-- Filtros integrados -->
            <div class="filters-section pa-4 bg-grey-lighten-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <h4 class="text-subtitle-1 font-weight-bold">
                  <v-icon size="small" class="mr-1">mdi-filter-outline</v-icon>
                  Filtros y orden
                </h4>
                <v-btn
                  variant="tonal"
                  size="small"
                  class="btn-pill"
                  @click="showFilters = !showFilters"
                >
                  <v-icon size="small" class="mr-1">
                    {{ showFilters ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                  </v-icon>
                  {{ showFilters ? 'Ocultar' : 'Mostrar' }}
                </v-btn>
              </div>

              <v-expand-transition>
                <div v-show="showFilters">
                  <v-row dense>
                    <!-- Ordenar por -->
                    <v-col cols="12" sm="6" md="3">
                      <v-label class="text-caption font-weight-medium mb-1 d-block">
                        Ordenar por:
                      </v-label>
                      <v-select
                        v-model="filters.sort_by"
                        :items="sortOptions"
                        variant="outlined"
                        density="compact"
                        hide-details
                        @update:model-value="applyFilters"
                      />
                    </v-col>

                    <!-- Dirección -->
                    <v-col cols="12" sm="6" md="3">
                      <v-label class="text-caption font-weight-medium mb-1 d-block">
                        Dirección:
                      </v-label>
                      <v-select
                        v-model="filters.order"
                        :items="orderOptions"
                        variant="outlined"
                        density="compact"
                        hide-details
                        @update:model-value="applyFilters"
                      />
                    </v-col>

                    <!-- Tipo de despensa -->
                    <v-col cols="12" sm="6" md="3">
                      <v-label class="text-caption font-weight-medium mb-1 d-block">
                        Tipo:
                      </v-label>
                      <v-select
                        v-model="filters.owner"
                        :items="ownerOptions"
                        variant="outlined"
                        density="compact"
                        hide-details
                        @update:model-value="applyFilters"
                      />
                    </v-col>

                    <!-- Botón de limpiar filtros -->
                    <v-col cols="12" sm="6" md="3" class="d-flex align-end">
                      <v-btn
                        variant="tonal"
                        size="small"
                        block
                        class="btn-pill"
                        prepend-icon="mdi-filter-remove"
                        @click="clearFilters"
                      >
                        Limpiar
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
              </v-expand-transition>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-12">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              />
              <p class="text-body-1 mt-4">Cargando despensas...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="pantries.length === 0" class="text-center py-12 px-4">
              <v-icon size="80" color="grey-lighten-1" class="mb-4">
                mdi-fridge-outline
              </v-icon>
              <h3 class="text-h6 mb-2">No hay despensas</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ searchQuery ? 'No se encontraron despensas con ese criterio' : 'Comienza creando tu primera despensa para organizar tus productos' }}
              </p>
              <v-btn
                v-if="!searchQuery"
                color="primary"
                prepend-icon="mdi-plus"
                @click="openCreateDialog"
              >
                Nueva Despensa
              </v-btn>
            </div>

            <!-- Carrousel de despensas -->
            <PantryCarousel
              v-else
              :pantries="pantriesWithCounts"
              class="carousel-section"
              @edit-pantry="openEditDialog"
              @delete-pantry="openDeleteConfirm"
            />

            <!-- Pagination -->
            <v-divider v-if="pagination.totalPages > 1" />
            <div v-if="pagination.totalPages > 1" class="d-flex justify-center pa-4">
              <v-pagination
                v-model="pagination.currentPage"
                :length="pagination.totalPages"
                :total-visible="5"
                @update:model-value="onPageChange"
              />
            </div>
          </v-card>
        </v-col>

        <!-- COLUMNA DERECHA (sidebar) -->
        <v-col cols="12" md="4" class="right-col">
          <!-- Resumen -->
          <v-card class="card card--hover mb-4">
            <v-card-title class="text-h6 pa-4">
              <v-icon class="mr-2">mdi-chart-box-outline</v-icon>
              Resumen
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <div v-if="loading" class="text-center py-4">
                <v-progress-circular indeterminate size="32" />
              </div>
              <div v-else>
                <div class="stat-item mb-3">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-2">Total de despensas</span>
                    <span class="text-h6 font-weight-bold">{{ summaryStats.totalPantries }}</span>
                  </div>
                </div>
                <v-divider class="my-3" />
                <div class="stat-item mb-3">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-2">Total de productos</span>
                    <span class="text-h6 font-weight-bold">{{ summaryStats.totalItems }}</span>
                  </div>
                </div>
                <v-divider class="my-3" />
                <div class="stat-item">
                  <div class="d-flex align-center justify-space-between">
                    <span class="text-body-2">Despensas compartidas</span>
                    <span class="text-h6 font-weight-bold">{{ summaryStats.sharedPantries }}</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Create Pantry Dialog -->
      <v-dialog v-model="createDialog" max-width="600">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            Nueva Despensa
          </v-card-title>
          <v-card-text class="pa-4">
            <v-text-field
              v-model="newPantry.name"
              label="Nombre de la despensa"
              variant="outlined"
              density="comfortable"
              :error-messages="newPantryErrors.name"
              autofocus
              @keyup.enter="createPantryAction"
            />
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="text"
              class="btn-rounded"
              @click="createDialog = false"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="btn-rounded"
              :loading="creating"
              @click="createPantryAction"
            >
              Crear
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit Pantry Dialog -->
      <v-dialog v-model="editDialog.open" max-width="600">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            Editar Despensa
          </v-card-title>
          <v-card-text class="pa-4">
            <v-text-field
              v-model="editDialog.form.name"
              label="Nombre de la despensa"
              variant="outlined"
              density="comfortable"
              :error-messages="editDialog.errors.name"
              autofocus
              @keyup.enter="submitEdit"
            />
            <v-alert
              v-if="editDialog.error"
              type="error"
              density="comfortable"
              class="mt-3"
            >
              {{ editDialog.error }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="text"
              class="btn-rounded"
              @click="closeEdit"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="btn-rounded"
              :loading="editDialog.loading"
              @click="submitEdit"
            >
              Guardar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialog.open" max-width="500">
        <v-card>
          <v-card-title class="text-h6 pa-4">
            Eliminar Despensa
          </v-card-title>
          <v-card-text class="pa-4">
            <p class="mb-3">
              ¿Estás seguro de que deseas eliminar la despensa
              <strong>"{{ deleteDialog.target?.name }}"</strong>?
            </p>
            <p class="text-body-2 text-medium-emphasis">
              Esta acción no se puede deshacer y se eliminarán todos los productos asociados.
            </p>
            <v-alert
              v-if="deleteDialog.error"
              type="error"
              density="comfortable"
              class="mt-3"
            >
              {{ deleteDialog.error }}
            </v-alert>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="text"
              class="btn-rounded"
              @click="closeDelete"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              class="btn-rounded"
              :loading="deleteDialog.loading"
              @click="confirmDelete"
            >
              Eliminar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPantries, createPantry, updatePantry, deletePantry } from '@/services/pantries'
import { getPantryItems } from '@/services/pantryItems'
import PantrySearch from '@/components/PantrySearch.vue'
import PantryCarousel from '@/components/PantryCarousel.vue'
import SummaryCard from '@/components/SummaryCard.vue'

const router = useRouter()
const route = useRoute()

// Estado reactivo
const loading = ref(false)
const creating = ref(false)
const error = ref(null)
const pantries = ref([])
const pantryItemsCounts = ref({})
const searchQuery = ref(route.query.search || '')
const createDialog = ref(false)
const showFilters = ref(true)
const editDialog = ref({
  open: false,
  form: {
    id: null,
    name: ''
  },
  errors: {
    name: []
  },
  loading: false,
  error: null
})
const deleteDialog = ref({
  open: false,
  target: null,
  loading: false,
  error: null
})

// Filters from query params
const filters = ref({
  sort_by: route.query.sort_by || 'updatedAt',
  order: route.query.order || 'DESC',
  owner: route.query.owner || undefined
})

// Pagination
const pagination = ref({
  currentPage: Number(route.query.page) || 1,
  perPage: Number(route.query.per_page) || 10,
  totalPages: 1,
  totalItems: 0
})

// New pantry form
const newPantry = ref({
  name: ''
})

const newPantryErrors = ref({
  name: []
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Debounce timer for search
let searchDebounce = null

// Watch search query with debounce
watch(searchQuery, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    pagination.value.currentPage = 1
    updateQueryParams()
    fetchPantries()
  }, 300)
})

// Computed properties
const pantriesWithCounts = computed(() => {
  return pantries.value.map(pantry => ({
    ...pantry,
    totalItems: pantryItemsCounts.value[pantry.id]?.total || 0
  }))
})

const summaryStats = computed(() => {
  const totalPantries = pagination.value.totalItems
  let totalItems = 0
  let sharedPantries = 0

  pantries.value.forEach(pantry => {
    const counts = pantryItemsCounts.value[pantry.id]
    if (counts) {
      totalItems += counts.total
    }
    if (pantry.shared_with && Array.isArray(pantry.shared_with) && pantry.shared_with.length > 0) {
      sharedPantries++
    }
  })

  return {
    totalPantries,
    totalItems,
    sharedPantries
  }
})

// Opciones para los selectores
const sortOptions = [
  { title: 'Nombre', value: 'name' },
  { title: 'Fecha de creación', value: 'createdAt' },
  { title: 'Última actualización', value: 'updatedAt' }
]

const orderOptions = [
  { title: 'Ascendente ↑', value: 'ASC' },
  { title: 'Descendente ↓', value: 'DESC' }
]

const ownerOptions = [
  { title: 'Todas', value: undefined },
  { title: 'Mis despensas', value: true },
  { title: 'Compartidas conmigo', value: false }
]

// Methods
async function fetchPantries() {
  loading.value = true
  error.value = null

  try {
    const params = {
      page: pagination.value.currentPage,
      per_page: pagination.value.perPage,
      sort_by: filters.value.sort_by,
      order: filters.value.order,
      search: searchQuery.value
    }

    if (filters.value.owner !== undefined) {
      params.owner = filters.value.owner
    }

    const response = await getPantries(params)

    pantries.value = response.data || []
    if (response.pagination) {
      pagination.value = {
        ...pagination.value,
        ...response.pagination
      }
    }

    // Fetch item counts for each pantry
    await fetchItemCounts()
  } catch (err) {
    console.error('Error fetching pantries:', err)
    error.value = err.message || 'Error al cargar las despensas'
  } finally {
    loading.value = false
  }
}

async function fetchItemCounts() {
  const counts = {}

  await Promise.all(
    pantries.value.map(async (pantry) => {
      try {
        const itemsResponse = await getPantryItems(pantry.id, { per_page: 1000 })
        const items = itemsResponse.data || []
        counts[pantry.id] = {
          total: items.length
        }
      } catch (err) {
        console.error(`Error fetching items for pantry ${pantry.id}:`, err)
        counts[pantry.id] = { total: 0 }
      }
    })
  )

  pantryItemsCounts.value = counts
}

function updateQueryParams() {
  const query = {
    page: pagination.value.currentPage,
    per_page: pagination.value.perPage,
    sort_by: filters.value.sort_by,
    order: filters.value.order
  }

  if (searchQuery.value) {
    query.search = searchQuery.value
  }

  if (filters.value.owner !== undefined) {
    query.owner = filters.value.owner
  }

  router.replace({ query })
}

function applyFilters() {
  pagination.value.currentPage = 1
  updateQueryParams()
  fetchPantries()
}

function clearFilters() {
  filters.value = {
    sort_by: 'updatedAt',
    order: 'DESC',
    owner: undefined
  }
  searchQuery.value = ''
  applyFilters()
}

function onPageChange(page) {
  pagination.value.currentPage = page
  updateQueryParams()
  fetchPantries()
}

function openCreateDialog() {
  newPantry.value = {
    name: ''
  }
  newPantryErrors.value = { name: [] }
  createDialog.value = true
}

async function createPantryAction() {
  // Validate
  newPantryErrors.value = { name: [] }
  if (!newPantry.value.name.trim()) {
    newPantryErrors.value.name = ['El nombre es requerido']
    return
  }

  creating.value = true
  error.value = null

  try {
    const created = await createPantry({
      name: newPantry.value.name.trim()
    })

    createDialog.value = false
    showSnackbar('Despensa creada exitosamente', 'success')

    await fetchPantries()

    router.push(`/pantries/${created.id}`)
  } catch (err) {
    console.error('Error creating pantry:', err)
    const errorMessage = err.message || 'Error al crear la despensa'
    error.value = errorMessage
    showSnackbar(errorMessage, 'error')
  } finally {
    creating.value = false
  }
}

function openEditDialog(pantry) {
  editDialog.value = {
    open: true,
    form: {
      id: pantry.id,
      name: pantry.name
    },
    errors: { name: [] },
    loading: false,
    error: null
  }
}

function closeEdit() {
  editDialog.value.open = false
}

async function submitEdit() {
  // Validate
  editDialog.value.errors = { name: [] }
  if (!editDialog.value.form.name.trim()) {
    editDialog.value.errors.name = ['El nombre es requerido']
    return
  }

  editDialog.value.loading = true
  editDialog.value.error = null

  try {
    await updatePantry(editDialog.value.form.id, {
      name: editDialog.value.form.name.trim()
    })

    showSnackbar('Despensa actualizada exitosamente', 'success')
    await fetchPantries()
    closeEdit()
  } catch (err) {
    console.error('Error updating pantry:', err)
    const errorMessage = err.message || 'Error al actualizar la despensa'
    editDialog.value.error = errorMessage
    showSnackbar(errorMessage, 'error')
  } finally {
    editDialog.value.loading = false
  }
}

function openDeleteConfirm(pantry) {
  deleteDialog.value = {
    open: true,
    target: pantry,
    loading: false,
    error: null
  }
}

function closeDelete() {
  deleteDialog.value.open = false
}

async function confirmDelete() {
  deleteDialog.value.loading = true
  deleteDialog.value.error = null

  try {
    await deletePantry(deleteDialog.value.target.id)
    showSnackbar('Despensa eliminada exitosamente', 'success')
    await fetchPantries()
    closeDelete()
  } catch (err) {
    console.error('Error deleting pantry:', err)
    const errorMessage = err.message || 'Error al eliminar la despensa'
    deleteDialog.value.error = errorMessage
    showSnackbar(errorMessage, 'error')
  } finally {
    deleteDialog.value.loading = false
  }
}

function showSnackbar(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Lifecycle
onMounted(() => {
  fetchPantries()
})
</script>

<style scoped>
.stat-item {
  padding: 8px 0;
}

.btn-pill {
  border-radius: 24px !important;
}

.btn-rounded {
  border-radius: 8px !important;
}

.card {
  border-radius: 12px !important;
}

.card--hover {
  transition: box-shadow 0.3s ease;
}

.card--hover:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}
</style>
