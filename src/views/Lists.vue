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
            <!-- Buscador y nueva lista -->
            <ListSearch 
              v-model="searchQuery" 
              @new-list="openCreateDialog"
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

                    <!-- Tipo de lista -->
                    <v-col cols="12" sm="6" md="3">
                      <v-label class="text-caption font-weight-medium mb-1 d-block">
                        Tipo de lista:
                      </v-label>
                      <v-select
                        v-model="filters.recurring"
                        :items="recurringOptions"
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
              <p class="text-body-1 mt-4">Cargando listas...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="lists.length === 0" class="text-center py-12 px-4">
              <v-icon size="80" color="grey-lighten-1" class="mb-4">
                mdi-clipboard-list-outline
              </v-icon>
              <h3 class="text-h6 mb-2">No hay listas</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ searchQuery ? 'No se encontraron listas con ese criterio' : 'Comienza creando tu primera lista de compras' }}
              </p>
              <v-btn
                v-if="!searchQuery"
                color="primary"
                prepend-icon="mdi-plus"
                @click="openCreateDialog"
              >
                Nueva Lista
              </v-btn>
            </div>

            <!-- Carrousel de listas -->
            <ListCarousel 
              v-else
              :lists="listsWithProgress"
              class="carousel-section"
              @edit-list="openEditDialog"
              @delete-list="openDeleteConfirm"
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
          <SummaryCard 
            :stats="summaryStats"
            :loading="loading"
            class="card card--hover mb-4"
          />
        </v-col>
      </v-row>

      <!-- Create List Dialog -->
      <v-dialog v-model="createDialog" max-width="600">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            Nueva Lista de Compras
          </v-card-title>
          <v-card-text class="pa-4">
            <v-text-field
              v-model="newList.name"
              label="Nombre de la lista"
              variant="outlined"
              density="comfortable"
              :error-messages="newListErrors.name"
              autofocus
              @keyup.enter="createList"
            />
            <v-textarea
              v-model="newList.description"
              label="Descripción (opcional)"
              variant="outlined"
              density="comfortable"
              rows="3"
            />
            <v-checkbox
              v-model="newList.recurring"
              label="Lista recurrente"
              hint="Las listas recurrentes se pueden reutilizar después de comprarlas"
              persistent-hint
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
              @click="createList"
            >
              Crear
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit List Dialog -->
      <v-dialog v-model="editDialog.open" max-width="600">
        <v-card>
          <v-card-title class="text-h5 pa-4">
            Editar Lista
          </v-card-title>
          <v-card-text class="pa-4">
            <v-text-field
              v-model="editDialog.form.name"
              label="Nombre de la lista"
              variant="outlined"
              density="comfortable"
              :error-messages="editDialog.errors.name"
              autofocus
              @keyup.enter="submitEdit"
            />
            <v-textarea
              v-model="editDialog.form.description"
              label="Descripción (opcional)"
              variant="outlined"
              density="comfortable"
              rows="3"
            />
            <v-checkbox
              v-model="editDialog.form.recurring"
              label="Lista recurrente"
              hint="Las listas recurrentes se pueden reutilizar después de comprarlas"
              persistent-hint
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
            Eliminar Lista
          </v-card-title>
          <v-card-text class="pa-4">
            <p class="mb-3">
              ¿Estás seguro de que deseas eliminar la lista
              <strong>"{{ deleteDialog.target?.name }}"</strong>?
            </p>
            <p class="text-body-2 text-medium-emphasis">
              Esta acción no se puede deshacer.
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
import { useListsStore } from '@/stores/lists'
import { getShoppingLists, createShoppingList, getListItems, updateShoppingList, deleteShoppingList } from '@/services/lists'
import ListSearch from '@/components/ListSearch.vue'
import ListCarousel from '@/components/ListCarousel.vue'
import SummaryCard from '@/components/SummaryCard.vue'

const router = useRouter()
const route = useRoute()
const listsStore = useListsStore()

// Estado reactivo
const loading = ref(false)
const creating = ref(false)
const error = ref(null)
const lists = ref([])
const searchQuery = ref(route.query.search || '')
const createDialog = ref(false)
const showFilters = ref(true) // Controlar visibilidad de filtros
const editDialog = ref({
  open: false,
  form: {
    id: null,
    name: '',
    description: '',
    recurring: false
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
  recurring: route.query.recurring || null,
  owner: route.query.owner || ''
})

// Pagination
const pagination = ref({
  currentPage: Number(route.query.page) || 1,
  perPage: Number(route.query.per_page) || 10,
  totalPages: 1,
  totalItems: 0
})

// New list form
const newList = ref({
  name: '',
  description: '',
  recurring: false
})

const newListErrors = ref({
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
    fetchLists()
  }, 300)
})


// Computed properties
const listsWithProgress = computed(() => {
  // Calculate progress for each list using store cache
  return lists.value.map(list => {
    const items = listsStore.itemsByList.get(list.id) || []
    const total = items.length
    const bought = items.filter(i => i.purchased).length

    return {
      ...list,
      bought,
      total,
      progress: total > 0 ? (bought / total) * 100 : 0,
      tags: list.metadata?.tags || [],
      sharedWith: list.sharedWith || []
    }
  })
})

const summaryStats = computed(() => {
  return {
    totalLists: listsStore.totalLists,
    completedLists: listsStore.completedLists,
    totalItems: listsStore.totalItems,
    completedItems: listsStore.purchasedItems,
    pendingItems: listsStore.pendingItems,
    sharedLists: listsStore.sharedLists
  }
})

// Opciones para los selectores
const sortOptions = [
  { title: 'Nombre', value: 'name' },
  { title: 'Fecha de creación', value: 'createdAt' },
  { title: 'Última actualización', value: 'updatedAt' },
  { title: 'Última compra', value: 'lastPurchasedAt' },
  { title: 'Propietario', value: 'owner' }
]

const orderOptions = [
  { title: 'Ascendente ↑', value: 'ASC' },
  { title: 'Descendente ↓', value: 'DESC' }
]

const recurringOptions = [
  { title: 'Todas', value: null },
  { title: 'Recurrentes', value: true },
  { title: 'No recurrentes', value: false }
]

// Methods
async function fetchLists() {
  loading.value = true
  listsStore.isLoading = true
  error.value = null

  try {
    const params = {
      page: pagination.value.currentPage,
      per_page: pagination.value.perPage,
      name: searchQuery.value,
      sort_by: filters.value.sort_by,
      order: filters.value.order
    }

    if (filters.value.recurring !== null && filters.value.recurring !== '') {
      params.recurring = filters.value.recurring
    }

    if (filters.value.owner) {
      params.owner = filters.value.owner
    }

    const response = await getShoppingLists(params)

    if (Array.isArray(response)) {
      lists.value = response
    } else if (response.data) {
      lists.value = response.data
      if (response.pagination) {
        pagination.value = {
          ...pagination.value,
          ...response.pagination
        }
      }
    } else {
      lists.value = response.items || response.results || []
      if (response.total !== undefined) {
        pagination.value.totalItems = response.total
      }
    }

    // Actualizar el store con las listas
    listsStore.setLists(lists.value)

    // Fetch item counts for each list
    await fetchItemCounts()
  } catch (err) {
    console.error('Error fetching lists:', err)
    error.value = err.message || 'Error al cargar las listas'
  } finally {
    loading.value = false
    listsStore.isLoading = false
  }
}

async function fetchItemCounts() {
  // Fetch item counts for all visible lists in parallel
  console.log('🔄 fetchItemCounts - Iniciando para', lists.value.length, 'listas')

  await Promise.all(
    lists.value.map(async (list) => {
      try {
        console.log(`📤 fetchItemCounts - Cargando items para lista ${list.id} (${list.name})`)
        const itemsResponse = await getListItems(list.id, { per_page: 1000 })
        console.log(`📥 fetchItemCounts - Response para lista ${list.id}:`, itemsResponse)

        // Manejar diferentes formatos de respuesta
        let items = []
        if (Array.isArray(itemsResponse)) {
          items = itemsResponse
        } else if (itemsResponse.data) {
          items = Array.isArray(itemsResponse.data) ? itemsResponse.data : []
        } else if (itemsResponse.items) {
          items = itemsResponse.items
        }

        console.log(`✅ fetchItemCounts - Lista ${list.id} tiene ${items.length} items:`, items)
        // Guardar en el store usando la nueva acción
        listsStore.setItemsForList(list.id, items)
        console.log(`💾 fetchItemCounts - Guardado en store para lista ${list.id}`)
      } catch (err) {
        console.error(`❌ fetchItemCounts - Error cargando items para lista ${list.id}:`, err)
        listsStore.setItemsForList(list.id, [])
      }
    })
  )

  console.log('✅ fetchItemCounts - Completado. Store itemsByList:', listsStore.itemsByList)
  console.log('📊 fetchItemCounts - Estadísticas:', {
    totalItems: listsStore.totalItems,
    purchasedItems: listsStore.purchasedItems,
    pendingItems: listsStore.pendingItems
  })
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

  if (filters.value.recurring !== null && filters.value.recurring !== '') {
    query.recurring = filters.value.recurring
  }

  if (filters.value.owner) {
    query.owner = filters.value.owner
  }

  router.replace({ query })
}

function applyFilters() {
  pagination.value.currentPage = 1
  updateQueryParams()
  fetchLists()
}

function clearFilters() {
  filters.value = {
    sort_by: 'updatedAt',
    order: 'DESC',
    recurring: null,
    owner: ''
  }
  applyFilters()
}

function onPageChange(page) {
  pagination.value.currentPage = page
  updateQueryParams()
  fetchLists()
}

function openCreateDialog() {
  newList.value = {
    name: '',
    description: '',
    recurring: false
  }
  newListErrors.value = { name: [] }
  createDialog.value = true
}

async function createList() {
  // Validate
  newListErrors.value = { name: [] }
  if (!newList.value.name.trim()) {
    newListErrors.value.name = ['El nombre es requerido']
    return
  }

  creating.value = true
  error.value = null // Clear any previous errors

  try {
    console.log('🔄 Creating list with data:', {
      name: newList.value.name.trim(),
      description: newList.value.description.trim(),
      recurring: newList.value.recurring
    })

    const created = await createShoppingList({
      name: newList.value.name.trim(),
      description: newList.value.description.trim(),
      recurring: newList.value.recurring
    })

    console.log('✅ List created successfully:', created)

    createDialog.value = false
    showSnackbar('Lista creada exitosamente', 'success')

    // Refresh the lists to show the new one
    await fetchLists()

    // Navigate to the new list
    router.push(`/lists/${created.id}`)
  } catch (err) {
    console.error('❌ Error creating list:', err)

    // Better error message handling
    let errorMessage = 'Error al crear la lista'

    if (typeof err === 'object' && err !== null) {
      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
    } else if (typeof err === 'string') {
      errorMessage = err
    }

    error.value = errorMessage
    showSnackbar(errorMessage, 'error')
  } finally {
    creating.value = false
  }
}

function openEditDialog(list) {
  editDialog.value = {
    open: true,
    form: {
      id: list.id,
      name: list.name,
      description: list.description,
      recurring: list.recurring
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
  editDialog.value.error = null // Clear any previous errors

  try {
    await updateShoppingList(editDialog.value.form.id, {
      name: editDialog.value.form.name.trim(),
      description: editDialog.value.form.description.trim(),
      recurring: editDialog.value.form.recurring
    })

    showSnackbar('Lista actualizada exitosamente', 'success')

    // Refresh the lists
    await fetchLists()

    // Close the dialog
    closeEdit()
  } catch (err) {
    console.error('❌ Error updating list:', err)

    // Better error message handling
    let errorMessage = 'Error al actualizar la lista'

    if (typeof err === 'object' && err !== null) {
      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
    } else if (typeof err === 'string') {
      errorMessage = err
    }

    editDialog.value.error = errorMessage
    showSnackbar(errorMessage, 'error')
  } finally {
    editDialog.value.loading = false
  }
}

function openDeleteConfirm(list) {
  deleteDialog.value = {
    open: true,
    target: list,
    loading: false,
    error: null
  }
}

function closeDelete() {
  deleteDialog.value.open = false
}

async function confirmDelete() {
  deleteDialog.value.loading = true
  deleteDialog.value.error = null // Clear any previous errors

  try {
    await deleteShoppingList(deleteDialog.value.target.id)

    showSnackbar('Lista eliminada exitosamente', 'success')

    // Refresh the lists
    await fetchLists()

    // Close the dialog
    closeDelete()
  } catch (err) {
    console.error('❌ Error deleting list:', err)

    // Better error message handling
    let errorMessage = 'Error al eliminar la lista'

    if (typeof err === 'object' && err !== null) {
      if (err.message) {
        errorMessage = err.message
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
    } else if (typeof err === 'string') {
      errorMessage = err
    }

    deleteDialog.value.error = errorMessage
    showSnackbar(errorMessage, 'error')
  } finally {
    deleteDialog.value.loading = false
  }
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  fetchLists()
})
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

.filters-section {
  border-bottom: 1px solid var(--border);
}

.carousel-section {
  margin-top: 0;
}

/* Campos de texto con bordes más redondeados */
:deep(.filters-section .v-field) {
  border-radius: 8px !important;
  background-color: white;
}

/* Botones tipo píldora para filtros */
.btn-pill {
  border-radius: 999px !important;
  text-transform: none;
  font-weight: 500;
  font-size: 0.875rem !important;
  height: 32px !important;
  padding: 0 16px !important;
}

.btn-pill :deep(.v-icon) {
  font-size: 18px !important;
}

/* Botones redondeados tipo píldora */
.btn-rounded {
  border-radius: 999px !important;
  text-transform: none;
  font-weight: 500;
}

/* Estilos para modales y diálogos con bordes redondeados */
:deep(.v-dialog > .v-overlay__content > .v-card) {
  border-radius: var(--radius-lg) !important;
  box-shadow: var(--shadow-2) !important;
}

/* Campos de texto con bordes más redondeados */
:deep(.v-dialog .v-field) {
  border-radius: 12px !important;
}

/* Mejorar apariencia de checkboxes */
:deep(.v-checkbox .v-selection-control) {
  border-radius: 8px;
}
</style>