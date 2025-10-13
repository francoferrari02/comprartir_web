<template>
  <v-container fluid class="py-8 bg-surface">
    <div class="view-shell">
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

      <AppBreadcrumbs :items="breadcrumbs" />

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

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
        <p class="text-body-1 mt-4">Cargando despensa...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="!pantry" class="text-center py-16">
        <v-icon size="80" color="error" class="mb-4">
          mdi-alert-circle-outline
        </v-icon>
        <h2 class="text-h5 mb-4">Despensa no encontrada</h2>
        <v-btn color="primary" @click="$router.push('/pantries')">Volver a Despensas</v-btn>
      </div>

      <!-- Pantry Content -->
      <v-row v-else>
        <!-- Columna izquierda: Detalle de la despensa -->
        <v-col cols="12" md="8" class="left-col">
          <v-card class="card card--hover pa-6 mb-4">
            <!-- Header with editable name - MISMO ESTILO QUE LISTDETAIL -->
            <div class="d-flex align-center mb-4">
              <div class="flex-grow-1">
                <div v-if="!editingName">
                  <div class="d-flex align-center">
                    <h1 class="text-h4 font-weight-bold">{{ pantry.name }}</h1>
                    <v-btn
                      icon="mdi-pencil"
                      size="small"
                      variant="text"
                      class="ml-2 icon-btn-rounded"
                      @click="startEditName"
                    >
                      <v-tooltip activator="parent" location="top">
                        Editar nombre
                      </v-tooltip>
                    </v-btn>
                  </div>
                  <!-- Descripción -->
                  <div v-if="pantry.description" class="mt-1">
                    <span class="text-body-2 text-medium-emphasis">
                      {{ pantry.description }}
                    </span>
                  </div>
                </div>

                <!-- Edit name mode -->
                <div v-if="editingName" class="mt-3">
                  <label class="app-input-label" :for="`pantry-edit-name-${pantry?.id ?? 'current'}`">Nombre de la despensa</label>
                  <v-text-field
                    :id="`pantry-edit-name-${pantry?.id ?? 'current'}`"
                    v-model="editName"
                    density="comfortable"
                    hide-details
                    class="app-input"
                    autofocus
                    @keyup.enter="saveName"
                    @keyup.esc="cancelEditName"
                  >
                    <template #append>
                      <v-btn
                        icon="mdi-check"
                        size="small"
                        color="success"
                        variant="text"
                        class="icon-btn-rounded"
                        @click="saveName"
                      />
                      <v-btn
                        icon="mdi-close"
                        size="small"
                        color="error"
                        variant="text"
                        class="icon-btn-rounded"
                        @click="cancelEditName"
                      />
                    </template>
                  </v-text-field>
                </div>
              </div>

              <div class="d-flex align-center gap-2">
                <!-- Menú de acciones -->
                <v-menu location="bottom end">
                  <template #activator="{ props }">
                    <v-btn
                      icon
                      variant="flat"
                      color="#2a2a44"
                      class="icon-btn-rounded"
                      v-bind="props"
                    >
                      <v-icon color="white">mdi-dots-vertical</v-icon>
                      <v-tooltip activator="parent" location="top">
                        Más opciones
                      </v-tooltip>
                    </v-btn>
                  </template>
                  <v-list class="py-2" density="compact">
                    <v-list-item @click="openEditDialog">
                      <template #prepend>
                        <v-icon color="#2a2a44">mdi-pencil</v-icon>
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        Editar despensa
                      </v-list-item-title>
                    </v-list-item>
                    <v-divider class="my-1" />
                    <v-list-item @click="confirmDeletePantry">
                      <template #prepend>
                        <v-icon color="error">mdi-delete</v-icon>
                      </template>
                      <v-list-item-title class="font-weight-medium text-error">
                        Eliminar despensa
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>

                <!-- Back button -->
                <v-btn
                  icon
                  variant="flat"
                  color="#2a2a44"
                  class="icon-btn-rounded"
                  @click="$router.push('/pantries')"
                >
                  <v-icon color="white">mdi-arrow-left</v-icon>
                  <v-tooltip activator="parent" location="top">
                    Volver a Despensas
                  </v-tooltip>
                </v-btn>
              </div>
            </div>

            <!-- Filtros integrados -->
            <div class="filters-section pa-4 mb-4">
              <div class="d-flex align-center justify-space-between mb-3">
                <h4 class="text-subtitle-1 font-weight-bold text-white">
                  <v-icon size="small" class="mr-1">mdi-filter-outline</v-icon>
                  Filtros y orden
                </h4>
                <v-btn
                  variant="tonal"
                  size="small"
                  class="btn-pill text-body-2 font-weight-medium"
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
                    <!-- Buscar productos -->
                    <v-col cols="12">
                      <label class="app-input-label filter-label" for="pantry-search-products">Buscar productos</label>
                      <v-text-field
                        id="pantry-search-products"
                        v-model="searchQuery"
                        prepend-inner-icon="mdi-magnify"
                        density="compact"
                        clearable
                        hide-details
                        class="app-input"
                        placeholder="Buscar productos..."
                        @update:model-value="debouncedSearch"
                      />
                    </v-col>

                    <!-- Ordenar por -->
                    <v-col cols="12" sm="6" md="4">
                      <label class="app-input-label filter-label" for="pantry-sort-by">Ordenar por</label>
                      <v-select
                        id="pantry-sort-by"
                        v-model="itemsFilters.sort_by"
                        :items="sortOptions"
                        density="compact"
                        hide-details
                        class="app-input"
                        @update:model-value="fetchItems"
                      />
                    </v-col>

                    <!-- Dirección -->
                    <v-col cols="12" sm="6" md="4">
                      <label class="app-input-label filter-label" for="pantry-order">Dirección</label>
                      <v-select
                        id="pantry-order"
                        v-model="itemsFilters.order"
                        :items="orderOptions"
                        density="compact"
                        hide-details
                        class="app-input"
                        @update:model-value="fetchItems"
                      />
                    </v-col>

                    <!-- Filtrar por categoría -->
                    <v-col cols="12" md="4">
                      <label class="app-input-label filter-label" for="pantry-filter-category">Filtrar por categoría</label>
                      <v-select
                        id="pantry-filter-category"
                        v-model="selectedCategoryFilter"
                        :items="categoryFilterOptions"
                        prepend-inner-icon="mdi-tag"
                        density="compact"
                        hide-details
                        clearable
                        class="app-input"
                        placeholder="Todas las categorías"
                        @update:model-value="handleCategoryFilterChange"
                      />
                    </v-col>
                  </v-row>
                </div>
              </v-expand-transition>
            </div>

            <v-divider class="mb-4" />

            <!-- Loading Items -->
            <div v-if="itemsLoading" class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="48"
              />
              <p class="text-body-2 mt-2">Cargando productos...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="items.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-lighten-1">mdi-package-variant</v-icon>
              <p class="text-body-1 mt-2">No hay productos en esta despensa</p>
              <p class="text-body-2 text-medium-emphasis">
                {{ searchQuery ? 'No se encontraron productos con ese criterio' : 'Añade productos usando el panel de la derecha' }}
              </p>
            </div>

            <!-- Products list -->
            <div v-else>
              <div class="d-flex align-center mb-3">
                <span class="text-caption text-medium-emphasis">
                  {{ items.length }} {{ items.length === 1 ? 'producto' : 'productos' }}
                </span>
              </div>

              <div class="products-list">
                <PantryProductItem
                  v-for="item in items"
                  :key="item.id"
                  :product="item"
                  @delete="deleteItem(item.id)"
                  @edit="openEditItem(item)"
                  @update-name="(newName) => updateItemName(item.id, newName)"
                />
              </div>
            </div>

            <!-- Pagination for items -->
            <v-divider v-if="itemsPagination.totalPages > 1" class="mt-4" />
            <div v-if="itemsPagination.totalPages > 1" class="d-flex justify-space-between align-center mt-4">
              <div class="text-body-2 text-medium-emphasis">
                Mostrando {{ startItem }} - {{ endItem }} de {{ itemsPagination.totalItems }} productos
              </div>
              <v-pagination
                v-model="itemsPagination.currentPage"
                :length="itemsPagination.totalPages"
                :total-visible="5"
                @update:model-value="onItemsPageChange"
              />
            </div>
          </v-card>
        </v-col>

        <!-- Columna derecha: Añadir items y compartir -->
        <v-col cols="12" md="4" class="right-col">
          <!-- Add Item Card - Reutilizando componente consistente -->
          <AddItemCard
            :loading="addingItem"
            @add-item="addItem"
          />

          <!-- Share Card -->
          <v-card class="card mb-4">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-share-variant</v-icon>
              Compartir Despensa
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <div>
                <label class="app-input-label" for="pantry-share-email">Email del usuario</label>
                <v-text-field
                  id="pantry-share-email"
                  v-model="shareEmail"
                  density="comfortable"
                  type="email"
                  hide-details
                  class="app-input"
                  @keyup.enter="sharePantry"
                />
              </div>
              <v-btn
                color="primary"
                block
                class="mt-3 btn-pill text-body-2 font-weight-medium"
                prepend-icon="mdi-send"
                :loading="sharingLoading"
                @click="sharePantry"
              >
                Compartir
              </v-btn>

              <!-- Shared Users List -->
              <div v-if="sharedUsers.length > 0" class="mt-4">
                <v-divider class="mb-3" />
                <p class="text-caption font-weight-medium mb-2">Compartida con:</p>
                <v-list density="compact" class="pa-0">
                  <v-list-item
                    v-for="user in sharedUsers"
                    :key="user.userId"
                    class="px-0"
                  >
                    <v-list-item-title class="text-body-2">
                      {{ user.email }}
                    </v-list-item-title>
                    <template #append>
                      <v-btn
                        icon="mdi-close"
                        size="x-small"
                        variant="text"
                        color="error"
                        @click="revokeAccess(user.userId)"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Edit Pantry Dialog -->
      <v-dialog v-model="editPantryDialog.open" max-width="600">
        <v-card class="dialog-card">
          <v-card-title class="text-h6 font-weight-bold">
            <span>Editar Despensa</span>
            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              @click="closeEditPantryDialog"
            />
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <!-- Nombre -->
            <div class="mb-3">
              <label class="app-input-label" for="edit-pantry-name">Nombre de la despensa</label>
              <v-text-field
                id="edit-pantry-name"
                v-model="editPantryDialog.form.name"
                density="comfortable"
                hide-details
                class="app-input"
                placeholder="Ej: Despensa Principal"
              />
            </div>

            <!-- Descripción -->
            <div class="mb-3">
              <label class="app-input-label" for="edit-pantry-description">Descripción (opcional)</label>
              <v-textarea
                id="edit-pantry-description"
                v-model="editPantryDialog.form.description"
                density="comfortable"
                hide-details
                rows="3"
                class="app-input"
                placeholder="Descripción de la despensa..."
              />
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4 d-flex justify-space-between">
            <v-btn
              variant="text"
              class="btn-pill text-body-2"
              @click="closeEditPantryDialog"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="#2a2a44"
              class="btn-pill text-body-2 font-weight-medium"
              :loading="editPantryDialog.loading"
              @click="saveEditPantry"
            >
              Guardar cambios
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit Item Dialog -->
      <v-dialog v-model="editItemDialog.open" max-width="600">
        <v-card class="dialog-card">
          <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between">
            <span>Detalles del producto</span>
            <v-btn
              icon="mdi-close"
              size="small"
              variant="text"
              @click="closeEditItem"
            />
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-4">
            <!-- Nombre del producto -->
            <div class="mb-3">
              <label class="app-input-label" for="edit-item-name">Producto</label>
              <v-text-field
                id="edit-item-name"
                v-model="editItemDialog.form.productName"
                density="comfortable"
                prepend-inner-icon="mdi-package-variant"
                placeholder="Nombre del producto"
                class="app-input"
              />
            </div>

            <!-- Categoría del producto -->
            <div class="mb-3">
              <label class="app-input-label" for="edit-item-category">Categoría</label>
              <v-text-field
                id="edit-item-category"
                v-model="editItemDialog.form.categoryName"
                density="comfortable"
                prepend-inner-icon="mdi-tag-outline"
                placeholder="Categoría del producto"
                class="app-input"
              />
              <p class="text-caption text-medium-emphasis mt-1">Dejar vacío para quitar la categoría.</p>
            </div>

            <!-- Cantidad -->
            <div class="mb-3">
              <label class="app-input-label" for="edit-item-quantity">Cantidad</label>
              <v-text-field
                id="edit-item-quantity"
                v-model.number="editItemDialog.form.quantity"
                type="number"
                density="comfortable"
                prepend-inner-icon="mdi-counter"
                min="0.01"
                step="0.01"
                class="app-input"
              />
            </div>

            <!-- Unidad -->
            <div class="mb-3">
              <label class="app-input-label" for="edit-item-unit">Unidad</label>
              <v-select
                id="edit-item-unit"
                v-model="editItemDialog.form.unit"
                :items="unitOptions"
                density="comfortable"
                prepend-inner-icon="mdi-scale-balance"
                class="app-input"
              />
            </div>

            <!-- Descripción/Notas (metadata) -->
            <div class="mb-3">
              <label class="app-input-label" for="edit-item-description">Notas o descripción (opcional)</label>
              <v-textarea
                id="edit-item-description"
                v-model="editItemDialog.form.description"
                density="comfortable"
                rows="3"
                prepend-inner-icon="mdi-text"
                placeholder="Ej: Marca específica, variedad, recordatorios..."
                class="app-input"
              />
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4 d-flex justify-space-between">
            <!-- Botón eliminar a la izquierda -->
            <v-btn
              color="error"
              variant="outlined"
              prepend-icon="mdi-delete"
              class="btn-rounded"
              @click="confirmDeleteFromEdit"
            >
              Eliminar
            </v-btn>

            <!-- Botones de acción a la derecha -->
            <div class="d-flex gap-2">
              <v-btn
                variant="text"
                class="btn-rounded"
                @click="closeEditItem"
              >
                Cancelar
              </v-btn>
              <v-btn
                color="primary"
                variant="flat"
                class="btn-rounded"
                :loading="editItemDialog.loading"
                @click="submitEditItem"
              >
                Guardar cambios
              </v-btn>
            </div>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Pantry Confirmation Dialog -->
      <v-dialog v-model="deleteDialog.open" max-width="500">
        <v-card>
          
          <v-card-text class="pa-4">
            <p class="mb-3">
              ¿Estás seguro de que deseas eliminar esta despensa?
            </p>
            <p class="text-body-2 text-medium-emphasis">
              Esta acción no se puede deshacer y se eliminarán todos los productos asociados.
            </p>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="text"
              class="btn-rounded"
              @click="deleteDialog.open = false"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="error"
              variant="flat"
              class="btn-rounded"
              :loading="deleteDialog.loading"
              @click="executeDeletePantry"
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import { getPantryById, updatePantry, deletePantry, sharePantry as sharePantryService, getPantrySharedUsers, revokePantryShare } from '@/services/pantries'
import { getPantryItems, addPantryItem, updatePantryItem, deletePantryItem } from '@/services/pantryItems'
import { getProfile } from '@/services/auth'
import { getCategories, createCategory } from '@/services/categories'
import { useCategoriesStore } from '@/stores/categories'
import { getProduct, updateProduct } from '@/services/products.service'
import PantryProductItem from '@/components/PantryProductItem.vue'
import AddItemCard from '@/components/AddItemCard.vue'
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const categoriesStore = useCategoriesStore()

const breadcrumbs = computed(() => [
  { title: 'Inicio', to: { name: 'home' } },
  { title: 'Despensas', to: { name: 'pantries' } },
  { title: pantry.value?.name || 'Detalle' }
])

// Composables
const {
  notifyPantryShared,
  notifyItemAdded,
  notifyAccessRevoked
} = useNotifications()

// State
const loading = ref(true)
const itemsLoading = ref(false)
const addingItem = ref(false)
const sharingLoading = ref(false)
const error = ref(null)
const pantry = ref(null)
const items = ref([])
const sharedUsers = ref([])
const searchQuery = ref('')
const shareEmail = ref('')
const currentUser = ref(null) // ← Usuario actual
const selectedCategoryFilter = ref(null) // ← Para el filtro de categoría en la vista
const showFilters = ref(false) // ← Para mostrar/ocultar filtros

// Category management (usado por filtros y edición de items)
const DEFAULT_CATEGORY_ICON = 'mdi-tag-outline'
const loadingCategories = ref(false)
const creatingCategory = ref(false)
const serverCategories = ref([])
const extraCategories = ref([])
const categorySearch = ref('')
const selectedCategoryValue = ref(null)

// Pagination for items
const itemsPagination = ref({
  currentPage: 1,
  perPage: 50,
  totalPages: 1,
  totalItems: 0
})

// Filters for items - NOTA: order es minúscula para pantry items según el spec
const itemsFilters = ref({
  search: '',
  category_id: null,
  sort_by: 'name',
  order: 'desc' // minúscula para pantry items
})

// Edit item dialog
const editItemDialog = ref({
  open: false,
  form: {
    id: null,
    productName: '',
    quantity: 1,
    unit: 'un'
  },
  loading: false
})

// Edit pantry dialog
const editPantryDialog = ref({
  open: false,
  form: {
    name: '',
    description: ''
  },
  loading: false
})

// Delete pantry dialog
const deleteDialog = ref({
  open: false,
  loading: false
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Computed
const startItem = computed(() => {
  if (items.value.length === 0) return 0
  return (itemsPagination.value.currentPage - 1) * itemsPagination.value.perPage + 1
})

const endItem = computed(() => {
  const end = itemsPagination.value.currentPage * itemsPagination.value.perPage
  return Math.min(end, itemsPagination.value.totalItems)
})

const sortOptions = [
  { title: 'Nombre', value: 'name' },
  { title: 'Cantidad', value: 'quantity' },
  { title: 'Unidad', value: 'unit' },
  { title: 'Nombre del producto', value: 'productName' }
]

const orderOptions = [
  { title: 'Ascendente ↑', value: 'asc' },
  { title: 'Descendente ↓', value: 'desc' }
]

const unitOptions = [
  'un',
  'kg',
  'g',
  'l',
  'ml',
  'paquete',
  'caja',
  'bolsa',
  'docena',
  'lata',
  'botella'
]

// Category computed properties
const mergedCategories = computed(() => {
  const map = new Map()

  const addCategory = (category) => {
    if (!category || !category.name) return
    const name = category.name.trim()
    if (!name) return
    const key = name.toLowerCase()
    const existing = map.get(key)
    const icon = category.icon || existing?.icon || DEFAULT_CATEGORY_ICON
    const payload = {
      name,
      icon,
      keyValue: category.key ?? existing?.keyValue ?? null,
      id: category.id ?? existing?.id ?? null,
    }

    map.set(key, payload)
  }

  serverCategories.value.forEach(cat => addCategory(cat))
  extraCategories.value.forEach(cat => addCategory(cat))

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
})

const categoryOptions = computed(() => {
  return mergedCategories.value.map(cat => {
    const value = cat.id ? `id:${cat.id}` : cat.keyValue ? `key:${cat.keyValue}` : `name:${slugifyName(cat.name)}`
    return {
      title: cat.name,
      value,
      icon: cat.icon || DEFAULT_CATEGORY_ICON,
      id: cat.id ?? null,
      key: cat.keyValue ?? null,
      name: cat.name,
    }
  })
})

const categoryLookupByValue = computed(() => {
  const map = new Map()
  categoryOptions.value.forEach(option => {
    map.set(option.value, option)
  })
  return map
})

const categoryLookupByName = computed(() => {
  const map = new Map()
  categoryOptions.value.forEach(option => {
    map.set(option.name.toLowerCase(), option)
  })
  return map
})

const selectedCategoryData = computed(() => categoryLookupByValue.value.get(selectedCategoryValue.value) ?? null)

const selectedCategoryKey = computed(() => selectedCategoryData.value?.key ?? null)
const selectedCategoryId = computed(() => selectedCategoryData.value?.id ?? null)

const canCreateCategory = computed(() => {
  const name = (categorySearch.value || '').trim()
  if (!name) return false
  return !categoryLookupByName.value.has(name.toLowerCase())
})

// Computed para opciones de filtro por categoría
const categoryFilterOptions = computed(() => {
  // Obtener todas las categorías únicas de mergedCategories
  return mergedCategories.value.map(cat => cat.name).sort()
})

// Computed para mostrar la categoría en el diálogo de edición
const editItemCategoryName = computed(() => {
  if (!editItemDialog.value.form.id) return ''

  // Buscar el item en la lista de items
  const item = items.value.find(i => i.id === editItemDialog.value.form.id)
  if (!item) return ''

  // Obtener la categoría del producto
  const category = item?.product?.category || item?.category
  if (!category) return ''

  return category.name || ''
})

// Debounce timer for search
let searchDebounce = null

function debouncedSearch() {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    itemsFilters.value.search = searchQuery.value
    itemsPagination.value.currentPage = 1
    fetchItems()
  }, 300)
}

// Methods
async function fetchPantry() {
  loading.value = true
  error.value = null

  try {
    const id = route.params.id
    pantry.value = await getPantryById(id)
  } catch (err) {
    console.error('Error fetching pantry:', err)
    error.value = err.message || 'Error al cargar la despensa'
    pantry.value = null
  } finally {
    loading.value = false
  }
}

async function fetchItems() {
  if (!pantry.value) return

  console.log('🔄 PantryDetail - fetchItems - Iniciando para pantry:', pantry.value.id)
  itemsLoading.value = true
  error.value = null

  try {
    const params = {
      page: itemsPagination.value.currentPage,
      per_page: itemsPagination.value.perPage,
      search: itemsFilters.value.search,
      sort_by: itemsFilters.value.sort_by,
      order: itemsFilters.value.order
    }

    if (itemsFilters.value.category_id) {
      params.category_id = itemsFilters.value.category_id
    }

    console.log('📤 PantryDetail - fetchItems - Params:', params)
    const { data, pagination } = await getPantryItems(pantry.value.id, params)
    console.log('📥 PantryDetail - fetchItems - Items:', data)

    const fetchedItems = Array.isArray(data) ? data : []

    items.value = fetchedItems
    console.log('💾 PantryDetail - Items guardados:', items.value.length, 'items')
    console.log('📋 PantryDetail - Items:', items.value)

    if (pagination) {
      itemsPagination.value = {
        ...itemsPagination.value,
        ...pagination
      }
      console.log('📄 PantryDetail - Pagination:', itemsPagination.value)
    }
  } catch (err) {
    console.error('❌ PantryDetail - Error fetching items:', err)
    error.value = err.message || 'Error al cargar los productos'
  } finally {
    itemsLoading.value = false
  }
}

async function fetchSharedUsers() {
  if (!pantry.value) return

  // Solo el owner puede ver los usuarios compartidos según la API
  const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id
  if (pantry.value.owner?.id !== currentUserId) {
    // Si no somos el owner, no intentamos cargar los usuarios compartidos
    sharedUsers.value = []
    return
  }

  try {
    const response = await getPantrySharedUsers(pantry.value.id)
    sharedUsers.value = Array.isArray(response) ? response : (response?.data ?? [])
  } catch (err) {
    console.error('Error fetching shared users:', err)
    // No mostrar error al usuario si no puede ver los usuarios compartidos
    sharedUsers.value = []
  }
}

async function updatePantryName(newName) {
  if (!pantry.value || !newName.trim() || newName === pantry.value.name) return

  try {
    const updated = await updatePantry(pantry.value.id, { name: newName.trim() })
    pantry.value = { ...pantry.value, ...updated }
    showSnackbar('Despensa actualizada', 'success')
  } catch (err) {
    console.error('Error updating pantry:', err)
    error.value = err.message || 'Error al actualizar la despensa'
  }
}

async function addItem(itemData) {
  console.log('🎯 PantryDetail - addItem - Datos recibidos:', itemData)
  
  const productId = typeof itemData.productId === 'object' ? itemData.productId?.id : itemData.productId
  if (!productId) {
    showSnackbar('Seleccioná o creá un producto', 'error')
    return
  }

  addingItem.value = true

  try {
    // PASO 1: Si hay categoría seleccionada y el producto NO fue recién creado, actualizar la categoría del producto
    if (itemData.categoryId && !itemData.isNewlyCreated) {
      console.log('📦 PantryDetail - addItem - Actualizando categoría del producto...')
      console.log('   Product ID:', productId)
      console.log('   Category ID:', itemData.categoryId)
      console.log('   Is newly created:', itemData.isNewlyCreated)
      
      try {
        // Obtener el producto actual para extraer el nombre (requerido por la API)
        const currentProduct = await getProduct(productId)
        const productName = currentProduct.name
        console.log('   Product name:', productName)
        
        const categoryPayload = { id: Number(itemData.categoryId) }
        
        // Actualizar con nombre + categoría (API requiere el campo 'name')
        const updatedProduct = await updateProduct(productId, { 
          name: productName,
          category: categoryPayload 
        })
        console.log('✅ PantryDetail - addItem - Categoría actualizada:', updatedProduct.category)
      } catch (categoryErr) {
        console.error('⚠️ PantryDetail - addItem - Error al actualizar categoría:', categoryErr)
        // No bloqueamos el flujo, continuamos agregando el item
      }
    } else {
      console.log('ℹ️ PantryDetail - addItem - Sin actualización de categoría')
      console.log('   Razón: categoryId =', itemData.categoryId, ', isNewlyCreated =', itemData.isNewlyCreated)
    }

    // PASO 2: Crear el item en la despensa
    const payload = {
      product: { id: Number(productId) },
      quantity: Number(itemData.quantity || 1),
      unit: String(itemData.unit || 'un'),
      metadata: {}
    }

    console.log('🎯 PantryDetail - addItem - Payload para despensa:', payload)
    const addedItem = await addPantryItem(pantry.value.id, payload)
    console.log('✅ PantryDetail - addItem - Item agregado a despensa:', addedItem)

    // PASO 3: Refrescar items
    console.log('🔄 PantryDetail - addItem - Refrescando lista de items...')
    await fetchItems()

    // PASO 4: Notificar si está compartida
    if (pantry.value.sharedWith && pantry.value.sharedWith.length > 0) {
      const productName = addedItem.product?.name || addedItem.productName || 'Producto'
      notifyItemAdded(
        productName,
        pantry.value.name,
        pantry.value.id,
        currentUser.value?.name || 'Un usuario',
        'pantry'
      )
      console.log('📬 Notificación enviada: Item agregado a despensa compartida')
    }

    showSnackbar('Producto añadido a la despensa', 'success')
  } catch (err) {
    console.error('❌ PantryDetail - addItem - Error:', err)
    const errorMsg = err.response?.data?.message || err.message || 'Error al añadir el producto'
    showSnackbar(errorMsg, 'error')
  } finally {
    addingItem.value = false
  }
}

function openEditItem(item) {
  // Obtener la categoría del producto
  const category = item?.product?.category || item?.category
  const categoryName = category?.name || ''

  editItemDialog.value = {
    open: true,
    form: {
      id: item.id,
      productName: item.productName || item.product?.name || 'Producto',
      categoryName: categoryName,
      quantity: item.quantity,
      unit: item.unit,
      description: item.metadata?.description || ''
    },
    loading: false
  }
}

function closeEditItem() {
  editItemDialog.value.open = false
}

async function submitEditItem() {
  editItemDialog.value.loading = true

  try {
    // Manejar la categoría primero si hay cambios
    const categoryNameInput = (editItemDialog.value.form.categoryName || '').trim()
    let categoryToAssociate = null

    if (categoryNameInput) {
      // Buscar si la categoría ya existe en las categorías cargadas
      let existingCategory = mergedCategories.value.find(cat =>
        cat.name.toLowerCase() === categoryNameInput.toLowerCase()
      )

      // Si no existe, crearla
      if (!existingCategory) {
        console.log('🆕 Creando nueva categoría:', categoryNameInput)
        try {
          const newCategory = await createCategory({
            name: categoryNameInput,
            metadata: {
              icon: DEFAULT_CATEGORY_ICON,
            },
          })

          existingCategory = {
            id: newCategory.id,
            name: newCategory.name,
            icon: newCategory.metadata?.icon || DEFAULT_CATEGORY_ICON,
            keyValue: newCategory.metadata?.key || null
          }

          // Agregar a las categorías del servidor
          serverCategories.value = [{
            id: newCategory.id,
            name: newCategory.name,
            icon: newCategory.metadata?.icon || DEFAULT_CATEGORY_ICON,
            key: newCategory.metadata?.key || null,
          }, ...serverCategories.value]

          console.log('✅ Categoría creada:', newCategory)
        } catch (error) {
          console.error('❌ Error creando categoría:', error)
          showSnackbar('Error al crear la categoría: ' + (error.message || 'Error desconocido'), 'error')
          editItemDialog.value.loading = false
          return
        }
      }

      categoryToAssociate = existingCategory
    }

    // Preparar el payload para actualizar el producto en el backend
    const productPayload = {}

    // Siempre incluir el nombre del producto
    if (editItemDialog.value.form.productName) {
      productPayload.name = editItemDialog.value.form.productName
    }

    // Agregar categoría si existe
    if (categoryToAssociate?.id) {
      productPayload.category = { id: Number(categoryToAssociate.id) }
    } else if (!categoryNameInput) {
      // Si se borró la categoría, enviar null
      productPayload.category = null
    }

    // Obtener el ID del producto del item
    const item = items.value.find(i => i.id === editItemDialog.value.form.id)
    const productId = item?.product?.id || item?.productId

    // Actualizar el producto si tenemos cambios y un ID válido
    if (productId && Object.keys(productPayload).length > 0) {
      console.log('🔄 Actualizando producto ID:', productId, 'con payload:', productPayload)
      try {
        const { updateProduct } = await import('@/services/products.service')
        await updateProduct(productId, productPayload)
        console.log('✅ Producto actualizado en el backend')
      } catch (error) {
        console.warn('⚠️ Error al actualizar el producto:', error)
        // Continuar de todas formas con la actualización del item
      }
    }

    // Preparar el payload para actualizar el item de la despensa
    const itemPayload = {
      quantity: editItemDialog.value.form.quantity,
      unit: editItemDialog.value.form.unit
    }

    // Agregar descripción si existe
    if (editItemDialog.value.form.description !== undefined) {
      itemPayload.metadata = { description: editItemDialog.value.form.description }
    }

    // Actualizar el item de la despensa
    const updated = await updatePantryItem(
      pantry.value.id,
      editItemDialog.value.form.id,
      itemPayload
    )

    showSnackbar('Producto actualizado', 'success')

    // Refrescar la lista para obtener los datos actualizados del servidor con la categoría
    await fetchItems()

    closeEditItem()
  } catch (err) {
    console.error('Error updating item:', err)
    error.value = err.message || 'Error al actualizar el producto'
  } finally {
    editItemDialog.value.loading = false
  }
}

async function updateItemName(itemId, newName) {
  try {
    const updated = await updatePantryItem(pantry.value.id, itemId, { name: newName })

    const index = items.value.findIndex(i => i.id === itemId)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updated }
    }

    showSnackbar('Nombre actualizado', 'success')
  } catch (err) {
    console.error('Error updating item name:', err)
    error.value = err.message || 'Error al actualizar el nombre del producto'
  }
}

async function deleteItem(itemId) {
  try {
    await deletePantryItem(pantry.value.id, itemId)
    items.value = items.value.filter(i => i.id !== itemId)
    itemsPagination.value.totalItems--
    showSnackbar('Producto eliminado', 'success')
  } catch (err) {
    console.error('Error deleting item:', err)
    error.value = err.message || 'Error al eliminar el producto'
  }
}

async function sharePantry() {
  if (!shareEmail.value?.trim()) return

  sharingLoading.value = true

  try {
    await sharePantryService(pantry.value.id, shareEmail.value.trim())
    await fetchSharedUsers()
    shareEmail.value = ''
    showSnackbar('Despensa compartida exitosamente', 'success')
  } catch (err) {
    console.error('Error sharing pantry:', err)
    error.value = err.message || 'Error al compartir la despensa'
  } finally {
    sharingLoading.value = false
  }
}

async function revokeAccess(userId) {
  sharingLoading.value = true

  try {
    await revokePantryShare(pantry.value.id, userId)

    // 🔔 Disparar notificación de acceso revocado
    notifyAccessRevoked(pantry.value.name, 'pantry')
    console.log('📬 Notificación enviada: Acceso revocado de despensa')

    sharedUsers.value = sharedUsers.value.filter(u => u.userId !== userId)
    showSnackbar('Acceso revocado', 'success')
  } catch (err) {
    console.error('Error revoking access:', err)
    error.value = err.message || 'Error al revocar el acceso'
  } finally {
    sharingLoading.value = false
  }
}

function openEditDialog() {
  editPantryDialog.value.form.name = pantry.value.name || ''
  editPantryDialog.value.form.description = pantry.value.description || ''
  editPantryDialog.value.open = true
}

function closeEditPantryDialog() {
  editPantryDialog.value.open = false
  editPantryDialog.value.form = { name: '', description: '' }
}

async function saveEditPantry() {
  if (!editPantryDialog.value.form.name.trim()) {
    showSnackbar('El nombre no puede estar vacío', 'error')
    return
  }

  editPantryDialog.value.loading = true

  try {
    const payload = {
      name: editPantryDialog.value.form.name.trim(),
      description: editPantryDialog.value.form.description.trim() || undefined
    }

    await updatePantry(pantry.value.id, payload)
    
    // Actualizar datos locales
    pantry.value.name = payload.name
    if (payload.description) {
      pantry.value.description = payload.description
    }

    showSnackbar('Despensa actualizada exitosamente', 'success')
    closeEditPantryDialog()
  } catch (err) {
    console.error('Error updating pantry:', err)
    showSnackbar(err.message || 'Error al actualizar la despensa', 'error')
  } finally {
    editPantryDialog.value.loading = false
  }
}

function confirmDeletePantry() {
  deleteDialog.value.open = true
}

async function executeDeletePantry() {
  deleteDialog.value.loading = true

  try {
    await deletePantry(pantry.value.id)
    showSnackbar('Despensa eliminada exitosamente', 'success')
    router.push('/pantries')
  } catch (err) {
    console.error('Error deleting pantry:', err)
    error.value = err.message || 'Error al eliminar la despensa'
  } finally {
    deleteDialog.value.loading = false
  }
}

function onItemsPageChange(page) {
  itemsPagination.value.currentPage = page
  fetchItems()
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// Agregar estados para edición de nombre
const editingName = ref(false)
const editName = ref('')

function startEditName() {
  editName.value = pantry.value.name
  editingName.value = true
}

function cancelEditName() {
  editingName.value = false
  editName.value = ''
}

async function saveName() {
  if (editName.value.trim() && editName.value.trim() !== pantry.value.name) {
    await updatePantryName(editName.value.trim())
  }
  editingName.value = false
}

// Función para confirmar eliminación desde el diálogo de edición
function confirmDeleteFromEdit() {
  const itemId = editItemDialog.value.form.id
  if (!itemId) return

  // Cerrar el diálogo de edición primero
  closeEditItem()

  // Eliminar el item
  deleteItem(itemId)
}

// Category functions
function onProductSelected(product) {
  if (!product) {
    selectedCategoryValue.value = null
    return
  }
  if (!product.category) {
    selectedCategoryValue.value = null
    return
  }

  const normalized = normalizeProductCategory(product.category)
  if (!normalized) {
    selectedCategoryValue.value = null
    return
  }

  addExtraCategory(normalized)

  nextTick(() => {
    const option = categoryLookupByName.value.get(normalized.name.toLowerCase())
    if (option) {
      selectedCategoryValue.value = option.value
    }
  })
}

function normalizeProductCategory(category) {
  if (!category) return null

  const name = category.name?.trim()
  if (!name) return null

  const metadataKey = category.metadata?.key ?? null
  const icon = category.metadata?.icon || DEFAULT_CATEGORY_ICON
  const id = category.id ?? null

  return { name, icon, key: metadataKey, id }
}

function addExtraCategory(category) {
  if (!category?.name) return
  const lower = category.name.toLowerCase()
  const existing = extraCategories.value.find(cat => cat.name.toLowerCase() === lower)
  if (existing) {
    existing.icon = category.icon || existing.icon
    existing.id = category.id ?? existing.id
    existing.key = category.key ?? existing.key
    return
  }
  extraCategories.value.push({
    name: category.name,
    icon: category.icon || DEFAULT_CATEGORY_ICON,
    id: category.id ?? null,
    key: category.key ?? null,
  })
}

async function loadCategories() {
  loadingCategories.value = true
  try {
    const response = await getCategories({ per_page: 100, order: 'asc', sort_by: 'name' })
    const list = Array.isArray(response) ? response : response?.data ?? []
    serverCategories.value = list.map(cat => ({
      id: cat.id ?? null,
      name: cat.name,
      icon: cat.metadata?.icon || DEFAULT_CATEGORY_ICON,
      key: cat.metadata?.key ?? null,
    }))
  } catch (error) {
    console.error('loadCategories error', error)
    serverCategories.value = []
  } finally {
    loadingCategories.value = false
  }
}

async function createCategoryFromSearch() {
  const name = (categorySearch.value || '').trim()
  if (!name || !canCreateCategory.value) return

  creatingCategory.value = true
  try {
    const newCategory = await createCategory({
      name,
      metadata: {
        icon: DEFAULT_CATEGORY_ICON,
      },
    })

    const saved = {
      id: newCategory?.id ?? null,
      name: newCategory?.name ?? name,
      icon: newCategory?.metadata?.icon || DEFAULT_CATEGORY_ICON,
      key: newCategory?.metadata?.key ?? null,
    }

    serverCategories.value = [saved, ...serverCategories.value]

    nextTick(() => {
      const option = categoryLookupByName.value.get(saved.name.toLowerCase())
      if (option) {
        selectedCategoryValue.value = option.value
      }
      categorySearch.value = ''
    })
  } catch (error) {
    console.error('createCategoryFromSearch error', error)
  } finally {
    creatingCategory.value = false
  }
}

function slugifyName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Handler para el cambio de filtro de categoría
function handleCategoryFilterChange(categoryName) {
  console.log('🔍 PantryDetail - handleCategoryFilterChange - categoryName:', categoryName)

  if (categoryName) {
    // Buscar el ID de la categoría en mergedCategories
    const category = mergedCategories.value.find(cat =>
      cat.name.toLowerCase() === categoryName.toLowerCase()
    )

    if (category?.id) {
      console.log('✅ Categoría encontrada:', category)
      itemsFilters.value.category_id = category.id
    } else {
      console.warn('⚠️ No se encontró la categoría:', categoryName)
      // Si no se encuentra el ID, limpiar el filtro
      itemsFilters.value.category_id = null
    }
  } else {
    // Limpiar el filtro
    itemsFilters.value.category_id = null
  }

  // Resetear a la primera página y hacer fetch
  itemsPagination.value.currentPage = 1
  fetchItems()
}

// Lifecycle
onMounted(async () => {
  loadCategories()
  await fetchPantry()
  if (pantry.value) {
    await Promise.all([fetchItems(), fetchSharedUsers()])
  }

  // Cargar usuario actual
  const profile = await getProfile()
  currentUser.value = profile.data || profile
})
</script>

<style scoped>
.gap-2 {
  gap: 8px;
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

.icon-btn-rounded {
  border-radius: 50%;
}

/* Filters section */
.filters-section {
  background-color: #2a2a44;
  border-radius: 8px;
}

.filters-section h4,
.filters-section .v-btn {
  color: #ffffff !important;
}

.filters-section .v-icon {
  color: #ffffff !important;
}

.filter-label {
  color: rgba(255, 255, 255, 0.9) !important;
  margin-bottom: 6px;
}

/* Products list styling handled by component */
</style>
