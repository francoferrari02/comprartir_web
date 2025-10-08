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
          <v-card class="card mb-4">
            <!-- Header -->
            <v-card-title class="pa-4">
              <div class="d-flex align-center justify-space-between w-100">
                <div class="flex-grow-1">
                  <v-text-field
                    :model-value="pantry.name"
                    variant="plain"
                    density="compact"
                    class="text-h5 font-weight-bold"
                    hide-details
                    @blur="updatePantryName($event.target.value)"
                  />
                </div>
                <v-btn
                  icon="mdi-arrow-left"
                  variant="text"
                  @click="$router.push('/pantries')"
                />
              </div>
            </v-card-title>

            <v-divider />

            <!-- Buscador y filtros -->
            <div class="pa-4">
              <v-text-field
                v-model="searchQuery"
                prepend-inner-icon="mdi-magnify"
                label="Buscar productos..."
                variant="outlined"
                density="comfortable"
                clearable
                hide-details
                @update:model-value="debouncedSearch"
              />

              <div class="d-flex gap-2 mt-3">
                <v-select
                  v-model="itemsFilters.sort_by"
                  :items="sortOptions"
                  label="Ordenar por"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="fetchItems"
                />
                <v-select
                  v-model="itemsFilters.order"
                  :items="orderOptions"
                  label="Dirección"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="fetchItems"
                />
              </div>
            </div>

            <v-divider />

            <!-- Loading Items -->
            <div v-if="itemsLoading" class="text-center py-12">
              <v-progress-circular
                indeterminate
                color="primary"
                size="48"
              />
              <p class="text-body-2 mt-4">Cargando productos...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="items.length === 0" class="text-center py-12 px-4">
              <v-icon size="64" color="grey-lighten-1" class="mb-4">
                mdi-package-variant
              </v-icon>
              <h3 class="text-h6 mb-2">No hay productos</h3>
              <p class="text-body-2 text-medium-emphasis">
                {{ searchQuery ? 'No se encontraron productos con ese criterio' : 'Añade tu primer producto a esta despensa' }}
              </p>
            </div>

            <!-- Items List -->
            <div v-else class="pa-4">
              <PantryProductItem
                v-for="item in items"
                :key="item.id"
                :product="item"
                @delete="deleteItem(item.id)"
                @edit="openEditItem(item)"
                @update-name="(newName) => updateItemName(item.id, newName)"
              />
            </div>

            <!-- Pagination for items -->
            <v-divider v-if="itemsPagination.totalPages > 1" />
            <div v-if="itemsPagination.totalPages > 1" class="d-flex justify-space-between align-center pa-4">
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
                  <v-text-field
                    v-model.number="newItem.quantity"
                    label="Cantidad"
                    type="number"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    min="0.01"
                    step="0.01"
                  />
                </v-col>
                <v-col cols="6">
                  <v-select
                    v-model="newItem.unit"
                    :items="unitOptions"
                    label="Unidad"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                  />
                </v-col>
              </v-row>

              <v-btn
                color="primary"
                block
                class="btn-pill"
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
              <v-text-field
                v-model="shareEmail"
                label="Email del usuario"
                variant="outlined"
                density="comfortable"
                type="email"
                hide-details
                @keyup.enter="sharePantry"
              />
              <v-btn
                color="primary"
                block
                class="mt-3 btn-pill"
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
                class="btn-pill"
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
            <v-text-field
              v-model="editItemDialog.form.productName"
              label="Nombre del producto"
              variant="outlined"
              density="comfortable"
              hide-details
              class="mb-3"
              disabled
            />
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model.number="editItemDialog.form.quantity"
                  label="Cantidad"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  hide-details
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  v-model="editItemDialog.form.unit"
                  :items="unitOptions"
                  label="Unidad"
                  variant="outlined"
                  density="comfortable"
                  hide-details
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
import { getPantryById, updatePantry, deletePantry, sharePantry as sharePantryService, getPantrySharedUsers, revokePantryShare } from '@/services/pantries'
import { getPantryItems, addPantryItem, updatePantryItem, deletePantryItem } from '@/services/pantryItems'
import PantryProductItem from '@/components/PantryProductItem.vue'
import ProductSelectOrCreate from '@/components/products/ProductSelectOrCreate.vue'

const route = useRoute()
const router = useRouter()

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

    const response = await getPantryItems(pantry.value.id, params)

    items.value = response.data || []
    if (response.pagination) {
      itemsPagination.value = {
        ...itemsPagination.value,
        ...response.pagination
      }
    }
  } catch (err) {
    console.error('Error fetching items:', err)
    error.value = err.message || 'Error al cargar los productos'
  } finally {
    itemsLoading.value = false
  }
}

async function fetchSharedUsers() {
  if (!pantry.value) return

  try {
    const response = await getPantrySharedUsers(pantry.value.id)
    sharedUsers.value = response.data || []
  } catch (err) {
    console.error('Error fetching shared users:', err)
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

    await addPantryItem(pantry.value.id, payload)

    // Refresh items to get updated list
    await fetchItems()

    newItem.value = { name: '', quantity: 1, unit: 'un' }
    selectedProductId.value = null
    showSnackbar('Producto añadido a la despensa', 'success')
  } catch (err) {
    console.error('❌ Error adding item:', err)
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

// Lifecycle
onMounted(async () => {
  await fetchPantry()
  if (pantry.value) {
    await Promise.all([fetchItems(), fetchSharedUsers()])
  }
})
</script>

<style scoped>
.btn-pill { border-radius: 24px !important; }
.btn-rounded { border-radius: 8px !important; }
</style>
