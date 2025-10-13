<template>
  <v-card class="card card--hover pa-6 mb-4">
    <!-- Header with editable name -->
    <div class="d-flex align-center mb-4">
      <div class="flex-grow-1">
        <!-- View mode -->
        <div v-if="!editingName && !editingDescription">
          <div class="d-flex align-center">
            <h1 class="text-h4 font-weight-bold">{{ list.name }}</h1>
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
          <div v-if="list.description || editingDescription" class="d-flex align-center mt-1">
            <span class="text-body-2 text-medium-emphasis">
              {{ list.description || 'Sin descripción' }}
            </span>
            <v-btn
              icon="mdi-pencil"
              size="x-small"
              variant="text"
              class="ml-2 icon-btn-rounded"
              @click="startEditDescription"
            >
              <v-tooltip activator="parent" location="top">
                Editar descripción
              </v-tooltip>
            </v-btn>
          </div>
          <v-btn
            v-else
            size="small"
            variant="text"
            prepend-icon="mdi-plus"
            class="mt-1 btn-rounded"
            @click="startEditDescription"
          >
            Agregar descripción
          </v-btn>
        </div>

        <!-- Edit name mode -->
        <div v-if="editingName" class="mt-3">
          <label class="app-input-label" :for="`list-edit-name-${list?.id ?? 'current'}`">Nombre de la lista</label>
          <v-text-field
            :id="`list-edit-name-${list?.id ?? 'current'}`"
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
              >
                <v-tooltip activator="parent" location="top">
                  Guardar
                </v-tooltip>
              </v-btn>
              <v-btn
                icon="mdi-close"
                size="small"
                color="error"
                variant="text"
                class="icon-btn-rounded"
                @click="cancelEditName"
              >
                <v-tooltip activator="parent" location="top">
                  Cancelar
                </v-tooltip>
              </v-btn>
            </template>
          </v-text-field>
        </div>

        <!-- Edit description mode -->
        <div v-if="editingDescription" class="mt-2">
          <label class="app-input-label" :for="`list-edit-description-${list?.id ?? 'current'}`">Descripción de la lista</label>
          <v-textarea
            :id="`list-edit-description-${list?.id ?? 'current'}`"
            v-model="editDescription"
            density="comfortable"
            rows="2"
            hide-details
            class="app-input"
            autofocus
            @keyup.esc="cancelEditDescription"
          >
            <template #append>
              <v-btn
                icon="mdi-check"
                size="small"
                color="success"
                variant="text"
                class="icon-btn-rounded"
                @click="saveDescription"
              >
                <v-tooltip activator="parent" location="top">
                  Guardar
                </v-tooltip>
              </v-btn>
              <v-btn
                icon="mdi-close"
                size="small"
                color="error"
                variant="text"
                class="icon-btn-rounded"
                @click="cancelEditDescription"
              >
                <v-tooltip activator="parent" location="top">
                  Cancelar
                </v-tooltip>
              </v-btn>
            </template>
          </v-textarea>
        </div>
      </div>

      <!-- Action menu -->
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            class="icon-btn-rounded"
            v-bind="menuProps"
          >
            <v-tooltip activator="parent" location="top">
              Más acciones
            </v-tooltip>
          </v-btn>
        </template>
        <v-card class="dropdown-menu" min-width="260">
          <v-list>
            <v-list-item @click="handlePurchase">
              <template #prepend>
                <v-icon>mdi-cart-check</v-icon>
              </template>
              <v-list-item-title>Marcar como comprada</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleReset">
              <template #prepend>
                <v-icon>mdi-refresh</v-icon>
              </template>
              <v-list-item-title>Resetear lista</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleMoveToPantry">
              <template #prepend>
                <v-icon>mdi-package-variant</v-icon>
              </template>
              <v-list-item-title>Mover a despensa</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="handlePrint">
              <template #prepend>
                <v-icon>mdi-printer</v-icon>
              </template>
              <v-list-item-title>Imprimir</v-list-item-title>
            </v-list-item>
            <v-list-item @click="handleDelete" class="text-error">
              <template #prepend>
                <v-icon color="error">mdi-delete</v-icon>
              </template>
              <v-list-item-title>Eliminar lista</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>

    <!-- Progress bar -->
    <div v-if="products.length > 0" class="mb-4">
      <div class="d-flex align-center mb-2">
        <span class="text-body-2 font-weight-medium">
          Progreso: {{ purchasedCount }}/{{ products.length }}
        </span>
        <v-spacer />
        <v-chip
          v-if="list.recurring"
          size="small"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-repeat"
          class="chip-rounded"
        >
          Recurrente
        </v-chip>
      </div>
      <v-progress-linear
        :model-value="progress"
        color="success"
        height="12"
        rounded
      />
    </div>

    <!-- Loading state for items -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" />
      <p class="text-body-2 mt-2">Cargando ítems...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="products.length === 0" class="text-center py-8">
      <v-icon size="64" color="grey-lighten-1">mdi-cart-outline</v-icon>
      <p class="text-body-1 mt-2">No hay productos en esta lista</p>
      <p class="text-body-2 text-medium-emphasis">Añade productos usando el panel de la derecha</p>
    </div>

    <!-- Products list -->
    <div v-else>
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
                <label class="app-input-label filter-label" for="list-search-products">Buscar productos</label>
                <v-text-field
                  id="list-search-products"
                  v-model="searchQuery"
                  prepend-inner-icon="mdi-magnify"
                  density="compact"
                  clearable
                  hide-details
                  class="app-input"
                  placeholder="Buscar productos..."
                />
              </v-col>

              <!-- Ordenar por -->
              <v-col cols="12" sm="6" md="4">
                <label class="app-input-label filter-label" for="list-sort-by">Ordenar por</label>
                <v-select
                  id="list-sort-by"
                  v-model="sortBy"
                  :items="sortOptions"
                  density="compact"
                  hide-details
                  class="app-input"
                />
              </v-col>

              <!-- Dirección -->
              <v-col cols="12" sm="6" md="4">
                <label class="app-input-label filter-label" for="list-order">Dirección</label>
                <v-select
                  id="list-order"
                  v-model="sortOrder"
                  :items="orderOptions"
                  density="compact"
                  hide-details
                  class="app-input"
                />
              </v-col>

              <!-- Filtrar por categoría -->
              <v-col cols="12" md="4">
                <label class="app-input-label filter-label" for="list-filter-category">Filtrar por categoría</label>
                <v-select
                  id="list-filter-category"
                  v-model="selectedCategory"
                  :items="categoryFilterOptions"
                  item-title="name"
                  item-value="id"
                  prepend-inner-icon="mdi-tag"
                  density="compact"
                  hide-details
                  clearable
                  class="app-input"
                  placeholder="Todas las categorías"
                />
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </div>

      <v-divider class="mb-4" />

      <!-- Show/hide completed toggle -->
      <div class="d-flex align-center mb-3">
        <v-btn
          variant="text"
          size="small"
          class="btn-rounded"
          :prepend-icon="showCompleted ? 'mdi-eye-off' : 'mdi-eye'"
          @click="$emit('toggle-completed')"
        >
          {{ showCompleted ? 'Ocultar' : 'Mostrar' }} completados
        </v-btn>
        <v-spacer />
        <span class="text-caption text-medium-emphasis">
          {{ displayedProducts.length }} {{ displayedProducts.length === 1 ? 'producto' : 'productos' }}
        </span>
      </div>

      <!-- Products -->
      <div class="products-list">
        <template v-for="product in displayedProducts" :key="product.id">
          <ProductItem
            :product="product"
            @toggle="$emit('toggle-product', product.id)"
            @delete="$emit('delete-product', product.id)"
            @update="(updates) => $emit('update-product', product.id, updates)"
            @details="openProductDetails(product.id)"
          />
        </template>
      </div>
    </div>

    <!-- Action buttons -->
    <div v-if="products.length > 0" class="list-actions mt-4">
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-cart-check"
        class="btn-rounded"
        @click="handlePurchase"
      >
        Marcar como completa
      </v-btn>
      <v-btn
        variant="flat"
        prepend-icon="mdi-refresh"
        class="btn-rounded btn-dark-outline"
        @click="handleReset"
      >
        Resetear
      </v-btn>
      <v-btn
        variant="tonal"
        prepend-icon="mdi-printer"
        class="btn-rounded"
        @click="handlePrint"
      >
        Imprimir
      </v-btn>
    </div>

    <!-- Product Details Dialog - New Component -->
    <ProductDetailCard
      v-model="detailsDialog.open"
      :product="currentProductForDetails"
      :loading="detailsDialog.loading"
      @save="saveProductDetails"
      @delete="confirmDeleteFromDetails"
    />
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import ProductItem from './ProductItem.vue'
import ProductDetailCard from './ProductDetailCard.vue'
import { useCategoriesStore } from '@/stores/categories'
import { updateProduct as updateProductService } from '@/services/products.service'

const props = defineProps({
  list: {
    type: Object,
    required: true
  },
  products: {
    type: Array,
    default: () => []
  },
  showCompleted: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update-list-name',
  'update-list-description',
  'toggle-product',
  'delete-product',
  'update-product',
  'show-details',
  'toggle-completed',
  'reset-list',
  'purchase-list',
  'move-to-pantry',
  'print-list',
  'delete-list',
  'search-update',
  'sort-update',
  'category-filter-update'
])

const DEFAULT_CATEGORY_ICON = 'mdi-tag-outline'
const categoriesStore = useCategoriesStore()

const editingName = ref(false)
const editName = ref(props.list.name)
const editingDescription = ref(false)
const editDescription = ref(props.list.description || '')

// Details dialog state - simplified for new component
const detailsDialog = ref({
  open: false,
  loading: false,
  productId: null
})

// Current product being edited in details dialog
const currentProductForDetails = computed(() => {
  if (!detailsDialog.value.productId) return null
  return props.products.find(p => p.id === detailsDialog.value.productId)
})

// Computed
const purchasedCount = computed(() => {
  return props.products.filter(p => p.purchased).length
})

const progress = computed(() => {
  if (props.products.length === 0) return 0
  return Math.round((purchasedCount.value / props.products.length) * 100)
})

// Métodos de búsqueda y filtrado
const searchQuery = ref('')
const selectedCategory = ref(null)
const sortBy = ref('name')
const sortOrder = ref('asc')
const showFilters = ref(false) // Controlar visibilidad de filtros

// Watch para emitir cambios de filtros al padre
watch(searchQuery, (newValue) => {
  emit('search-update', newValue)
})

watch([sortBy, sortOrder], ([newSortBy, newSortOrder]) => {
  emit('sort-update', { sort_by: newSortBy, order: newSortOrder.toUpperCase() })
})

watch(selectedCategory, (newValue) => {
  // Ahora newValue es el ID de la categoría (o null)
  emit('category-filter-update', newValue)
})

const categoryFilterOptions = computed(() => {
  const storeCategories = categoriesStore.items || []
  
  // Extract categories from loaded products (in case they come from backend but aren't in store yet)
  const productCategories = []
  props.products.forEach(product => {
    const category = product.product?.category || product.category
    if (category && category.id && category.name) {
      productCategories.push(category)
    }
  })
  
  const allCategories = [...storeCategories, ...productCategories]
  
  // Deduplicate by ID
  const uniqueMap = new Map()
  allCategories.forEach(cat => {
    if (cat && cat.id && cat.name) {
      uniqueMap.set(cat.id, cat)
    }
  })
  
  return Array.from(uniqueMap.values()).sort((a, b) => 
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
  )
})

const sortOptions = [
  { title: 'Nombre', value: 'name' },
  { title: 'Cantidad', value: 'quantity' },
  { title: 'Unidad', value: 'unit' },
  { title: 'Fecha de creación', value: 'createdAt' },
]

const orderOptions = [
  { title: 'Ascendente', value: 'asc' },
  { title: 'Descendente', value: 'desc' },
]

const filteredByCompletion = computed(() => {
  if (props.showCompleted) {
    return props.products
  }
  return props.products.filter(p => !p.purchased)
})

// Solo mostramos los productos filtrados por completados
// El resto del filtrado y ordenamiento lo hace el backend
const displayedProducts = computed(() => {
  return filteredByCompletion.value
})

// Methods
function startEditName() {
  editName.value = props.list.name
  editingName.value = true
  editingDescription.value = false
}

function saveName() {
  if (editName.value.trim() && editName.value !== props.list.name) {
    emit('update-list-name', editName.value.trim())
  }
  editingName.value = false
}

function cancelEditName() {
  editName.value = props.list.name
  editingName.value = false
}

function startEditDescription() {
  editDescription.value = props.list.description || ''
  editingDescription.value = true
  editingName.value = false
}

function saveDescription() {
  const newDescription = editDescription.value.trim()
  if (newDescription !== props.list.description) {
    emit('update-list-description', newDescription)
  }
  editingDescription.value = false
}

function cancelEditDescription() {
  editDescription.value = props.list.description || ''
  editingDescription.value = false
}

function handlePurchase() {
  emit('purchase-list')
}

function handleReset() {
  emit('reset-list')
}

function handleMoveToPantry() {
  emit('move-to-pantry')
}

function handlePrint() {
  emit('print-list')
}

function handleDelete() {
  emit('delete-list')
}

// Watch for list changes
watch(() => props.list.name, (newName) => {
  editName.value = newName
})

watch(() => props.list.description, (newDescription) => {
  editDescription.value = newDescription || ''
})

onMounted(() => {
  if (!categoriesStore.items.length && !categoriesStore.loading) {
    categoriesStore.fetch().catch((error) => {
      console.error('Error fetching categories for details dialog:', error)
    })
  }
})

// Product details methods
function openProductDetails(itemId) {
  const item = props.products.find(p => p.id === itemId)
  if (!item) {
    console.warn('⚠️ Product not found:', itemId)
    return
  }

  console.log('🔍 Opening product details:', item)
  detailsDialog.value.open = true
  detailsDialog.value.loading = false
  detailsDialog.value.productId = item.id
}

async function saveProductDetails(updates) {
  detailsDialog.value.loading = true

  try {
    const item = props.products.find(p => p.id === detailsDialog.value.productId)
    if (!item) {
      throw new Error('Producto no encontrado')
    }

    console.log('💾 Saving product with updates:', updates)

    // Prepare item updates (these go to the list item)
    const itemUpdates = {
      quantity: Number(updates.quantity),
      unit: String(updates.unit),
      metadata: {
        description: updates.description || null
      }
    }

    // Prepare product updates (these go to the product entity)
    let updatedProductEntity = null
    const productEntity = item.product || {}
    const productEntityId = productEntity.id || item.productId

    if (productEntityId) {
      const productPayload = {
        name: updates.productName
      }

      // Handle category update
      if (updates.categoryId !== undefined) {
        if (updates.categoryId) {
          // Associate with category
          productPayload.category = { id: Number(updates.categoryId) }
        } else {
          // Remove category
          productPayload.category = null
        }
      }

      console.log('🔄 Updating product entity:', productEntityId, productPayload)

      try {
        updatedProductEntity = await updateProductService(productEntityId, productPayload)
        console.log('✅ Product entity updated:', updatedProductEntity)
      } catch (error) {
        console.error('❌ Error updating product entity:', error)
        // Continue with item updates even if product update fails
      }
    }

    // Emit update to parent
    emit('update-product', detailsDialog.value.productId, itemUpdates, updatedProductEntity)
    
    // Close dialog
    detailsDialog.value.open = false
  } catch (error) {
    console.error('❌ Error in saveProductDetails:', error)
    alert('Error al guardar los cambios: ' + (error.message || 'Error desconocido'))
  } finally {
    detailsDialog.value.loading = false
  }
}

function confirmDeleteFromDetails() {
  emit('delete-product', detailsDialog.value.productId)
  detailsDialog.value.open = false
}

// Exponer el método para que ProductItem pueda llamarlo
defineExpose({
  openProductDetails
})
</script>

<style scoped>
.products-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.gap-2 {
  gap: 8px;
}

.list-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

/* Botones de icono redondeados */
.icon-btn-rounded {
  border-radius: 50% !important;
}

/* Chips redondeados */
.chip-rounded {
  border-radius: 999px !important;
}

/* Menú con bordes redondeados */
/* Asegurar que los botones de texto también se vean bien */
:deep(.v-btn--variant-text) {
  border-radius: 999px !important;
}

/* Estilos para el diálogo de detalles del producto */
.dialog-card {
  border-radius: 12px;
}

.v-dialog__content {
  padding: 0;
}

/* Estilos para la sección de filtros */
.filters-section {
  background-color: #2a2a44;
  border-radius: var(--radius-md);
  border-bottom: none;
  color: #ffffff;
  box-shadow: 0 12px 32px -18px rgba(17, 19, 40, 0.32);
}

.filters-section .app-input-label,
.filters-section .filter-label,
.filters-section h4,
.filters-section p,
.filters-section span {
  color: #ffffff !important;
}

.filters-section .v-icon {
  color: #ffffff !important;
}
</style>
