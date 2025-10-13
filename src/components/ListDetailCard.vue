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
          {{ products.length }} {{ products.length === 1 ? 'producto' : 'productos' }}
        </span>
      </div>

      <!-- Products -->
      <div class="products-list">
        <template v-for="product in filteredProducts" :key="product.id">
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

    <!-- Product Details Dialog -->
    <v-dialog v-model="detailsDialog.open" max-width="600">
      <v-card class="dialog-card">
        <v-card-title class="text-h6 pa-4 d-flex align-center justify-space-between">
          <span>Detalles del producto</span>
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            @click="closeDetailsDialog"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4">
          <!-- Nombre del producto -->
          <div class="mb-3">
            <label class="app-input-label" for="details-product-name">Producto</label>
            <v-text-field
              id="details-product-name"
              v-model="detailsDialog.form.productName"
              density="comfortable"
              prepend-inner-icon="mdi-package-variant"
              placeholder="Nombre del producto"
              class="app-input"
            />
          </div>

          <!-- Categoría del producto -->
          <div class="mb-3">
            <label class="app-input-label" for="details-product-category">Categoría</label>
            <v-autocomplete
              id="details-product-category"
              v-model="detailsCategoryValue"
              :items="detailsCategoryOptions"
              item-title="title"
              item-value="value"
              clearable
              density="comfortable"
              placeholder="Sin categoría"
              :loading="detailsCategoriesLoading"
              class="app-input"
            >
              <template #selection="{ item }">
                <div class="d-flex align-center" style="gap: 8px;">
                  <v-icon v-if="item?.raw?.icon" size="18" color="#2a2a44">{{ item.raw.icon }}</v-icon>
                  <span>{{ item?.raw?.title }}</span>
                </div>
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="props">
                  <template #prepend>
                    <v-icon v-if="item.raw.icon" color="#2a2a44">{{ item.raw.icon }}</v-icon>
                  </template>
                  <v-list-item-title>{{ item.raw.title }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>
            <p class="text-caption text-medium-emphasis mt-1">Dejar vacío para quitar la categoría.</p>
          </div>

          <!-- Cantidad -->
          <div class="mb-3">
            <label class="app-input-label" for="details-quantity">Cantidad</label>
            <v-text-field
              id="details-quantity"
              v-model.number="detailsDialog.form.quantity"
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
            <label class="app-input-label" for="details-unit">Unidad</label>
            <v-select
              id="details-unit"
              v-model="detailsDialog.form.unit"
              :items="unitOptions"
              density="comfortable"
              prepend-inner-icon="mdi-scale-balance"
              class="app-input"
            />
          </div>

          <!-- Descripción/Notas (metadata) -->
          <div class="mb-3">
            <label class="app-input-label" for="details-description">Notas o descripción (opcional)</label>
            <v-textarea
              id="details-description"
              v-model="detailsDialog.form.description"
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
            @click="confirmDeleteFromDetails"
          >
            Eliminar
          </v-btn>

          <!-- Botones de acción a la derecha -->
          <div class="d-flex gap-2">
            <v-btn
              variant="text"
              class="btn-rounded"
              @click="closeDetailsDialog"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              class="btn-rounded"
              :loading="detailsDialog.loading"
              @click="saveProductDetails"
            >
              Guardar cambios
            </v-btn>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import ProductItem from './ProductItem.vue'
import { CATEGORY_DEFINITIONS, CATEGORY_BY_KEY, CATEGORY_KEY_BY_NAME } from '@/constants/categories'
import { useCategoriesStore } from '@/stores/categories'
import { updateProduct as updateProductService } from '@/services/products.service'
import { ensureCategoryByKey } from '@/services/categories'

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
  'delete-list'
])

const DEFAULT_CATEGORY_ICON = 'mdi-tag-outline'
const categoriesStore = useCategoriesStore()

const detailsCategoryValue = ref(null)
const extraCategories = ref([])
const detailsCategoriesLoading = computed(() => categoriesStore.loading)

const editingName = ref(false)
const editName = ref(props.list.name)
const editingDescription = ref(false)
const editDescription = ref(props.list.description || '')

// Details dialog state
const detailsDialog = ref({
  open: false,
  loading: false,
  productId: null,
  productEntityId: null,
  originalProductName: '',
  originalCategoryId: null,
  originalCategoryKey: null,
  form: {
    productName: '',
    quantity: 1,
    unit: 'un',
    description: ''
  }
})

// Unit options
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
  'botella',
  'sobre',
  'frasco'
]

const mergedCategories = computed(() => {
  const map = new Map()

  const addCategory = (category) => {
    if (!category || !category.name) return
    const name = category.name.trim()
    if (!name) return
    const key = name.toLowerCase()
    const existing = map.get(key)
    const icon = category.icon || existing?.icon || DEFAULT_CATEGORY_ICON

    map.set(key, {
      name,
      icon,
      keyValue: category.key ?? existing?.keyValue ?? null,
      id: category.id ?? existing?.id ?? null,
    })
  }

  CATEGORY_DEFINITIONS.forEach(def => addCategory({
    name: def.name,
    icon: def.icon,
    key: def.key,
  }))

  const storeCategories = categoriesStore.items || []
  storeCategories.forEach(cat => addCategory({
    name: cat.name,
    icon: cat.metadata?.icon || DEFAULT_CATEGORY_ICON,
    key: cat.metadata?.key ?? null,
    id: cat.id ?? null,
  }))

  extraCategories.value.forEach(cat => addCategory(cat))

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
})

const detailsCategoryOptions = computed(() => mergedCategories.value.map(cat => ({
  title: cat.name,
  value: cat.id ? `id:${cat.id}` : cat.keyValue ? `key:${cat.keyValue}` : `name:${slugifyName(cat.name)}`,
  icon: cat.icon || DEFAULT_CATEGORY_ICON,
  id: cat.id ?? null,
  key: cat.keyValue ?? null,
  name: cat.name,
})))

const detailsCategoryLookupByValue = computed(() => {
  const map = new Map()
  detailsCategoryOptions.value.forEach(option => {
    map.set(option.value, option)
  })
  return map
})

const detailsCategoryLookupByName = computed(() => {
  const map = new Map()
  detailsCategoryOptions.value.forEach(option => {
    map.set(option.name.toLowerCase(), option)
  })
  return map
})

const detailsSelectedCategory = computed(() => detailsCategoryLookupByValue.value.get(detailsCategoryValue.value) ?? null)

// Computed
const purchasedCount = computed(() => {
  return props.products.filter(p => p.purchased).length
})

const progress = computed(() => {
  if (props.products.length === 0) return 0
  return Math.round((purchasedCount.value / props.products.length) * 100)
})

const filteredProducts = computed(() => {
  if (props.showCompleted) {
    return props.products
  }
  return props.products.filter(p => !p.purchased)
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
  if (!item) return

  const productEntity = item.product || {}
  const productName = productEntity.name || item.productName || item.name || `Producto #${item.id}`
  const normalizedCategory = normalizeProductCategory(productEntity.category || item.category)

  detailsDialog.value.open = true
  detailsDialog.value.loading = false
  detailsDialog.value.productId = item.id
  detailsDialog.value.productEntityId = productEntity.id ?? item.productId ?? null
  detailsDialog.value.originalProductName = productName
  detailsDialog.value.originalCategoryId = normalizedCategory?.id ?? null
  detailsDialog.value.originalCategoryKey = normalizedCategory?.key ?? null
  detailsDialog.value.form = {
    productName,
    quantity: item.quantity || 1,
    unit: item.unit || 'un',
    description: item.metadata?.description || item.metadata?.notes || ''
  }

  if (normalizedCategory) {
    addExtraCategory(normalizedCategory)
    nextTick(() => {
      const option = detailsCategoryLookupByName.value.get(normalizedCategory.name.toLowerCase())
      detailsCategoryValue.value = option ? option.value : null
    })
  } else {
    detailsCategoryValue.value = null
  }
}

function closeDetailsDialog() {
  detailsDialog.value.open = false
  detailsCategoryValue.value = null
}

async function saveProductDetails() {
  detailsDialog.value.loading = true

  try {
    const itemUpdates = {
      quantity: Number(detailsDialog.value.form.quantity),
      unit: String(detailsDialog.value.form.unit),
      metadata: {
        description: detailsDialog.value.form.description || null
      }
    }

    let updatedProductEntity = null
    const productPayload = {}
    const newName = (detailsDialog.value.form.productName || '').trim()
    const originalName = (detailsDialog.value.originalProductName || '').trim()

    if (newName && newName !== originalName) {
      productPayload.name = newName
    }

    const selectedCategory = detailsSelectedCategory.value
    const originalCategoryId = detailsDialog.value.originalCategoryId ?? null
    const originalCategoryKey = detailsDialog.value.originalCategoryKey ?? null

    if (!selectedCategory) {
      if (originalCategoryId || originalCategoryKey) {
        productPayload.category = null
      }
    } else {
      const selectedId = selectedCategory.id ?? null
      const selectedKey = selectedCategory.key ?? null

      if ((selectedId ?? null) !== (originalCategoryId ?? null) || (selectedKey ?? null) !== (originalCategoryKey ?? null)) {
        if (selectedId) {
          productPayload.category = { id: Number(selectedId) }
        } else if (selectedKey) {
          const ensured = await ensureCategoryByKey(selectedKey)
          if (ensured?.id) {
            productPayload.category = { id: Number(ensured.id) }
          }
        }
      }
    }

    const hasProductChanges = Object.keys(productPayload).length > 0

    if (hasProductChanges && detailsDialog.value.productEntityId) {
      updatedProductEntity = await updateProductService(detailsDialog.value.productEntityId, productPayload)
    }

    emit('update-product', detailsDialog.value.productId, itemUpdates, updatedProductEntity)
    closeDetailsDialog()
  } catch (error) {
    console.error('Error updating product details:', error)
  } finally {
    detailsDialog.value.loading = false
  }
}

function confirmDeleteFromDetails() {
  if (confirm('¿Estás seguro de que deseas eliminar este producto de la lista?')) {
    emit('delete-product', detailsDialog.value.productId)
    closeDetailsDialog()
  }
}

function normalizeProductCategory(category) {
  if (!category) return null

  const rawName = category.name || (category.metadata?.key && CATEGORY_BY_KEY[category.metadata.key]?.name)
  const name = rawName ? rawName.trim() : null
  if (!name) return null

  const metadataKey = category.metadata?.key ?? CATEGORY_KEY_BY_NAME[name.toLowerCase()] ?? null
  const icon = category.metadata?.icon || (metadataKey && CATEGORY_BY_KEY[metadataKey]?.icon) || DEFAULT_CATEGORY_ICON
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

function slugifyName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
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
</style>
