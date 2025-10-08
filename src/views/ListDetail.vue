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
        <p class="text-body-1 mt-4">Cargando lista...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="!list" class="text-center py-16">
        <v-icon size="80" color="error" class="mb-4">
          mdi-alert-circle-outline
        </v-icon>
        <h2 class="text-h5 mb-4">Lista no encontrada</h2>
        <v-btn color="primary" @click="$router.push('/lists')">Volver a Listas</v-btn>
      </div>

      <!-- List Content -->
      <v-row v-else>
        <!-- Columna izquierda: Detalle de la lista -->
        <v-col cols="12" md="8" class="left-col">
          <ListDetailCard
            :list="list"
            :products="items"
            :show-completed="showCompleted"
            :loading="itemsLoading"
            @toggle-completed="showCompleted = !showCompleted"
            @update-list-name="updateListName"
            @update-list-description="updateListDescription"
            @toggle-product="toggleProduct"
            @delete-product="deleteProduct"
            @update-product="updateProduct"
            @show-details="showProductDetails"
            @reset-list="confirmReset"
            @purchase-list="confirmPurchase"
            @move-to-pantry="confirmMoveToPantry"
            @print-list="printList"
            @delete-list="confirmDeleteList"
          />

          <!-- Pagination for items -->
          <v-card v-if="itemsPagination.totalPages > 1" class="mt-4">
            <v-divider />
            <div class="d-flex justify-space-between align-center pa-4">
              <div class="text-body-2 text-medium-emphasis">
                Mostrando {{ startItem }} - {{ endItem }} de {{ itemsPagination.totalItems }} ítems
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
          <AddItemCard
            v-model="addItemQuery"
            :loading="addingItem"
            @add-item="addItem"
          />

          <ShareListCard
            class="mt-4"
            :list-id="list.id"
            :shared-users="sharedUsers"
            :loading="sharingLoading"
            @share="shareList"
            @revoke="revokeAccess"
          />
        </v-col>
      </v-row>

      <!-- Confirmation Dialogs -->
      <v-dialog v-model="confirmDialog.show" max-width="500">
        <v-card class="dialog-card">
          <v-card-title class="text-h6 pa-4">
            {{ confirmDialog.title }}
          </v-card-title>
          <v-card-text class="pa-4">
            {{ confirmDialog.message }}
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              variant="text"
              class="btn-rounded"
              @click="confirmDialog.show = false"
            >
              Cancelar
            </v-btn>
            <v-btn
              :color="confirmDialog.color"
              variant="flat"
              class="btn-rounded"
              :loading="confirmDialog.loading"
              @click="confirmDialog.action"
            >
              {{ confirmDialog.confirmText }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  purchaseShoppingList,
  resetShoppingList,
  moveToPantry,
  getListItems,
  addListItem,
  updateListItem,
  toggleItemPurchased,
  deleteListItem,
  shareShoppingList,
  getSharedUsers,
  revokeShare
} from '@/services/lists'
import ListDetailCard from '@/components/ListDetailCard.vue'
import AddItemCard from '@/components/AddItemCard.vue'
import ShareListCard from '@/components/ShareListCard.vue'

const route = useRoute()
const router = useRouter()

// State
const loading = ref(true)
const itemsLoading = ref(false)
const addingItem = ref(false)
const sharingLoading = ref(false)
const error = ref(null)
const list = ref(null)
const items = ref([])
const sharedUsers = ref([])
const showCompleted = ref(true)
const addItemQuery = ref('')

// Pagination for items
const itemsPagination = ref({
  currentPage: 1,
  perPage: 50,
  totalPages: 1,
  totalItems: 0
})

// Filters for items
const itemsFilters = ref({
  search: '',
  purchased: null,
  category_id: null,
  pantry_id: null,
  sort_by: 'createdAt',
  order: 'ASC'
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Confirmation dialog
const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirmar',
  color: 'primary',
  loading: false,
  action: null
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

// Methods
async function fetchList() {
  loading.value = true
  error.value = null

  try {
    const id = route.params.id
    list.value = await getShoppingListById(id)
  } catch (err) {
    console.error('Error fetching list:', err)
    error.value = err.message || 'Error al cargar la lista'
    list.value = null
  } finally {
    loading.value = false
  }
}

async function fetchItems() {
  if (!list.value) return

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

    if (itemsFilters.value.purchased !== null) {
      params.purchased = itemsFilters.value.purchased
    }
    if (itemsFilters.value.category_id) {
      params.category_id = itemsFilters.value.category_id
    }
    if (itemsFilters.value.pantry_id) {
      params.pantry_id = itemsFilters.value.pantry_id
    }

    const response = await getListItems(list.value.id, params)

    items.value = response.data || []
    if (response.pagination) {
      itemsPagination.value = {
        ...itemsPagination.value,
        ...response.pagination
      }
    }
  } catch (err) {
    console.error('Error fetching items:', err)
    error.value = err.message || 'Error al cargar los ítems'
  } finally {
    itemsLoading.value = false
  }
}

async function fetchSharedUsers() {
  if (!list.value) return

  try {
    const response = await getSharedUsers(list.value.id)
    sharedUsers.value = response.data || []
  } catch (err) {
    console.error('Error fetching shared users:', err)
  }
}

async function updateListName(newName) {
  if (!list.value || !newName.trim()) return

  try {
    const updated = await updateShoppingList(list.value.id, { name: newName.trim() })
    list.value = { ...list.value, ...updated }
    showSnackbar('Lista actualizada', 'success')
  } catch (err) {
    console.error('Error updating list:', err)
    error.value = err.message || 'Error al actualizar la lista'
  }
}

async function updateListDescription(newDescription) {
  if (!list.value || !newDescription.trim()) return

  try {
    const updated = await updateShoppingList(list.value.id, { description: newDescription.trim() })
    list.value = { ...list.value, ...updated }
    showSnackbar('Descripción de lista actualizada', 'success')
  } catch (err) {
    console.error('Error updating list description:', err)
    error.value = err.message || 'Error al actualizar la descripción de la lista'
  }
}

async function toggleProduct(itemId) {
  const item = items.value.find(i => i.id === itemId)
  if (!item) return

  try {
    const updated = await toggleItemPurchased(list.value.id, itemId, !item.purchased)
    // Update local state
    const index = items.value.findIndex(i => i.id === itemId)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updated }
    }
  } catch (err) {
    console.error('Error toggling item:', err)
    error.value = err.message || 'Error al actualizar el ítem'
  }
}

async function updateProduct(itemId, updates) {
  try {
    const updated = await updateListItem(list.value.id, itemId, updates)
    // Update local state
    const index = items.value.findIndex(i => i.id === itemId)
    if (index !== -1) {
      items.value[index] = { ...items.value[index], ...updated }
    }
    showSnackbar('Ítem actualizado', 'success')
  } catch (err) {
    console.error('Error updating item:', err)
    error.value = err.message || 'Error al actualizar el ítem'
  }
}

async function deleteProduct(itemId) {
  try {
    await deleteListItem(list.value.id, itemId)
    // Remove from local state
    items.value = items.value.filter(i => i.id !== itemId)
    itemsPagination.value.totalItems--
    showSnackbar('Ítem eliminado', 'success')
  } catch (err) {
    console.error('Error deleting item:', err)
    error.value = err.message || 'Error al eliminar el ítem'
  }
}

async function addItem(itemData) {
  if (!itemData) return

  // Validate that we have either product_id or product name
  if (!itemData.product_id && !itemData.name?.trim() && !itemData.productName?.trim()) {
    showSnackbar('Debes seleccionar un producto', 'error')
    return
  }

  addingItem.value = true

  try {
    const payload = {
      quantity: itemData.quantity || 1,
      unit: itemData.unit || 'unidad',
      metadata: itemData.metadata || {}
    }

    // Use product_id if available (from ProductSelect), otherwise use product name
    if (itemData.product_id) {
      payload.product_id = itemData.product_id
    } else {
      payload.product_name = itemData.name?.trim() || itemData.productName?.trim()
    }

    const newItem = await addListItem(list.value.id, payload)

    // Refresh items to get updated list with proper product data
    await fetchItems()

    addItemQuery.value = ''
    showSnackbar('Producto añadido a la lista', 'success')
  } catch (err) {
    console.error('Error adding item:', err)
    const errorMsg = err.response?.data?.message || err.message || 'Error al añadir el ítem'
    showSnackbar(errorMsg, 'error')
  } finally {
    addingItem.value = false
  }
}

async function shareList(email) {
  if (!email?.trim()) return

  sharingLoading.value = true

  try {
    await shareShoppingList(list.value.id, email.trim())
    await fetchSharedUsers()
    showSnackbar('Lista compartida exitosamente', 'success')
  } catch (err) {
    console.error('Error sharing list:', err)
    error.value = err.message || 'Error al compartir la lista'
  } finally {
    sharingLoading.value = false
  }
}

async function revokeAccess(userId) {
  sharingLoading.value = true

  try {
    await revokeShare(list.value.id, userId)
    sharedUsers.value = sharedUsers.value.filter(u => u.userId !== userId)
    showSnackbar('Acceso revocado', 'success')
  } catch (err) {
    console.error('Error revoking access:', err)
    error.value = err.message || 'Error al revocar el acceso'
  } finally {
    sharingLoading.value = false
  }
}

function confirmPurchase() {
  confirmDialog.value = {
    show: true,
    title: 'Marcar como comprada',
    message: '¿Estás seguro de que deseas marcar toda la lista como comprada? Esto marcará todos los ítems como comprados.',
    confirmText: 'Marcar como comprada',
    color: 'primary',
    loading: false,
    action: executePurchase
  }
}

async function executePurchase() {
  confirmDialog.value.loading = true

  try {
    await purchaseShoppingList(list.value.id)
    await fetchList()
    await fetchItems()
    confirmDialog.value.show = false
    showSnackbar('Lista marcada como comprada', 'success')
  } catch (err) {
    console.error('Error purchasing list:', err)
    error.value = err.message || 'Error al marcar como comprada'
  } finally {
    confirmDialog.value.loading = false
  }
}

function confirmReset() {
  confirmDialog.value = {
    show: true,
    title: 'Resetear lista',
    message: '¿Estás seguro de que deseas resetear la lista? Esto marcará todos los ítems como no comprados.',
    confirmText: 'Resetear',
    color: 'warning',
    loading: false,
    action: executeReset
  }
}

async function executeReset() {
  confirmDialog.value.loading = true

  try {
    await resetShoppingList(list.value.id)
    await fetchItems()
    confirmDialog.value.show = false
    showSnackbar('Lista reseteada', 'success')
  } catch (err) {
    console.error('Error resetting list:', err)
    error.value = err.message || 'Error al resetear la lista'
  } finally {
    confirmDialog.value.loading = false
  }
}

function confirmMoveToPantry() {
  confirmDialog.value = {
    show: true,
    title: 'Mover a despensa',
    message: '¿Estás seguro de que deseas mover los ítems comprados a la despensa?',
    confirmText: 'Mover a despensa',
    color: 'primary',
    loading: false,
    action: executeMoveToPantry
  }
}

async function executeMoveToPantry() {
  confirmDialog.value.loading = true

  try {
    const response = await moveToPantry(list.value.id)
    confirmDialog.value.show = false
    showSnackbar(response.message || 'Ítems movidos a la despensa', 'success')
    await fetchItems()
  } catch (err) {
    console.error('Error moving to pantry:', err)
    error.value = err.message || 'Error al mover a despensa'
  } finally {
    confirmDialog.value.loading = false
  }
}

function confirmDeleteList() {
  confirmDialog.value = {
    show: true,
    title: 'Eliminar lista',
    message: `¿Estás seguro de que deseas eliminar la lista "${list.value.name}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    color: 'error',
    loading: false,
    action: executeDeleteList
  }
}

async function executeDeleteList() {
  confirmDialog.value.loading = true

  try {
    await deleteShoppingList(list.value.id)
    confirmDialog.value.show = false
    showSnackbar('Lista eliminada', 'success')
    router.push('/lists')
  } catch (err) {
    console.error('Error deleting list:', err)
    error.value = err.message || 'Error al eliminar la lista'
  } finally {
    confirmDialog.value.loading = false
  }
}

function showProductDetails(itemId) {
  // TODO: Implement product details modal
  console.log('Show details for item:', itemId)
}

function printList() {
  window.print()
}

function onItemsPageChange(page) {
  itemsPagination.value.currentPage = page
  fetchItems()
}

function showSnackbar(message, color = 'success') {
  snackbar.value = { show: true, message, color }
}

// Watch route changes
watch(() => route.params.id, () => {
  if (route.params.id) {
    fetchList().then(() => {
      fetchItems()
      fetchSharedUsers()
    })
  }
})

// Lifecycle
onMounted(() => {
  fetchList().then(() => {
    fetchItems()
    fetchSharedUsers()
  })
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

@media print {
  .right-col {
    display: none;
  }
}

/* Estilos para los botones redondeados en los diálogos de confirmación */
.btn-rounded {
  border-radius: 24px;
}

/* Estilos para el card de los diálogos de confirmación */
.dialog-card {
  border-radius: 16px;
}
</style>
