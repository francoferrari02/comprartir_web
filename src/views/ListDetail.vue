<template>
  <v-container fluid class="py-8 bg-surface">
    <div class="view-shell">
      <AppBreadcrumbs :items="breadcrumbs" />

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
            @search-update="handleSearchUpdate"
            @sort-update="handleSortUpdate"
            @category-filter-update="handleCategoryFilterUpdate"
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
            :key="addItemKey"
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
          <v-card-title class="dialog-title pa-4">
            {{ confirmDialog.title }}
          </v-card-title>
          <v-card-text class="dialog-text pa-4">
            {{ confirmDialog.message }}
          </v-card-text>
          <v-card-actions class="pa-4 dialog-actions">
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
                :variant="confirmDialog.variant || 'flat'"
                class="btn-rounded dialog-confirm-btn"
                :class="confirmDialog.buttonClass"
              :loading="confirmDialog.loading"
              @click="confirmDialog.action"
            >
              {{ confirmDialog.confirmText }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete List Dialog -->
      <v-dialog v-model="deleteDialog.show" max-width="500">
        <div class="custom-dialog-card">
          <div class="custom-dialog-title">
            {{ deleteDialog.title }}
          </div>
          <div class="custom-dialog-text">
            {{ deleteDialog.message }}
          </div>
          <div class="custom-dialog-actions">
            <button 
              class="custom-dialog-btn custom-dialog-btn--cancel"
              @click="deleteDialog.show = false"
              :disabled="deleteDialog.loading"
            >
              Cancelar
            </button>
            <button 
              class="custom-dialog-btn custom-dialog-btn--delete"
              @click="deleteDialog.action"
              :disabled="deleteDialog.loading"
            >
              <span v-if="!deleteDialog.loading">{{ deleteDialog.confirmText }}</span>
              <span v-else>Eliminando...</span>
            </button>
          </div>
        </div>
      </v-dialog>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useListsStore } from '@/stores/lists'
import { useCategoriesStore } from '@/stores/categories'
import { useNotifications } from '@/composables/useNotifications'
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
  revokeShareShoppingList
} from '@/services/lists'
import { getProfile } from '@/services/auth'
import ListDetailCard from '@/components/ListDetailCard.vue'
import AddItemCard from '@/components/AddItemCard.vue'
import ShareListCard from '@/components/ShareListCard.vue'
import AppBreadcrumbs from '@/components/AppBreadcrumbs.vue'

const route = useRoute()
const router = useRouter()
const listsStore = useListsStore()

const breadcrumbs = computed(() => [
  { title: 'Inicio', to: { name: 'home' } },
  { title: 'Listas', to: { name: 'lists' } },
  { title: list.value?.name || 'Detalle' }
])

// Composables
const {
  notifyListShared,
  notifyItemAdded,
  notifyAccessRevoked
} = useNotifications()

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
const addItemKey = ref(0) // ← Key para forzar re-render del AddItemCard
const currentUser = ref(null) // ← Usuario actual

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

// Debounce timer for search
let searchDebounceTimer = null

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
  variant: 'flat',
  buttonClass: '',
  loading: false,
  action: null
})

// Delete dialog (separate for custom styling)
const deleteDialog = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Eliminar',
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
    const fetchedList = await getShoppingListById(id)
    list.value = fetchedList
    // Guardar en el store
    listsStore.setCurrentList(fetchedList)
  } catch (err) {
    console.error('Error fetching list:', err)
    error.value = err.message || 'Error al cargar la lista'
    list.value = null
    listsStore.setCurrentList(null)
  } finally {
    loading.value = false
  }
}

async function fetchItems() {
  if (!list.value) return

  console.log('🔄 fetchItems - Iniciando fetch para listId:', list.value.id)
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

    console.log('📤 fetchItems - Params:', params)
    const { data, pagination } = await getListItems(list.value.id, params)
    console.log('📥 fetchItems - Items:', data)

    const fetchedItems = Array.isArray(data) ? data : []

    console.log('✅ fetchItems - Items extraídos:', fetchedItems.length, 'items')
    console.log('📋 fetchItems - Items:', fetchedItems)

    items.value = fetchedItems
    // Guardar en el store
    listsStore.setCurrentItems(fetchedItems)

    // 🔥 Extraer categorías de los items y agregarlas al store si no existen
    const categoriesStore = useCategoriesStore()
    const extractedCategories = new Set()
    
    fetchedItems.forEach(item => {
      const category = item.product?.category
      if (category && category.id && category.name) {
        // Verificar si la categoría ya existe en el store
        const existsInStore = categoriesStore.items.some(c => c.id === category.id)
        if (!existsInStore) {
          extractedCategories.add(JSON.stringify(category))
        }
      }
    })

    // Agregar las categorías extraídas al store
    if (extractedCategories.size > 0) {
      const categoriesToAdd = Array.from(extractedCategories).map(str => JSON.parse(str))
      console.log('📦 fetchItems - Categorías extraídas de items:', categoriesToAdd)
      categoriesStore.addCategories(categoriesToAdd)
    }

    if (pagination) {
      itemsPagination.value = {
        ...itemsPagination.value,
        ...pagination
      }
      console.log('📄 fetchItems - Pagination:', itemsPagination.value)
    }
  } catch (err) {
    console.error('❌ fetchItems - Error:', err)
    error.value = err.message || 'Error al cargar los ítems'
  } finally {
    itemsLoading.value = false
  }
}

// Handlers para los eventos de filtros del componente hijo
function handleSearchUpdate(searchValue) {
  clearTimeout(searchDebounceTimer)
  searchDebounceTimer = setTimeout(() => {
    itemsFilters.value.search = searchValue || ''
    itemsPagination.value.currentPage = 1
    fetchItems()
  }, 300)
}

function handleSortUpdate(sortData) {
  itemsFilters.value.sort_by = sortData.sort_by
  itemsFilters.value.order = sortData.order
  itemsPagination.value.currentPage = 1
  fetchItems()
}

function handleCategoryFilterUpdate(categoryId) {
  console.log('🔍 handleCategoryFilterUpdate - categoryId:', categoryId)

  if (categoryId) {
    // categoryId ya es el ID numérico de la categoría
    itemsFilters.value.category_id = categoryId
    console.log('✅ Filtro aplicado con category_id:', categoryId)
  } else {
    // Limpiar el filtro
    delete itemsFilters.value.category_id
    console.log('🧹 Filtro de categoría limpiado')
  }

  itemsPagination.value.currentPage = 1
  fetchItems()
}

async function fetchSharedUsers() {
  if (!list.value) return

  try {
    const response = await getSharedUsers(list.value.id)
    sharedUsers.value = Array.isArray(response) ? response : (response?.data ?? [])
  } catch (err) {
    console.error('Error fetching shared users:', err)
  }
}

async function updateListName(newName) {
  if (!list.value || !newName.trim()) return

  try {
    const updated = await updateShoppingList(list.value.id, { name: newName.trim() })
    list.value = { ...list.value, ...updated }
    listsStore.setCurrentList(list.value)
    showSnackbar('Lista actualizada', 'success')
  } catch (err) {
    console.error('Error updating list:', err)
    error.value = err.message || 'Error al actualizar la lista'
  }
}

async function updateListDescription(newDescription) {
  if (!list.value) return

  try {
    const trimmed = newDescription?.trim() || ' '
    const updated = await updateShoppingList(list.value.id, { description: trimmed })
    list.value = { ...list.value, ...updated }
    listsStore.setCurrentList(list.value)
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

    // Actualizar el store global para que el Resumen reaccione
    listsStore.localToggleItem(list.value.id, itemId, updated.purchased ?? !item.purchased)

  } catch (err) {
    console.error('Error toggling item:', err)
    error.value = err.message || 'Error al actualizar el ítem'
  }
}

async function updateProduct(itemId, updates, updatedProductEntity = null) {
  try {
    const itemPayload = updates || {}
    const updated = await updateListItem(list.value.id, itemId, itemPayload)

    // Si se actualizó la categoría, refrescar la lista completa para obtener datos actualizados
    if (updatedProductEntity?.category !== undefined) {
      console.log('🔄 Categoría actualizada, refrescando items desde el servidor...')
      await fetchItems()
      showSnackbar('Ítem actualizado', 'success')
      return
    }

    // Update local state
    const index = items.value.findIndex(i => i.id === itemId)
    if (index !== -1) {
      const current = items.value[index]
      const mergedProduct = (() => {
        if (updatedProductEntity) {
          return { ...current.product, ...updatedProductEntity }
        }
        if (updated?.product) {
          return { ...current.product, ...updated.product }
        }
        return current.product
      })()

      const mergedItem = {
        ...current,
        ...updated,
        product: mergedProduct ?? current.product
      }

      if (updatedProductEntity?.name) {
        mergedItem.productName = updatedProductEntity.name
      } else if (!mergedItem.productName) {
        mergedItem.productName = mergedItem.product?.name ?? current.productName ?? null
      }

      if (updatedProductEntity?.category) {
        if (mergedItem.product) {
          mergedItem.product = {
            ...mergedItem.product,
            category: updatedProductEntity.category
          }
        }
        mergedItem.category = updatedProductEntity.category
      }

      items.value[index] = mergedItem
      listsStore.updateItem(itemId, mergedItem)
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

    // Actualizar el store global
    listsStore.removeItem(itemId)

    showSnackbar('Ítem eliminado', 'success')
  } catch (err) {
    console.error('Error deleting item:', err)
    error.value = err.message || 'Error al eliminar el ítem'
  }
}

async function addItem(itemData) {
  console.log('🎯 addItem - itemData recibido:', itemData)

  if (!itemData) return

  // productId requerido
  const productId = typeof itemData.productId === 'object' ? itemData.productId?.id : itemData.productId
  if (!productId) {
    console.error('❌ addItem - Falta productId en itemData')
    showSnackbar('Seleccioná o creá un producto', 'error')
    return
  }

  console.log('🔑 addItem - productId extraído:', productId)
  console.log('🏷️ addItem - categoryId recibido:', itemData.categoryId)
  console.log('🏷️ addItem - categoryKey recibido:', itemData.categoryKey)

  addingItem.value = true

  try {
    // 🔥 PASO 1: Si hay categoría, actualizar el producto primero
    // PERO solo si el producto fue seleccionado de la lista (no recién creado)
    // Cuando se crea desde ProductSelectOrCreate, ya tiene la categoría asignada
    if ((itemData.categoryId || itemData.categoryKey) && !itemData.isNewlyCreated) {
      console.log('📦 addItem - ⚡ ENTRANDO A ACTUALIZAR CATEGORÍA DEL PRODUCTO')
      console.log('📦 addItem - Datos de categoría:', {
        categoryId: itemData.categoryId,
        categoryKey: itemData.categoryKey
      })

      try {
        const { updateProduct, getProduct } = await import('@/services/products.service')
        const { ensureCategoryByKey } = await import('@/services/categories')

        // Primero, obtener el producto para tener su nombre
        console.log('🔍 addItem - Obteniendo producto completo para extraer nombre...')
        const currentProduct = await getProduct(productId)
        console.log('✅ addItem - Producto obtenido:', currentProduct)
        const productName = currentProduct.name

        if (!productName) {
          console.error('❌ addItem - No se pudo obtener el nombre del producto')
          throw new Error('Product name not found')
        }

        let categoryPayload = null

        if (itemData.categoryId) {
          categoryPayload = { id: Number(itemData.categoryId) }
          console.log('✅ addItem - Usando categoryId:', categoryPayload)
        } else if (itemData.categoryKey) {
          // Resolver la categoría por su key
          console.log('🔍 addItem - Resolviendo categoryKey:', itemData.categoryKey)
          const category = await ensureCategoryByKey(itemData.categoryKey)
          if (category?.id) {
            categoryPayload = { id: Number(category.id) }
            console.log('✅ addItem - CategoryKey resuelto a ID:', categoryPayload)
          }
        }

        if (categoryPayload) {
          console.log('🔄 addItem - Llamando updateProduct con:', {
            productId,
            payload: { name: productName, category: categoryPayload }
          })
          const updatedProduct = await updateProduct(productId, { 
            name: productName,  // ✅ INCLUIR EL NOMBRE (requerido por la API)
            category: categoryPayload 
          })
          console.log('✅ addItem - Producto actualizado exitosamente:', updatedProduct)
          console.log('✅ addItem - Categoría del producto actualizado:', updatedProduct.category)
        } else {
          console.warn('⚠️ addItem - No se pudo construir categoryPayload')
        }
      } catch (catError) {
        console.error('❌ addItem - Error al actualizar categoría del producto:', catError)
        console.error('❌ addItem - Error stack:', catError.stack)
        // Continuar de todas formas
      }
    } else if (itemData.isNewlyCreated) {
      console.log('✅ addItem - Producto recién creado, categoría ya asignada en ensureProduct')
    } else {
      console.log('⚠️ addItem - No se recibió categoryId ni categoryKey')
    }

    // 🔥 PASO 2: Agregar el item a la lista
    const payload = {
      product: { id: Number(productId) },
      quantity: Number(itemData.quantity ?? 1),
      unit: String(itemData.unit ?? 'un'),
      metadata: itemData.metadata ?? {}
    }

    console.log('📦 addItem - Payload final que se enviará:', payload)

    const newItem = await addListItem(list.value.id, payload)
    console.log('✅ addItem - Item creado exitosamente:', newItem)

    // Refresh items to get updated list with proper product data
    await fetchItems()

    // 🔔 Disparar notificación si la lista está compartida
    if (list.value.sharedWith && list.value.sharedWith.length > 0) {
      const productName = newItem.product?.name || newItem.productName || 'Producto'
      notifyItemAdded(
        productName,
        list.value.name,
        list.value.id,
        currentUser.value?.name || 'Un usuario',
        'list'
      )
      console.log('📬 Notificación enviada: Item agregado a lista compartida')
    }

    // Force reset del form component
    addItemQuery.value = ''
    addItemKey.value++ // ← Forzar re-render para limpiar completamente el form

    showSnackbar('Producto añadido a la lista', 'success')
  } catch (err) {
    console.error('❌ addItem - Error:', err)

    // Si es un 409 (item ya existe), actualizar la lista de todas formas
    if (err.response?.status === 409) {
      await fetchItems()
      addItemKey.value++
      showSnackbar('Este producto ya está en la lista', 'warning')
    } else {
      const errorMsg = err.response?.data?.message || err.message || 'Error al añadir el ítem'
      showSnackbar(errorMsg, 'error')
    }
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
    await revokeShareShoppingList(list.value.id, userId)

    // 🔔 Disparar notificación de acceso revocado
    notifyAccessRevoked(list.value.name, 'list')
    console.log('📬 Notificación enviada: Acceso revocado')

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
    variant: 'flat',
    buttonClass: '',
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
    color: '#2a2a44',
    variant: 'flat',
    buttonClass: 'dialog-confirm-btn--reset',
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
    variant: 'flat',
    buttonClass: '',
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
  deleteDialog.value = {
    show: true,
    title: '',
    message: `¿Estás sfjnaonvoafnvoaguro de que deseas eliminar la lista "${list.value.name}"? Esta acción no se puede deshacer.`,
    confirmText: 'Eliminar',
    loading: false,
    action: executeDeleteList
  }
}

async function executeDeleteList() {
  deleteDialog.value.loading = true

  try {
    await deleteShoppingList(list.value.id)
    deleteDialog.value.show = false
    showSnackbar('Lista eliminada', 'success')
    router.push('/lists')
  } catch (err) {
    console.error('Error deleting list:', err)
    error.value = err.message || 'Error al eliminar la lista'
  } finally {
    deleteDialog.value.loading = false
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
onMounted(async () => {
  // Cargar usuario actual
  try {
    currentUser.value = await getProfile()
  } catch (err) {
    console.error('Error loading user profile:', err)
    // Fallback: intentar obtener del localStorage
    currentUser.value = JSON.parse(localStorage.getItem('user') || '{}')
  }

  // Cargar categorías del usuario para filtros y selección
  const categoriesStore = useCategoriesStore()
  if (!categoriesStore.items || categoriesStore.items.length === 0) {
    await categoriesStore.fetchCategories()
  }

  // Cargar lista y sus items
  await fetchList()
  if (list.value) {
    await Promise.all([fetchItems(), fetchSharedUsers()])
  }
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

@media print {
  .right-col {
    display: none;
  }
}

/* Estilos para el card de los diálogos de confirmación */
.dialog-card {
  border-radius: 16px;
}

.dialog-card .dialog-title {
  letter-spacing: 0.2px;
  font-size: 1rem !important;
  font-weight: 700 !important;
  line-height: 1.5 !important;
  color: rgba(0, 0, 0, 0.87) !important;
}

.dialog-card .dialog-text {
  line-height: 1.5 !important;
  font-size: 0.875rem !important;
  color: rgba(0, 0, 0, 0.6) !important;
}

.dialog-actions {
  gap: 12px;
}

.btn-rounded.dialog-confirm-btn {
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

.btn-rounded.dialog-confirm-btn.dialog-confirm-btn--reset {
  background-color: #ffffff !important;
  color: #2a2a44 !important;
  border: 1px solid #2a2a44 !important;
  box-shadow: none !important;
}

.btn-rounded.dialog-confirm-btn.dialog-confirm-btn--reset:hover,
.btn-rounded.dialog-confirm-btn.dialog-confirm-btn--reset:focus-visible {
  background-color: rgba(42, 42, 68, 0.08) !important;
}

.btn-rounded.dialog-confirm-btn.dialog-confirm-btn--delete {
  background-color: #ffffff !important;
  color: #FF5252 !important;
  border: 1px solid #FF5252 !important;
  box-shadow: none !important;
  font-weight: 600 !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

.btn-rounded.dialog-confirm-btn.dialog-confirm-btn--delete:hover,
.btn-rounded.dialog-confirm-btn.dialog-confirm-btn--delete:focus-visible {
  background-color: rgba(255, 82, 82, 0.08) !important;
}

/* Custom Delete Dialog - Sin clases de Vuetify */
.custom-dialog-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2),
              0 24px 38px 3px rgba(0, 0, 0, 0.14),
              0 9px 46px 8px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

.custom-dialog-title {
  padding: 16px;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.5;
  letter-spacing: 0.2px;
  color: rgba(0, 0, 0, 0.87);
}

.custom-dialog-text {
  padding: 16px;
  padding-top: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.6);
}

.custom-dialog-actions {
  padding: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.custom-dialog-btn {
  padding: 8px 24px;
  border-radius: 24px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
  text-transform: none;
  letter-spacing: normal;
  font-family: inherit;
}

.custom-dialog-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.custom-dialog-btn--cancel {
  background: transparent;
  color: rgba(0, 0, 0, 0.6);
}

.custom-dialog-btn--cancel:hover:not(:disabled) {
  background-color: rgba(0, 0, 0, 0.04);
}

.custom-dialog-btn--delete {
  background-color: #ffffff;
  color: #FF5252;
  border: 1px solid #FF5252;
  box-shadow: none;
}

.custom-dialog-btn--delete:hover:not(:disabled) {
  background-color: rgba(255, 82, 82, 0.08);
}

.custom-dialog-btn--delete:focus-visible {
  background-color: rgba(255, 82, 82, 0.08);
  outline: 2px solid #FF5252;
  outline-offset: 2px;
}
</style>
