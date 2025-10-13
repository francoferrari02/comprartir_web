<template>
  <v-card class="card card--hover pa-4 mb-4">
    <v-card-title class="text-h6 font-weight-bold d-flex align-center justify-space-between">
      Añadir productos
    </v-card-title>
    <v-card-text>
      <!-- Product select/create -->
      <ProductSelectOrCreate
        v-model="selectedProductId"
        label="Producto"
        placeholder="Escribe para buscar o crear…"
        class="mb-3"
        :disabled="loading"
        :category-key="selectedCategoryKey"
        :category-id="selectedCategoryId"
        @product-selected="onProductSelected"
        @created="onProductCreated"
      />

      <div class="mb-3">
        <label class="app-input-label" for="add-item-category">Categoría</label>
        <v-autocomplete
          id="add-item-category"
          v-model="selectedCategoryValue"
          :items="categoryOptions"
          item-value="value"
          clearable
          density="comfortable"
          placeholder="Seleccioná una categoría"
          :loading="loadingCategories || creatingCategory"
          :disabled="loadingCategories"
          v-model:search="categorySearch"
          class="app-input"
        >
          <template #selection="{ item }">
            <div class="d-flex align-center" style="gap: 8px;">
              <v-icon v-if="item?.raw?.icon" size="18" color="#2a2a44">{{ item.raw.icon }}</v-icon>
              <span>{{ item?.raw?.title }}</span>
            </div>
          </template>
          <template #item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.title">
              <template #prepend>
                <v-icon v-if="item.raw.icon" color="#2a2a44">{{ item.raw.icon }}</v-icon>
              </template>
            </v-list-item>
          </template>
          <template #append-item>
            <v-divider v-if="canCreateCategory" class="my-2" />
            <v-list-item
              v-if="canCreateCategory"
              :disabled="creatingCategory"
              class="create-category-item"
              @click="createCategoryFromSearch"
            >
              <template #prepend>
                <v-icon color="primary">mdi-plus-circle</v-icon>
              </template>
              <v-list-item-title>
                Crear categoría "{{ categorySearch.trim() }}"
              </v-list-item-title>
            </v-list-item>
          </template>
        </v-autocomplete>
        <p class="text-caption text-medium-emphasis mt-1">Podés dejarla vacía o crear una nueva categoría.</p>
      </div>

      <!-- Quantity and unit -->
      <div class="d-flex gap-2 mb-3">
        <div style="max-width: 120px; width: 100%;">
          <label class="app-input-label" for="add-item-quantity">Cantidad</label>
          <v-text-field
            id="add-item-quantity"
            v-model.number="quantity"
            type="number"
            density="comfortable"
            hide-details
            min="0.01"
            step="0.01"
            class="app-input"
          />
        </div>
        <div class="flex-grow-1">
          <label class="app-input-label" for="add-item-unit">Unidad</label>
          <v-select
            id="add-item-unit"
            v-model="unit"
            :items="units"
            density="comfortable"
            hide-details
            class="app-input"
          />
        </div>
      </div>

      <!-- Add button -->
      <v-btn
        block
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="btn-rounded"
        :disabled="!selectedProductId"
        :loading="loading"
        @click="addProduct"
      >
        Añadir a la lista
      </v-btn>

      <!-- Quick add suggestions -->
      <div v-if="recentProducts && recentProducts.length" class="mt-4">
        <div class="text-caption text-medium-emphasis mb-2">Agregados recientemente</div>
        <v-chip
          v-for="product in recentProducts"
          :key="product.id"
          class="ma-1 chip-rounded"
          size="small"
          variant="outlined"
          @click="quickAdd(product)"
        >
          <v-icon start size="small">mdi-plus-circle-outline</v-icon>
          {{ product.name }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import ProductSelectOrCreate from '@/components/products/ProductSelectOrCreate.vue'
import { useCategoriesStore } from '@/stores/categories'
import { createCategory } from '@/services/categories'

const props = defineProps({
  loading: { type: Boolean, default: false },
  recentProducts: { type: Array, default: () => [] }
})

const emit = defineEmits(['add-item'])

const DEFAULT_CATEGORY_ICON = 'mdi-tag-outline'
const categoriesStore = useCategoriesStore()

const selectedProductId = ref(null)
const selectedCategoryValue = ref(null)
const categorySearch = ref('')
const quantity = ref(1)
const unit = ref('un')
const isProductNewlyCreated = ref(false) // Track if product was just created

const creatingCategory = ref(false)
const loadingCategories = computed(() => categoriesStore.loading)
const extraCategories = ref([])

const mergedCategories = computed(() => {
  const map = new Map()

  const addCategory = (category) => {
    if (!category || !category.name) return
    const name = category.name.trim()
    if (!name) return
    
    // Usar ID como key si existe, sino usar nombre en minúsculas
    const mapKey = category.id ? `id:${category.id}` : name.toLowerCase()
    const existing = map.get(mapKey)
    
    const icon = category.icon || category.metadata?.icon || existing?.icon || DEFAULT_CATEGORY_ICON
    const keyValue = category.metadata?.key ?? category.key ?? existing?.keyValue ?? null
    const categoryId = category.id ?? existing?.id ?? null
    
    const payload = {
      name,
      icon,
      keyValue,
      id: categoryId,
    }

    map.set(mapKey, payload)
  }

  // Usar categorías del store y extras (de productos)
  const storeCategories = categoriesStore.items || []
  console.log('🔍 AddItemCard - Categorías del store:', storeCategories)
  storeCategories.forEach(cat => addCategory(cat))
  extraCategories.value.forEach(cat => addCategory(cat))

  const result = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }))
  console.log('🔍 AddItemCard - Categorías mergeadas:', result)
  return result
})

const categoryOptions = computed(() => {
  const options = mergedCategories.value.map(cat => {
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
  console.log('🔍 AddItemCard - Category options construidas:', options)
  return options
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

const units = [
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

onMounted(async () => {
  // Cargar categorías si no están ya cargadas
  if (!categoriesStore.items.length && !categoriesStore.loading) {
    await categoriesStore.fetch()
  }
})

async function addProduct() {
  if (!selectedProductId.value) return

  console.log('➕ AddItemCard - selectedCategoryValue:', selectedCategoryValue.value)
  console.log('➕ AddItemCard - selectedCategoryData:', selectedCategoryData.value)

  // Preparar datos de categoría si existe selección
  let categoryData = null
  if (selectedCategoryValue.value && selectedCategoryData.value) {
    // El selectedCategoryData ya tiene id y key extraídos correctamente
    const catId = selectedCategoryData.value.id
    const catKey = selectedCategoryData.value.key
    
    if (catId) {
      // Categoría existente con ID
      categoryData = {
        categoryId: catId
      }
      console.log('✅ AddItemCard - Usando categoryId:', catId)
    } else if (catKey) {
      // Categoría por key
      categoryData = {
        categoryKey: catKey
      }
      console.log('✅ AddItemCard - Usando categoryKey:', catKey)
    }
  } else {
    console.log('⚠️ AddItemCard - No hay categoría seleccionada')
  }

  const itemToEmit = {
    productId: selectedProductId.value,
    quantity: quantity.value || 1,
    unit: unit.value || 'un',
    metadata: {},
    isNewlyCreated: isProductNewlyCreated.value, // Mark if product was just created
    ...(categoryData || {})
  }

  console.log('➕ AddItemCard - Emitiendo item con datos completos:', itemToEmit)

  emit('add-item', itemToEmit)

  // Reset form
  selectedProductId.value = null
  selectedCategoryValue.value = null
  categorySearch.value = ''
  quantity.value = 1
  unit.value = 'un'
  isProductNewlyCreated.value = false // Reset flag
}

function quickAdd(product) {
  const id = typeof product === 'object' ? product?.id : product
  if (!id) return
  selectedProductId.value = id
  addProduct()
}

function onProductSelected(product) {
  console.log('📦 AddItemCard - Producto seleccionado (existente):', product)
  isProductNewlyCreated.value = false // Producto existente, NO recién creado
  
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

function onProductCreated(product) {
  console.log('🆕 AddItemCard - Producto CREADO (nuevo):', product)
  isProductNewlyCreated.value = true // Producto recién creado
  
  // Mismo comportamiento que onProductSelected para categoría
  if (!product) {
    selectedCategoryValue.value = null
    return
  }
  if (!product.category) {
    console.log('⚠️ AddItemCard - Producto creado pero sin categoría')
    selectedCategoryValue.value = null
    return
  }

  const normalized = normalizeProductCategory(product.category)
  if (!normalized) {
    selectedCategoryValue.value = null
    return
  }

  console.log('✅ AddItemCard - Producto creado CON categoría:', normalized)
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

    console.log('✅ Categoría creada:', newCategory)

    const saved = {
      id: newCategory?.id ?? null,
      name: newCategory?.name ?? name,
      icon: newCategory?.metadata?.icon || DEFAULT_CATEGORY_ICON,
      key: newCategory?.metadata?.key ?? null,
    }

    // Refrescar el store para que la categoría aparezca en todos los componentes
    await categoriesStore.fetch()

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
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
</script>

<style scoped>
.gap-2 { gap: 8px; }
.chip-rounded { border-radius: 16px; }
.create-category-item { cursor: pointer; }
</style>
