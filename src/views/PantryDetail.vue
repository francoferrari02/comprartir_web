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

              <!-- Back button -->
              <v-btn
                icon="mdi-arrow-left"
                variant="text"
                class="icon-btn-rounded"
                @click="$router.push('/pantries')"
              >
                <v-tooltip activator="parent" location="top">
                  Volver a Despensas
                </v-tooltip>
              </v-btn>
            </div>

            <!-- Buscador y filtros -->
            <div class="mb-4">
              <div class="mb-3">
                <label class="app-input-label" for="pantry-search-products">Buscar productos</label>
                <v-text-field
                  id="pantry-search-products"
                  v-model="searchQuery"
                  prepend-inner-icon="mdi-magnify"
                  density="comfortable"
                  clearable
                  hide-details
                  class="app-input"
                  placeholder="Buscar productos..."
                  @update:model-value="debouncedSearch"
                />
              </div>

              <div class="d-flex gap-2">
                <div style="flex: 1;">
                  <label class="app-input-label" for="pantry-sort-by">Ordenar por</label>
                  <v-select
                    id="pantry-sort-by"
                    v-model="itemsFilters.sort_by"
                    :items="sortOptions"
                    density="compact"
                    hide-details
                    class="app-input"
                    @update:model-value="fetchItems"
                  />
                </div>
                <div style="flex: 1;">
                  <label class="app-input-label" for="pantry-order">Dirección</label>
                  <v-select
                    id="pantry-order"
                    v-model="itemsFilters.order"
                    :items="orderOptions"
                    density="compact"
                    hide-details
                    class="app-input"
                    @update:model-value="fetchItems"
                  />
                </div>
              </div>
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
          <!-- Add Item Card with ProductSelectOrCreate -->
          <v-card class="card mb-4">
            <v-card-title class="pa-4 d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon class="mr-2">mdi-plus-circle-outline</v-icon>
                Añadir Producto
              </div>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <ProductSelectOrCreate
                v-model="selectedProductId"
                label="Producto"
                placeholder="Escribe para buscar o crear…"
                class="mb-3"
                :disabled="addingItem"
              />

              <!-- Quantity and unit -->
              <v-row dense class="mb-3">
                <v-col cols="6">
                  <label class="app-input-label" for="pantry-item-quantity">Cantidad</label>
                  <v-text-field
                    id="pantry-item-quantity"
                    v-model.number="newItem.quantity"
                    type="number"
                    density="comfortable"
                    hide-details
                    min="0.01"
                    step="0.01"
                    class="app-input"
                  />
                </v-col>
                <v-col cols="6">
                  <label class="app-input-label" for="pantry-item-unit">Unidad</label>
                  <v-select
                    id="pantry-item-unit"
                    v-model="newItem.unit"
                    :items="unitOptions"
                    density="comfortable"
                    hide-details
                    class="app-input"
                  />
                </v-col>
              </v-row>

              <v-btn
                color="primary"
                block
                class="btn-pill text-body-2 font-weight-medium"
                prepend-icon="mdi-plus"
                :loading="addingItem"
                :disabled="!selectedProductId"
                @click="addItem"
              >
                Añadir
              </v-btn>
            </v-card-text>
          </v-card>

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

          <!-- Actions Card -->
          <v-card class="card">
            <v-card-title class="pa-4">
              <v-icon class="mr-2">mdi-cog-outline</v-icon>
              Acciones
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <v-btn
                color="error"
                variant="outlined"
                block
                class="btn-pill text-body-2 font-weight-medium"
                prepend-icon="mdi-delete"
                @click="confirmDeletePantry"
              >
                Eliminar Despensa
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Edit Item Dialog -->
      <v-dialog v-model="editItemDialog.open" max-width="500">
        <v-card>
          <v-card-title class="text-h6 pa-4">
            Editar Producto
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="mb-3">
              <label class="app-input-label" for="edit-item-name">Nombre del producto</label>
              <v-text-field
                id="edit-item-name"
                v-model="editItemDialog.form.productName"
                density="comfortable"
                hide-details
                class="app-input"
                disabled
              />
            </div>
            <v-row dense>
              <v-col cols="6">
                <label class="app-input-label" for="edit-item-quantity">Cantidad</label>
                <v-text-field
                  id="edit-item-quantity"
                  v-model.number="editItemDialog.form.quantity"
                  type="number"
                  density="comfortable"
                  hide-details
                  class="app-input"
                />
              </v-col>
              <v-col cols="6">
                <label class="app-input-label" for="edit-item-unit">Unidad</label>
                <v-select
                  id="edit-item-unit"
                  v-model="editItemDialog.form.unit"
                  :items="unitOptions"
                  density="comfortable"
                  hide-details
                  class="app-input"
                />
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer />
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
              Guardar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Pantry Confirmation Dialog -->
      <v-dialog v-model="deleteDialog.open" max-width="500">
        <v-card>
          <v-card-title class="text-h6 pa-4">
            Eliminar Despensa
          </v-card-title>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'
import { getPantryById, updatePantry, deletePantry, sharePantry as sharePantryService, getPantrySharedUsers, revokePantryShare } from '@/services/pantries'
import { getPantryItems, addPantryItem, updatePantryItem, deletePantryItem } from '@/services/pantryItems'
import { getProfile } from '@/services/auth'
import PantryProductItem from '@/components/PantryProductItem.vue'
import ProductSelectOrCreate from '@/components/products/ProductSelectOrCreate.vue'

const route = useRoute()
const router = useRouter()

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
const selectedProductId = ref(null)
const currentUser = ref(null) // ← Usuario actual

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

// New item form
const newItem = ref({
  name: '',
  quantity: 1,
  unit: 'un'
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

async function addItem() {
  const productId = typeof selectedProductId.value === 'object' ? selectedProductId.value?.id : selectedProductId.value
  if (!productId) {
    showSnackbar('Seleccioná o creá un producto', 'error')
    return
  }

  addingItem.value = true

  try {
    const payload = {
      product: { id: Number(productId) },  // ← Backend espera product: { id: number }
      quantity: Number(newItem.value.quantity || 1),
      unit: String(newItem.value.unit || 'un'),
      metadata: {}
    }

    console.log('🎯 PantryDetail - addItem - Payload:', payload)
    const addedItem = await addPantryItem(pantry.value.id, payload)
    console.log('✅ PantryDetail - addItem - Item agregado:', addedItem)

    // Refresh items to get updated list
    console.log('🔄 PantryDetail - addItem - Refrescando lista de items...')
    await fetchItems()

    // 🔔 Disparar notificación si la despensa está compartida
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

    newItem.value = { name: '', quantity: 1, unit: 'un' }
    selectedProductId.value = null
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
  editItemDialog.value = {
    open: true,
    form: {
      id: item.id,
      productName: item.productName || item.product?.name || 'Producto',
      quantity: item.quantity,
      unit: item.unit
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
    const updated = await updatePantryItem(
      pantry.value.id,
      editItemDialog.value.form.id,
      {
        quantity: editItemDialog.value.form.quantity,
        unit: editItemDialog.value.form.unit
      }
    )

    const index = items.value.findIndex(i => i.id === editItemDialog.value.form.id)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updated }
    }

    showSnackbar('Producto actualizado', 'success')
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

// Lifecycle
onMounted(async () => {
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

/* Products list styling handled by component */
</style>
